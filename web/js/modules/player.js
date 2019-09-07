// this is the module that adds the BT player to the page
import { getConfig } from "./bt.js";
import {
	PLAYER_NAMESPACE,
	PLAYER_ACTION,
	DEFAULT_PREFERENCES,
} from "./player/index.js";
import { ActionDispatcher } from "./actions.js";
import { getStorageInteger, getStorageFloat, setStorageFloat } from "./lib.js";

const config = getConfig();
const actions = new ActionDispatcher(PLAYER_NAMESPACE, sendMessage);
window.addEventListener("message", actions.receiveMessage.bind(actions));

let preferences = {
	sync: {
		isEnabled:
			getStorageInteger(
				"syncAtAll",
				DEFAULT_PREFERENCES.sync.isEnabled,
			) === 1,
		accuracyInSeconds: getStorageInteger(
			"syncAccuracy",
			DEFAULT_PREFERENCES.sync.accuracyInSeconds,
		),
	},
	volume: getStorageFloat("player.volume", DEFAULT_PREFERENCES.volume),
};

actions.addActionHandler(
	PLAYER_ACTION.PREFERENCES_SET,
	async newPreferences => {
		preferences = newPreferences;
		setStorageFloat("player.volume", preferences.volume);
	},
);

const iframe = document.createElement("iframe");
let messageBuffer = [];
let isIframeLoaded = false;
iframe.classList.add("bt-player");
iframe.addEventListener("load", () => {
	isIframeLoaded = true;
	for (const message of messageBuffer) {
		sendMessage(message);
	}

	messageBuffer = [];
});

const videoWrap = document.querySelector("#videowrap");
videoWrap.appendChild(iframe);
document.querySelector("#ytapiplayer").style.display = "none";
iframe.src = "/player.php";

actions.dispatch(PLAYER_ACTION.setPreferences(preferences));

/**
 * @param {IPlayerState} state
 */
export function setState(state) {
	return actions.dispatch(PLAYER_ACTION.setState(state));
}

/**
 * Acts as a shim which will forward the message to either the popout or the iframe
 */
function sendMessage(message) {
	if (isIframeLoaded) {
		iframe.contentWindow.postMessage(message, config.origin);
	} else {
		messageBuffer.push(message);
	}
}
