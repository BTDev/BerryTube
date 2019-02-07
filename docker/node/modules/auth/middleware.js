exports.AuthException = class extends Error {
    constructor(actionName, kickOnFail) {
        super(`User is not allowed to ${actionName}`);
        this.actionName = actionName;
        this.kickOnFail = kickOnFail;
    }
};

exports.$auth = (acceptedActionList, kickOnFail = true) => 
    async (next, socket, actionArg, context, actionName) => {
        let isAllowed = false;

        if (Array.isArray(acceptedActionList)) {
            for (const action of acceptedActionList)
                isAllowed = await context.auth.canDoAsync(socket, action);
        } else {
            isAllowed = await context.auth.canDoAsync(socket, acceptedActionList);
        }

        if (!isAllowed)
            throw new exports.AuthException(actionName, kickOnFail);

        return next(actionArg);
    };