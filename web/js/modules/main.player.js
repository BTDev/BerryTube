// this is the entrypoint for the player.php popout thinggy
import "./compat.js";
import { getConfig } from "./bt.js";
import { ActionDispatcher, StatelyProperty } from "./actions.js";
import {
	PLAYER_ACTION,
	PLAYER_NAMESPACE,
	DEFAULT_PREFERENCES,
	comparePreferences,
} from "./player/index.js";
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

const actions = new ActionDispatcher(PLAYER_NAMESPACE, sendMessage);

// ---------------------------------------------------------------------------------------------------------------------
// State
const state = new StatelyProperty(null);

state.subscribe(async newState => {
	if (newState === null) {
		return;
	}

	const player = await ensurePlayerIsEnabled(newState.video.videotype);
	await player.setState(newState);
});

actions.addActionHandler(PLAYER_ACTION.STATE_SET, async action => {
	await state.set(action.state);
});

export function setState(newState) {
	actions.dispatch(PLAYER_ACTION.requestSetState(newState));
}

// ---------------------------------------------------------------------------------------------------------------------
// Preferences
const preferences = new StatelyProperty(DEFAULT_PREFERENCES);

actions.addActionHandler(PLAYER_ACTION.PREFERENCES_SET, async action => {
	await preferences.set(action.preferences);
});

export function setPreferences(newPreferences) {
	actions.dispatch(PLAYER_ACTION.requestSetPreferences(newPreferences));
}

export const Store = {
	preferences: preferences.public,
	state: state.public,
};

// ---------------------------------------------------------------------------------------------------------------------
// Init
const config = getConfig();
window.addEventListener("message", actions.receiveMessage.bind(actions));

const component = new PlayerDOM(document.querySelector("#root"));

const players = {
	dm: new DailyMotionPlayer(component.getPlayerType("dm")),
	file: new FilePlayer(component.getPlayerType("file")),
	osmf: new OsmfPlayer(component.getPlayerType("osmf")),
	soundcloud: new SoundcloudPlayer(
		this,
		component.getPlayerType("soundcloud"),
	),
	twitchclip: new TwitchClipPlayer(
		this,
		component.getPlayerType("twitchclip"),
	),
	twitch: new TwitchPlayer(component.getPlayerType("twitch")),
	vimeo: new VimeoPlayer(component.getPlayerType("vimeo")),
	yt: new YoutubePlayer(component.getPlayerType("yt")),
};

const nullPlayer = new BasePlayer(null);
let currentPlayer = nullPlayer;

// ---------------------------------------------------------------------------------------------------------------------
function sendMessage(message) {
	parent.postMessage(message, config.origin);
}

async function ensurePlayerIsEnabled(type) {
	let next = players[type];
	if (next === currentPlayer) {
		return currentPlayer;
	}

	component.showPlayer(type);

	if (next) {
		const newPreferences = await currentPlayer.getPreferences();
		if (!comparePreferences(newPreferences, preferences.value)) {
			await actions.dispatch(
				PLAYER_ACTION.requestSetPreferences(newPreferences),
			);
		}

		await next.setEnabled(true);
	} else {
		component.setError(`player type ${type} not found`);
		next = nullPlayer;
	}

	return (currentPlayer = next);
}
