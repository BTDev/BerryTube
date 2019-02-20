const { ServiceBase } = require("../base");
const { getSocketPropAsync } = require("../socket");
const { actions } = require("./actions");

exports.AuthService = class extends ServiceBase {
    constructor({ isLeader }) {
        super({ });
        this.isLeader = isLeader;
    }

    async canDoAsync(socket, action) {
        const type = parseInt(await getSocketPropAsync(socket, "type"));
        const leader = this.isLeader(socket);

        if (action == actions.ACTION_CREATE_POLL)
            return leader || type > 0;
        else if (action == actions.ACTION_CLOSE_POLL)
            return leader || type > 0;
        else if (action == actions.ACTION_VOTE_POLL)
            return true;
        else if (action == actions.CAN_SEE_OBSCURED_POLLS)
            return type > 0 || leader;

        throw new Error(`Invalid action passed into canDoAsync: ${action}`);
    }
};