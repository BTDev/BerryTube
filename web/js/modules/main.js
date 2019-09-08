import "./compat.js";
import { RankedPoll } from "./ranked-poll.js";
import { PLAYER, PLAYER_MODE, PLAYER_STATUS, Actions, Store } from "./bt.js";
import {
	getStorage,
	setStorage,
	getStorageInteger,
	setStorageInteger,
	getStorageFloat,
	setStorageFloat,
	setStorageToggle,
	getStorageToggle,
} from "./lib.js";

import "./player.js";

// ---------------------------------------------------------------------------------------------------------------------
// Export our store and actions
window.BT = {
	...(window.BT || {}),
	PLAYER,
	PLAYER_MODE,
	PLAYER_STATUS,
	store: Store,
	dispatch: Actions.dispatch.bind(Actions),
};

// ---------------------------------------------------------------------------------------------------------------------
// Export our ranked poll compatibility layer for old code
let activePoll = null;

window.rankedPolls = {
	createRankedPoll(state, mountElement) {
		if (activePoll) {
			activePoll.close();
		}

		activePoll = new RankedPoll(state, mountElement);
	},
	updateRankedPoll(state) {
		if (!activePoll) {
			// eslint-disable-next-line no-console
			console.error(
				"Could not set ranked poll because there is no active ranked poll object?",
			);
			return;
		}

		activePoll.update(state);
	},

	closeRankedPoll() {
		if (!activePoll) {
			// eslint-disable-next-line no-console
			console.error(
				"Could not close ranked poll because there is no active ranked poll object?",
			);
			return;
		}

		activePoll.close();
		activePoll = null;
	},
};

// ---------------------------------------------------------------------------------------------------------------------
// Export our library compatibility layer for old code
for (const [key, value] of Object.entries({
	setStorage,
	getStorage,
	getStorageInteger,
	setStorageInteger,
	getStorageFloat,
	setStorageFloat,
	setStorageToggle,
	getStorageToggle,
})) {
	window[key] = value;
}
