const { ServiceBase } = require("../base");
const { getSocketPropAsync, socketProps } = require("../socket");
const { actions } = require("./actions");

const getTypeAsync = async socket => parseInt(await getSocketPropAsync(socket, "type"));

exports.AuthService = class extends ServiceBase {
    constructor(services) {
        super(services);
        this.isLeader = services.isLeader;

        const anyone = () => Promise.resolve(true);

        const hasNick = async socket => {
            const nick = getSocketPropAsync(socket, socketProps.PROP_NICK);
            return typeof(nick) === "string";
        }

        const leaderOrMod = async socket =>
            this.isLeader(socket) || (await getTypeAsync(socket) > 0);

        const mod = async socket =>
            (await getTypeAsync(socket) >= 1);

        const admin = async socket =>
            (await getTypeAsync(socket) >= 2);
        
        const canControlPlaylist = leaderOrMod;

        const canControlPolls = leaderOrMod;

        const canControlVideo = isLeader
        
        this.rules = {
            [actions.ACTION_CHANGE_PASSWORD]: anyone,
            [actions.ACTION_REFRESH_PLAYLIST]: anyone,
            [actions.ACTION_REFRESH_VIDEO]: anyone,
            [actions.ACTION_REGISTER]: anyone,
            [actions.ACTION_RENEW_POSITION]: anyone,
            [actions.ACTION_SET_CHATONLY]: anyone,
            [actions.ACTION_LOGIN]: anyone,
            [actions.ACTION_SET_PLAYLIST_IS_INITIALIZED]: anyone,
            [actions.ACTION_VOTE_POLL]: anyone,

            [actions.ACTION_CHAT]: hasNick,

            [actions.ACTION_SET_VIDEO_STATE]: canControlVideo,
            [actions.ACTION_SEEK_VIDEO]: canControlVideo,

            [actions.ACTION_CLOSE_POLL]: canControlPolls,
            [actions.ACTION_CREATE_POLL]: canControlPolls,
            [actions.CAN_SEE_OBSCURED_POLLS]: canControlPolls,

            [actions.ACTION_ADD_VIDEO]: canControlPlaylist,
            [actions.ACTION_PLAY_VIDEO]: canControlPlaylist,
            [actions.ACTION_SKIP_VIDEO]: canControlPlaylist,
            [actions.ACTION_MOVE_VIDEO]: canControlPlaylist,

            [actions.ACTION_UNSET_LEADER]: leaderOrMod,

            [actions.ACTION_DELETE_VIDEO_HISTORY]: mod,
            [actions.ACTION_DELETE_VIDEO]: mod,
            [actions.ACTION_FONDLE_USER]: mod,
            [actions.ACTION_FONDLE_VIDEO]: mod,
            [actions.ACTION_RANDOMIZE_PLAYLIST]: mod,
            [actions.ACTION_SEARCH_VIDEO_HISTORY]: mod,
            [actions.ACTION_SET_LEADER]: mod,

            [actions.ACTION_BAN]: admin,
            [actions.ACTION_DEBUG_DUMP]: admin,
            [actions.ACTION_FORCE_REFRESH]: admin,
            [actions.ACTION_GET_BAN_LIST]: admin,
            [actions.ACTION_GET_FILTERS]: admin,
            [actions.ACTION_GILD]: admin,
            [actions.ACTION_KICK_USER]: admin,
            [actions.ACTION_SET_AREAS]: admin,
            [actions.ACTION_SET_FILTERS]: admin,
            [actions.ACTION_SET_OVERRIDE_CSS]: admin,
            [actions.ACTION_SET_TOGGLEABLE]: admin,
            [actions.ACTION_SHADOW_BAN]: admin,
        }
    }

    async canDoAsync(socket, action) {
        if (!this.rules.hasOwnProperty(action))
            throw new Error(`Invalid action passed into canDoAsync: ${action}`);

        return await this.rules[action](socket)
    }
}