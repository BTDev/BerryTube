import { RankedPoll } from "./ranked-poll.js";
import { loadWorker } from "./lib.js";
import { VolumeManager } from "./volume.js";
import { Players } from "./player.js";

// header countdown
loadWorker(window.WORKER_URLS.countdown).addEventListener("message", ({ data }) => {
	const el = document.getElementById(data.id);

	switch (data.action) {
		case "innerHTML":
			el.innerHTML = data.html;
			break;
		case "addClass":
			el.classList.add(data.class);
			break;
		case "removeClass":
			el.classList.remove(data.class);
			break;
	}
});

// ranked poll API
let activePoll = null;

window.volume = new VolumeManager();
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
			console.error("Could not set ranked poll because there is no active ranked poll object?");
			return;
		}

		activePoll.update(state);
	},

	closeRankedPoll() {
		if (!activePoll) {
			// eslint-disable-next-line no-console
			console.error("Could not close ranked poll because there is no active ranked poll object?");
			return;
		}

		activePoll.close();
		activePoll = null;
	},
};
window.Players = new Players();

window.isModuleLoaded = true;

if (window.moduleLoadedCallbacks) {
	window.moduleLoadedCallbacks.forEach(a => a());
	window.moduleLoadedCallbacks = null;
}
