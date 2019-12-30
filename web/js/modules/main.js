import { RankedPoll } from "./ranked-poll.js";
import "./countdown.js";

// ranked poll API
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

window.isModuleLoaded = true;

if (window.moduleLoadedCallbacks) {
	window.moduleLoadedCallbacks.forEach(a => a());
	window.moduleLoadedCallbacks = null;
}
