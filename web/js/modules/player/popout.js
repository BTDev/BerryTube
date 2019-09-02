// this is the entrypoint for the player.php popout thinggy
import "../compat.js";
import { getConfig } from "./../bt.js";
import { ActionDispatcher } from "../actions.js";
import { PLAYER_ACTION, PLAYER_NAMESPACE } from "./shared.js";

import * as youtube from "./types/youtube.js";

const playerFactories = {
	yt: youtube.makePlayer(),
};

let currentPlayer = null;

const config = getConfig();
const actions = new ActionDispatcher(PLAYER_NAMESPACE, sendMessage);
window.addEventListener("message", actions.receiveMessage.bind(actions));

const root = document.querySelector("#root");
const elErrorMessage = document.createElement("div");
elErrorMessage.classList.add("error-message");
root.appendChild(elErrorMessage);

actions.addActionHandler(PLAYER_ACTION.SET_VIDEO, async data => {
	const nextPlayer = playerFactories[data.video.type];

	if (nextPlayer === currentPlayer) {
		await currentPlayer.play(data.video);
		return;
	}

	if (currentPlayer) {
		await currentPlayer.setEnabled(false);
	}

	currentPlayer = nextPlayer;

	if (!currentPlayer) {
		root.classList.add("has-error");
		elErrorMessage.innerText = `we do not support the video type ${
			data.video.type
		}`;

		return;
	}

	root.classList.remove("has-error");

	await currentPlayer.setEnabled(true);
	await currentPlayer.play(data.video);
});

actions.addActionHandler(PLAYER_ACTION.PLAY, async () => {
	if (currentPlayer) {
		return;
	}

	await currentPlayer.play();
});

actions.addActionHandler(PLAYER_ACTION.PAUSE, async () => {
	if (currentPlayer) {
		return;
	}

	await currentPlayer.pause();
});

actions.addActionHandler(PLAYER_ACTION.SEEK, async data => {
	if (currentPlayer) {
		return;
	}

	await currentPlayer.seek(data.positionInSeconds);
});

function sendMessage(message) {
	parent.postMessage(message, config.origin);
}
