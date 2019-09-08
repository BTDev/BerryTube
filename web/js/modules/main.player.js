// this is the entrypoint for the player.php popout thinggy
import "./compat.js";
import { Store, Actions, PLAYER, getConfig } from "./bt.js";
import { PlayerDOM } from "./player/component.js";
import { BasePlayer } from "./player/types/base.js";
import { DailyMotionPlayer } from "./player/types/dailymotion.js";
import { FilePlayer } from "./player/types/file.js";
import { OsmfPlayer } from "./player/types/osmf.js";
import { SoundcloudPlayer } from "./player/types/soundcloud.js";
import { TwitchPlayer } from "./player/types/twitch.js";
import { TwitchClipPlayer } from "./player/types/twitch-clip.js";
import { VimeoPlayer } from "./player/types/vimeo.js";
import { YoutubePlayer } from "./player/types/youtube.js";
import {
	forwardActionsToPostMessage,
	updateStoreFromPostMessage,
} from "./actions.js";

// ---------------------------------------------------------------------------------------------------------------------
// Init
const component = new PlayerDOM(document.querySelector("#root"));

const players = {
	dm: new DailyMotionPlayer(component, Actions),
	file: new FilePlayer(component, Actions),
	osmf: new OsmfPlayer(component, Actions),
	soundcloud: new SoundcloudPlayer(component, Actions),
	twitchclip: new TwitchClipPlayer(component, Actions),
	twitch: new TwitchPlayer(component, Actions),
	vimeo: new VimeoPlayer(component, Actions),
	yt: new YoutubePlayer(component, Actions),
};

const nullPlayer = new BasePlayer(null, component, Actions);
let currentPlayer = nullPlayer;

Store.stateSet.subscribe(async ({ player: left }) => {
	if (left.video === null) {
		await switchPlayers(nullPlayer);
		return;
	}

	await switchPlayers(players[left.video.videotype] || nullPlayer);
	await currentPlayer.setState(left);
}, true);

const config = getConfig();
if (!config.dialogId) {
	forwardActionsToPostMessage(window.parent, Actions, [PLAYER.NAMESPACE]);
	updateStoreFromPostMessage(window, window.parent, Store, [
		PLAYER.NAMESPACE,
	]);
} else {
	try {
		const channel = new BroadcastChannel(`player-${config.channelId}`);
		forwardActionsToPostMessage(channel, Actions, [PLAYER.NAMESPACE]);
		updateStoreFromPostMessage(
			channel,
			null,
			Store,
			[PLAYER.NAMESPACE],
			false,
		);

		window.addEventListener("unload", () => {
			channel.postMessage({
				type: "DIALOG_CLOSED",
				dialogId: config.dialogId,
			});
		});

		channel.addEventListener("message", async ({ data }) => {
			if (data.dialogId !== config.dialogId) {
				return;
			}

			window.close();
			channel.close();
			await currentPlayer.setEnabled(false);
			currentPlayer = null;
			component.el.innerHTML =
				"The player has been popped back in. You May now close this window.";
		});

		channel.postMessage({
			type: "DIALOG_LOADED",
			dialogId: config.dialogId,
		});
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error("Could not establish broadcast channel");
		// eslint-disable-next-line no-console
		console.error(e);
	}
}

async function switchPlayers(newPlayer) {
	if (currentPlayer === newPlayer) {
		return;
	}

	await currentPlayer.setEnabled(false);
	await newPlayer.setEnabled(true);
	currentPlayer = newPlayer;
}
