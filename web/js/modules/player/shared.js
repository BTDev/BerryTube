// this is the API surface for the BT player, handling both popout and popin players

/**
 * Used to namespace messages that are passed via the postMessage API
 */
export const PLAYER_NAMESPACE = "player";

export const PLAYER_ACTION = {
	PLAY: "PALY",
	doPlay() {
		return { type: PLAYER_ACTION.PLAY };
	},

	PAUSE: "PAUSE",
	doPause() {
		return { type: PLAYER_ACTION.PAUSE };
	},

	SEEK: "SEEK",
	doSeek(positionInSeconds) {
		return { type: PLAYER_ACTION.SEEK, positionInSeconds };
	},

	SET_VIDEO: "SET_VIDEO",
	doSet(video) {
		return { type: PLAYER_ACTION.SET_VIDEO, video };
	},

	PLAYING: "PLAYING",
	PAUSED: "PAUSED",
	SEEKED: "SEEKED",
};
