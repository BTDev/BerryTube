// this is the module that adds the BT player to the page
import { getConfig } from "./bt.js";
import {
	PLAYER_NAMESPACE,
	PLAYER_ACTION,
	DEFAULT_PREFERENCES,
	PLAYER_MODE,
} from "./player/index.js";
import { ActionDispatcher, StatelyProperty } from "./actions.js";
import { getStorageInteger, getStorageFloat, setStorageFloat } from "./lib.js";

const actions = new ActionDispatcher(PLAYER_NAMESPACE, sendMessage);
let messageBuffer = [];
let actionTarget = null;

// ---------------------------------------------------------------------------------------------------------------------
// Mode
const mode = new StatelyProperty(PLAYER_MODE.INLINE);

mode.subscribe(value => {
	if (value === PLAYER_MODE.INLINE) {
		setVideo(loadIframe());
	} else if (value === PLAYER_MODE.POPOUT) {
		setVideo(loadDialog());
	} else {
		setVideo(null);
	}
}, false);

export function setMode(newMode) {
	mode.set(newMode);
}

// ---------------------------------------------------------------------------------------------------------------------
// Preferences
const preferences = new StatelyProperty(loadPreferences());

preferences.subscribe(newPreferences => {
	setStorageFloat("player.volume", newPreferences.volume);
	actions.dispatch(PLAYER_ACTION.preferencesSet(newPreferences));
}, false);

actions.addActionHandler(
	PLAYER_ACTION.REQUEST_SET_PREFERENCES,
	async newPreferences => preferences.set(newPreferences),
);

export function setPreferences(newPreferences) {
	preferences.set(newPreferences);
}

// ---------------------------------------------------------------------------------------------------------------------
// State
const state = new StatelyProperty(null);

state.subscribe(newState => {
	if (newState === null) {
		return;
	}

	actions.dispatch(PLAYER_ACTION.stateSet(newState));
}, false);

actions.addActionHandler(
	PLAYER_ACTION.REQUEST_SET_STATE,
	async ({ state: newState }) => {
		// this means that the user initiated a player state change, todo
		console.log(newState);
	},
);

export function setState(newState) {
	state.set(newState);
}

// ---------------------------------------------------------------------------------------------------------------------
// Init
let lastVideoPlayer = null;
const config = getConfig();
window.addEventListener("message", actions.receiveMessage.bind(actions));
setVideo(loadIframe());

// ---------------------------------------------------------------------------------------------------------------------
function setVideo(player) {
	if (lastVideoPlayer) {
		lastVideoPlayer();
		lastVideoPlayer = null;
	}

	if (player) {
		lastVideoPlayer = player;
		actionTarget = null;
		actions.dispatch(PLAYER_ACTION.preferencesSet(preferences.value));
		actions.dispatch(PLAYER_ACTION.stateSet(state.value));
	}
}

function loadIframe() {
	const iframe = document.createElement("iframe");
	iframe.classList.add("bt-player");
	iframe.addEventListener("load", () => {
		onActionTargetLoaded(iframe.contentWindow);
	});

	const videoWrap = document.querySelector("#videowrap");
	videoWrap.appendChild(iframe);
	document.querySelector("#ytapiplayer").style.display = "none";
	iframe.src = "/player.php";

	return () => {
		iframe.parentNode.removeChild(iframe);
	};
}

function loadDialog() {
	const dialog = window.open(
		"/player.php",
		"_blank",
		"height=720,width=1280,scrollbars=no,menubar=no,location=no",
	);

	dialog.addEventListener("load", () => {
		onActionTargetLoaded(dialog.window);

		dialog.addEventListener("unload", () => {
			if (mode.value === PLAYER_MODE.POPOUT) {
				setMode(PLAYER_MODE.INLINE);
			}
		});
	});

	return () => {
		dialog.close();
	};
}

function onActionTargetLoaded(newActionTarget) {
	actionTarget = newActionTarget;
	for (const message of messageBuffer) {
		sendMessage(message);
	}

	messageBuffer = [];
}

function sendMessage(message) {
	if (actionTarget) {
		actionTarget.postMessage(message, config.origin);
	} else {
		messageBuffer.push(message);
	}
}

function loadPreferences() {
	return {
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
}

export const Store = {
	mode: mode.public,
	preferences: preferences.public,
	state: state.public,
};
