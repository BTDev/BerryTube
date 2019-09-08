// this is the module that adds the BT player to the page
import {
	Store,
	Actions,
	PLAYER,
	PLAYER_STATUS,
	PLAYER_MODE,
	getConfig,
} from "./bt.js";

import {
	setStorageFloat,
	setStorageInteger,
	getStorageFloat,
	getStorageInteger,
} from "./lib.js";

import {
	handleActionsFromPostMessage,
	provideStoreToPostMessage,
	broadcastStateToChannel,
} from "./actions.js";

import { AudioOnlyPlayer } from "./components/AudioOnlyPlayer.js";
import { InlinePlayer } from "./components/InlinePlayer.js";
import { PopoutPlayer } from "./components/PopoutPlayer.js";
import { UnknownPlayer } from "./components/UnknownPlayer.js";
import { DisabledPlayer } from "./components/DisabledPlayer.js";

// ---------------------------------------------------------------------------------------------------------------------
// Init and state action handlers
Actions.handle(PLAYER.SET_MODE, action => {
	const current = Store.state[PLAYER.NAMESPACE];
	Store.update({
		[PLAYER.NAMESPACE]: {
			...current,
			stateCreatedAt: new Date().getTime(),
			mode: action.mode,
		},
	});
});

Actions.handle(PLAYER.PLAY, () => {
	const current = Store.state[PLAYER.NAMESPACE];
	Store.update({
		[PLAYER.NAMESPACE]: {
			...current,
			stateCreatedAt: new Date().getTime(),
			status: PLAYER_STATUS.PLAYING,
		},
	});
});

Actions.handle(PLAYER.REQUEST_PLAY, () => {
	// user requested a play, do nothing right now
});

Actions.handle(PLAYER.PAUSE, () => {
	const current = Store.state[PLAYER.NAMESPACE];
	Store.update({
		[PLAYER.NAMESPACE]: {
			...current,
			stateCreatedAt: new Date().getTime(),
			status: PLAYER_STATUS.PAUSED,
		},
	});
});

Actions.handle(PLAYER.REQUEST_PAUSE, () => {
	// user requested a pause, do nothing right now
});

Actions.handle(PLAYER.SEEK, action => {
	const current = Store.state[PLAYER.NAMESPACE];
	Store.update({
		[PLAYER.NAMESPACE]: {
			...current,
			stateCreatedAt: new Date().getTime(),
			positionInSeconds: action.positionInSeconds,
		},
	});
});

Actions.handle(PLAYER.REQUEST_SEEK, () => {
	// user requested a seek, do nothing right now
});

Actions.handle(PLAYER.SET_VIDEO, action => {
	const current = Store.state[PLAYER.NAMESPACE];
	Store.update({
		[PLAYER.NAMESPACE]: {
			...current,
			stateCreatedAt: new Date().getTime(),
			video: action.video || null,
			status: action.status,
			positionInSeconds: action.positionInSeconds,
		},
	});
});

Actions.handle(PLAYER.SET_VOLUME, action => {
	setStorageFloat("player.volume", action.volume);
	const current = Store.state[PLAYER.NAMESPACE];
	Store.update({
		[PLAYER.NAMESPACE]: {
			...current,
			preferences: {
				...current.preferences,
				volume: action.volume,
			},
		},
	});
});

Actions.handle(
	PLAYER.SET_SYNC_PREFERENCES,
	({ preferences: { isEnabled, accuracyInSeconds } }) => {
		setStorageInteger("syncAtAll", isEnabled ? 1 : 0);
		setStorageFloat("syncAccuracy", accuracyInSeconds);

		const current = Store.state[PLAYER.NAMESPACE];
		Store.update({
			[PLAYER.NAMESPACE]: {
				...current,
				preferences: {
					...current.preferences,
					sync: {
						isEnabled,
						accuracyInSeconds,
					},
				},
			},
		});
	},
);

provideStoreToPostMessage(window, Store, [PLAYER.NAMESPACE]);
handleActionsFromPostMessage(window, Actions, [PLAYER.NAMESPACE]);

try {
	const channel = new BroadcastChannel(`player-${getConfig().channelId}`);
	broadcastStateToChannel(channel, Store, [PLAYER.NAMESPACE]);
	handleActionsFromPostMessage(channel, Actions, [PLAYER.NAMESPACE]);
} catch (e) {
	// eslint-disable-next-line no-console
	console.error("Could not setup broadcast channel");
	// eslint-disable-next-line no-console
	console.error(e);
}

// ---------------------------------------------------------------------------------------------------------------------
// Player UI
let currentMode = null;

Store.stateSet.subscribe(async ({ player: left }, { player: right }) => {
	if (right && left.mode === right.mode) {
		return;
	}

	try {
		if (left.mode === PLAYER_MODE.INLINE) {
			await setPlayerComponent(InlinePlayer);
		} else if (left.mode === PLAYER_MODE.POPOUT) {
			await setPlayerComponent(PopoutPlayer);
		} else if (left.mode === PLAYER_MODE.AUDIO_ONLY) {
			await setPlayerComponent(AudioOnlyPlayer);
		} else if (left.mode === PLAYER_MODE.DISABLED) {
			await setPlayerComponent(DisabledPlayer);
		} else {
			// eslint-disable-next-line no-console
			throw new Error(`unknown player mode ${left.mode}`);
		}
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error(`Could not load player mode ${left.mode}`);
		// eslint-disable-next-line no-console
		console.error(e);
		await setPlayerComponent(UnknownPlayer);
	}
}, true);

Actions.dispatch(PLAYER.setVolume(getStorageFloat("player.volume", 1)));

Actions.dispatch(
	PLAYER.setSyncPreferences({
		isEnabled: getStorageInteger("syncAtAll", 1) === 1,
		accuracyInSeconds: getStorageFloat("syncAccuracy", 2),
	}),
);

async function setPlayerComponent(Component) {
	const videoWrap = document.querySelector("#videowrap");
	if (currentMode) {
		try {
			await currentMode.unload();
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error("could not unload player component");

			// eslint-disable-next-line no-console
			console.error(e);
		}

		try {
			videoWrap.removeChild(currentMode.el);
		} catch (e) {
			// blank
		}
	}

	currentMode = await Component(Actions, Store);
	videoWrap.appendChild(currentMode.el);
}
