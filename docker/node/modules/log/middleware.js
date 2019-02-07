const { getSocketName } = require("../socket");
const { getAddress } = require("../security");
const { levels } = require("./index");

const _autologLevel = Symbol("#areLogsSuppresed");

exports.getAutoLogLevel = context => context[_autologLevel] || levels.LEVEL_DEBUG;

exports.$autoLog = level => (next, socket, actionArg, context, actionName) => {
    context[_autologLevel] = level;
    return next(actionArg);
}

exports.$log = (event, messageOrFunc = null, dataOrNothing = null) => {
    return dewIt;

    async function dewIt(next, socket, actionArg, context, actionName) {
        try {
            context[_autologLevel] = levels.DISABLED;
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