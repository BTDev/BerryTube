const { events, doesFunctionSupressLogging, withSuppresedLogs } = require("./log");
const { AuthException } = require("./auth/middleware");
const { getSocketName } = require("./socket");

exports.use = (...middlewares) => {
	if (!middlewares.length)
		throw new Error("y tho");

	const handler = middlewares[middlewares.length - 1];
	
	let areLogsSuppresed = false;
	for (const middleware of middlewares) {
		if (!doesFunctionSupressLogging(middleware))
			continue;

		areLogsSuppresed = true;
		break;
	}

	if (areLogsSuppresed)
		withSuppresedLogs(pipeline);
	
	return pipeline;

	function pipeline(socket, actionArg, context, actionName) {
		return makeNext(0)(socket, actionArg, context, actionName)
		
		function makeNext(nextIndex) {
			const nextNext = nextIndex < (middlewares.length - 2)
				? makeNext(nextIndex + 1)(socket, actionArg, context, actionName)
				: actionArg => handler(socket, actionArg, context, actionName);

			return (_, actionArg) =>
				middlewares[nextIndex](nextNext, socket, actionArg, context, actionName);
		}
	}
}

exports.addSocketActionHandlers = function (socket, context, actions) {
	for (const actionName in actions) {
		if (!actions.hasOwnProperty(actionName))
			continue;

		exports.addSocketActionHandler(socket, context, actionName, actions[actionName]);
	}
}

/**
 * Context is an object that is threaded though the pipeline. It should contain the socket, in addition
 * to all of the services exposed by our service locator.
 */
exports.addSocketActionHandler = function (socket, context, actionName, handler) {
	const isDefaultLoggingEnabled = !doesFunctionSupressLogging(handler);

	socket.on(actionName, async (actionArg) => {
		try {
			const result = handler(socket, actionArg, context, actionName);
			
			if (result && result.then)
				await result; // <- await promise-likes so that exceptions propagate to our catch below

			if (isDefaultLoggingEnabled) {
				context.log.error(events.EVENT_SOCKET_ACTION, 
					"{nick} did {actionName}", 
					{ actionName, nick: await getSocketName(socket) });
			}
		} catch (error) {
			try {
				if ((error instanceof AuthException) && error.kickOnFail)
					context.kickForIllegalActivity(socket, `user is not allowed to ${actionName}`);

				if (isDefaultLoggingEnabled) {
					context.log.error(events.EVENT_SOCKET_ACTION, 
						"{nick} could not {actionName} because {message}", 
						{ actionName, message: error.message, nick: await getSocketName(socket) },
						error);
				}
			} catch (e) {
				console.error("The error handler threw an error! How embarrassing.")

				if (e)
					console.error(e.stack || e)
			}
		}
	});
};