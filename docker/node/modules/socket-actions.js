const { events, getAutoLogLevel, levels } = require("./log");
const { AuthException } = require("./auth/middleware");
const { getSocketName } = require("./socket");

const _resolve = Symbol("#resolve");
const _reject = Symbol("#reject");

exports.completeContext = (context, arg = null) => {
	const res = context[_resolve];
	if (!res) throw new Error(`You can only invoke completeContext on a context that has passed though a $notAsync middleware`);
	res(arg);
}

exports.rejectContext = (context, error) => {
	const rej = context[_reject];
	if (!rej) throw new Error(`You can only invoke rejectContext on a context that has passed though a $notAsync middleware`);
	rej(error);
}

exports.$catch = handler => async (next, socket, actionArg, context, actionName) => {
	try {
		return await next(actionArg);
	} catch (e) {
		return handler(e, socket, actionArg, context, actionName);
	}
}

exports.$notAsync = () => async (next, socket, actionArg, context, actionName) => {
	return new Promise((res, rej) => {
		if (context.hasOwnProperty(_resolve))
			throw new Error("Do not nest $notAsync middlewares.");

		context[_resolve] = res;
		context[_reject] = rej;

		const ret = next(actionArg);
		if (ret && ret.then)
			throw new Error("You are a dirty liar. If you opt out of async supprot, downstream handlers are no longer allowed to return promises.");
		
		delete context[_resolve];
		delete context[_reject];
	});
}

exports.use = (...middlewares) => {
	if (!middlewares.length)
		throw new Error("y tho");

	const handler = middlewares[middlewares.length - 1];
	
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
exports.addSocketActionHandler = function (socket, baseContext, actionName, handler) {
	socket.on(actionName, async (actionArg) => {
		let logLevel = levels.LEVEL_DEBUG;

		try {
			const context = Object.create(baseContext);
			const result = handler(socket, actionArg, context, actionName);
			logLevel = getAutoLogLevel(context);

			if (result && result.then)
				await result; // <- await promise-likes so that exceptions propagate to our catch below

			if (logLevel <= levels.LEVEL_INFORMATION) {
				context.log.info(events.EVENT_SOCKET_ACTION, 
					"{nick} did {actionName}", 
					{ actionName, nick: await getSocketName(socket) });
			}
		} catch (error) {
			try {
				if ((error instanceof AuthException) && error.kickOnFail)
					context.kickForIllegalActivity(socket, `user is not allowed to ${actionName}`);

				if (logLevel <= levels.LEVEL_ERROR) {
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