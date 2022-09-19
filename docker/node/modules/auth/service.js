const { ServiceBase } = require("../base");
const { actions } = require("./actions");
const { userTypes } = require("../sessions");

exports.AuthService = class extends ServiceBase {
	constructor(services) {
		super(services);
		this.actions = {
			[actions.ACTION_ANNOUNCE]: isModOrBerry,
			[actions.ACTION_BAN]: isAdmin,
			[actions.ACTION_CALL_DRINKS]: isModOrBerry,
			[actions.ACTION_CAN_SET_CSS]: isAdmin,
			[actions.ACTION_CLOSE_POLL]: isModOrBerry,
			[actions.ACTION_CONTROL_PLAYLIST]: isModOrBerryQueue,
			[actions.ACTION_CONTROL_VIDEO]: isBerry,
			[actions.ACTION_CREATE_POLL]: isModOrBerry,
			[actions.ACTION_DELETE_VIDEO]: isMod,
			[actions.ACTION_FORCE_REFRESH]: isAdmin,
			[actions.ACTION_GET_FILTERS]: isAdmin,
			[actions.ACTION_KICK_USER]: isAdmin,
			[actions.ACTION_MOVE_BERRY_TO_USER]: isMod,
			[actions.ACTION_RANDOMIZE_LIST]: isMod,
			[actions.ACTION_RELINQUISH_BERRY]: isModOrBerry,
			[actions.ACTION_SEARCH_HISTORY]: isModOrBerryQueue,
			[actions.ACTION_SET_AREAS]: isAdmin,
			[actions.ACTION_SET_FILTERS]: isAdmin,
			[actions.ACTION_SET_TOGGLEABLS]: isAdmin,
			[actions.ACTION_SET_USER_NOTE]: isMod,
			[actions.ACTION_SET_VIDEO_VOLATILE]: isMod,
			[actions.ACTION_SHADOWBAN]: isAdmin,
			[actions.ACTION_SHITPOST]: isAdmin,
			[actions.ACTION_VOTE_POLL]: () => true,
			[actions.CAN_SEE_ADMIN_LOG]: isMod,
			[actions.CAN_SEE_OBSCURED_POLLS]: isModOrBerry,
			[actions.CAN_SEE_PRIVILEGED_USER_DATA]: isMod,
			[actions.CAN_SEE_PARTY_ROOMS]: isMod,
			[actions.CAN_SEE_SHADOWBANS]: isMod,
			[actions.ACTION_CAN_RESET_PASSWORD]: isAdmin,
		};

		function isBerry({ isBerry }) {
			return isBerry;
		}

		function isMod({ type }) {
			return type >= userTypes.MODERATOR;
		}

		function isModOrBerry({ type, isBerry }) {
			return isBerry || type >= userTypes.MODERATOR;
		}

		function isModOrBerryQueue({ type, isBerry }) {
			return (isBerry && services.getToggleable("berryqueue")) || type >= userTypes.MODERATOR;
		}

		function isAdmin({ type }) {
			return type >= userTypes.ADMINISTRATOR;
		}
	}

	can(session, action) {
		const handler = this.actions[action];
		if (!handler) {
			throw new Error(`Invalid action passed into can: ${action}`);
		}

		return handler(session);
	}
};
