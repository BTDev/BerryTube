// this is the controller code for integrating the BT player onto a page
import { getConfig } from "../bt.js";
import { PLAYER_NAMESPACE } from "./shared.js";
import { ActionDispatcher } from "../actions.js";

const config = getConfig();
const actions = new ActionDispatcher(PLAYER_NAMESPACE, sendMessage);
window.addEventListener("message", actions.receiveMessage.bind(actions));

const iframe = document.createElement("iframe");
let messageBuffer = [];
let isIframeLoaded = false;
iframe.classList.add("bt-player");
iframe.src = "/player.php";
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

/**
 * Sends an action to the player in the format returned by the do* action factories in shared.js
 */
export function dispatch(action, timeoutInMilliseconds = 5000) {
	return actions.dispatch(action, timeoutInMilliseconds);
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
