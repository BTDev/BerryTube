const { getSocketName } = require("../socket");
const { getAddress } = require("../security");

const _areLogsSuppresed = Symbol("#areLogsSuppresed");

exports.withSuppresedLogs = middleware => {
    middleware[_areLogsSuppresed] = true;
    return middleware;
}

exports.doesFunctionSupressLogging = middleware => middleware[_areLogsSuppresed];

exports.$log = (event, messageOrFunc = null, dataOrNothing = null) => {
    dewIt[_areLogsSuppresed] = true;
    return dewIt;

    async function dewIt(next, socket, actionArg, context, actionName) {
        try {
            const res = await next(actionArg);
            context.log.info(event, ...getLogArgs(socket, actionArg, context, actionName))
            return res;
        }
        catch (e) {
            try {
                context.log.error(event, ...getLogArgs(socket, actionArg, context, actionName), e);
            }
            catch (e) {
                console.error("... :(");
                console.error(e.stack || e);
            }
            throw e;
        }
    }

    function getLogArgs(socket, actionArg, context, actionName) {
        if (messageOrFunc == null) {
            return ["{nick} on ip {ip} did {actionName}", {
                nick: getSocketName(socket),
                ip: getAddress(socket),
                actionName
            }];
        }

        if (typeof (messageOrFunc) === "function") {
            return messageOrFunc(socket, actionArg, context);
        }

        return [String(messageOrFunc), dataOrNothing || {}];
    }
}