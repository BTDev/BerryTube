const { ServiceBase } = require("../base");
const { getSocketPropAsync } = require("../socket");
const { actions } = require("./actions");

const getTypeAsync = async socket => parseInt(await getSocketPropAsync(socket));

exports.AuthService = class extends ServiceBase {
    constructor({ isLeader }) {
        super({ });
        this.isLeader = isLeader;

        const leaderOrMod = async socket =>
            this.isLeader(socket) || (await getTypeAsync(socket) > 0);

        const admin = async socket =>
            (await getTypeAsync(socket) >= 2);

        const anyone = () => Promise.resolve(true);
        
        this.rules = {
            [actions.ACTION_CREATE_POLL]: leaderOrMod,
            [actions.ACTION_CLOSE_POLL]: leaderOrMod,
            [actions.ACTION_VOTE_POLL]: anyone,

            [actions.CAN_SEE_OBSCURED_POLLS]: leaderOrMod,

            [actions.ACTION_SET_TOGGLEABLE]: admin
        }
    }

    async canDoAsync(socket, action) {
        if (!this.rules.hasOwnProperty(action))
            throw new Error(`Invalid action passed into canDoAsync: ${action}`);

        return this.rules[action](socket)
    }
}