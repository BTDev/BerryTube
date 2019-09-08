import {
	Store as StoreClass,
	ActionDispatcher,
	handleActionsFromPostMessage,
	provideStoreToPostMessage,
} from "./actions.js";

import { getQuerystringObject } from "./lib.js";

/**
 * @returns {{ origin: string }}
 */
export function getConfig() {
	if (!window.BT) {
		window.BT = { origin: window.origin };
	}

	if (!window.BT.channelId) {
		const querystring = getQuerystringObject();
		window.BT.channelId = querystring.channelId || Math.random().toString();
		window.BT.dialogId = querystring.dialogId || null;
	}

	return window.BT;
}

export function ensureExists(selector) {
	return new Promise(res => {
		window.whenExists(selector, el => res(el[0]));
	});
}

export const PLAYER_MODE = {
	INLINE: "INLINE",
	POPOUT: "POPOUT",
	AUDIO_ONLY: "AUDIO_ONLY",
	DISABLED: "DISABLED",
};

export const PLAYER_STATUS = {
	PLAYING: "PLAYING",
	PAUSED: "PAUSED",
	LOADING: "LOADING",
};

export const PLAYER = {
	NAMESPACE: "player",

	SET_MODE: "SET_MODE",
	/**
	 * Sets which mode the player is in.
	 * @param {PLAYER_MODE} mode
	 */
	setMode(mode) {
		return {
			namespace: PLAYER.namespace,
			type: PLAYER.SET_MODE,
			mode,
		};
	},

	PLAY: "PLAY",
	/**
	 * Changes the status of the player to PLAYING
	 */
	play() {
		return { namespace: PLAYER.NAMESPACE, type: PLAYER.PLAY };
	},

	REQUEST_PLAY: "REQUEST_PLAY",
	/**
	 * The user requested that the player changes its status to PLAYING
	 */
	requestPlay() {
		return { namespace: PLAYER.NAMESPACE, type: PLAYER.REQUEST_PLAY };
	},

	PAUSE: "PAUSE",
	/**
	 * Change the status of the player to PAUSED
	 */
	pause() {
		return { namespace: PLAYER.NAMESPACE, type: PLAYER.PAUSE };
	},

	REQUEST_PAUSE: "REQUEST_PAUSE",
	/**
	 * The user requested that the player changes its status to PAUSED
	 */
	requestPause() {
		return { namespace: PLAYER.NAMESPACE, type: PLAYER.REQUEST_PAUSE };
	},

	SEEK: "SEEK",
	/**
	 * @param {number} positionInSeconds
	 */
	seek(positionInSeconds) {
		return {
			namespace: PLAYER.NAMESPACE,
			type: PLAYER.SEEK,
			positionInSeconds,
		};
	},

	REQUEST_SEEK: "REQUEST_SEEK",
	/**
	 * The user requested that the player seek to the specified position
	 * @param {number} positionInSeconds
	 */
	requestSeek(positionInSeconds) {
		return {
			namespace: PLAYER.NAMESPACE,
			type: PLAYER.REQUEST_SEEK,
			positionInSeconds,
		};
	},

	SET_VIDEO: "SET_VIDEO",
	/**
	 * Changes the current video
	 * @param {BtVideo} video
	 * @param {PLAYER_STATUS} status
	 * @param {number} positionInSeconds
	 */
	setVideo(video, status, positionInSeconds) {
		return {
			namespace: PLAYER.NAMESPACE,
			type: PLAYER.SET_VIDEO,
			video,
			status,
			positionInSeconds,
		};
	},

	SET_VOLUME: "SET_VOLUME",
	/**
	 * The user has requested the volume be changed
	 * @param {number} volume float between 0 and 1
	 */
	setVolume(volume) {
		return { namespace: PLAYER.NAMESPACE, type: PLAYER.SET_VOLUME, volume };
	},

	SET_SYNC_PREFERENCES: "SET_SYNC_PREFERENCES",
	/**
	 * Sets the player's sync preferences
	 * @param {PlayerSyncPreferences} preferences
	 */
	setSyncPreferences(preferences) {
		return {
			namespace: PLAYER.NAMESPACE,
			type: PLAYER.SET_SYNC_PREFERENCES,
			preferences,
		};
	},
};

export const Store = new StoreClass();

export const Actions = new ActionDispatcher();

// set our default state
Store.update({
	[PLAYER.NAMESPACE]: {
		stateCreatedAt: new Date().getTime(),
		video: null,
		positionInSeconds: 0,
		status: PLAYER_STATUS.PAUSED,
		mode: PLAYER_MODE.INLINE,
		preferences: {
			volume: 1,
			sync: {
				isEnabled: true,
				accuracyInSeconds: 2,
			},
		},
	},
});
