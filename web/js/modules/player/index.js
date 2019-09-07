// this is the API surface for the BT player, handling both popout and popin players

/**
 * Used to namespace messages that are passed via the postMessage API
 */
export const PLAYER_NAMESPACE = "player";

export const PLAYER_STATUS = {
	PLAYING: "PLAYING",
	PAUSED: "PAUSED",
};

export const PLAYER_ACTION = {
	SET_STATE: "SET_STATE",
	setState(state) {
		return {
			type: PLAYER_ACTION.SET_STATE,
			state,
		};
	},

	STATE_SET: "STATE_SET",
	stateSet(state) {
		return {
			type: PLAYER_ACTION.STATE_SET,
			state,
		};
	},

	REQUEST_STATE: "REQUEST_STATE",
	requestState() {
		return { type: PLAYER_ACTION.REQUEST_STATE };
	},

	SET_PREFERENCES: "SET_PREFERENCES",
	/**
	 * @param {IPlayerPreferences} preferences
	 */
	setPreferences(preferences) {
		return {
			type: PLAYER_ACTION.SET_PREFERENCES,
			preferences,
		};
	},

	PREFERENCES_SET: "PREFERENCES_SET",
	/**
	 * @param {IPlayerPreferences} preferences
	 */
	preferencesSet(preferences) {
		return {
			type: PLAYER_ACTION.PREFERENCES_SET,
			preferences,
		};
	},

	REQUEST_PREFERENCES: "REQUEST_PREFERENCES",
	requestPreferences() {
		return {
			type: PLAYER_ACTION.REQUEST_PREFERENCES,
		};
	},
};

/**
 * @param {IPlayerPreferences} left
 * @param {IPlayerPreferences} right
 * @returns {boolean}
 */
export function comparePreferences(left, right) {
	if (left.volume !== right.volume) {
		return false;
	}

	if (left.sync.isEnabled !== right.sync.isEnabled) {
		return false;
	}

	if (left.sync.accuracyInSeconds !== right.sync.accuracyInSeconds) {
		return false;
	}

	return true;
}

/**
 * @var {IPlayerPreferences}
 */
export const DEFAULT_PREFERENCES = {
	volume: 1,
	sync: { isEnabled: true, accuracyInSeconds: 2 },
};
