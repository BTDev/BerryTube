// this is the API surface for the BT player, handling both popout and popin players

/**
 * Used to namespace messages that are passed via the postMessage API
 */
export const PLAYER_NAMESPACE = "player";

export const PLAYER_MODE = {
	INLINE: "INLINE",
	POPOUT: "POPOUT",
	DISABLED: "DISABLED",
};

export const PLAYER_STATUS = {
	PLAYING: "PLAYING",
	PAUSED: "PAUSED",
};

export const PLAYER_ACTION = {
	STATE_SET: "STATE_SET",
	stateSet(state) {
		return {
			type: PLAYER_ACTION.STATE_SET,
			state,
		};
	},

	REQUEST_SET_STATE: "REQUEST_SET_STATE",
	requestSetState(state) {
		return { type: PLAYER_ACTION.REQUEST_SET_STATE, state };
	},

	PREFERENCES_SET: "PREFERENCES_SET",
	/**
	 * @param {PlayerPreferences} preferences
	 */
	preferencesSet(preferences) {
		return {
			type: PLAYER_ACTION.PREFERENCES_SET,
			preferences,
		};
	},

	REQUEST_SET_PREFERENCES: "REQUEST_SET_PREFERENCES",
	/**
	 * @param {PlayerPreferences} preferences
	 */
	requestSetPreferences(preferences) {
		return {
			type: PLAYER_ACTION.REQUEST_SET_PREFERENCES,
			preferences,
		};
	},
};

/**
 * @param {PlayerPreferences} left
 * @param {PlayerPreferences} right
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
