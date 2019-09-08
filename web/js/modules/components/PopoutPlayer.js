// eslint-disable-next-line no-unused-vars
import { ActionDispatcher, Store } from "../actions.js";
import { createElement, PromiseSource } from "../lib.js";
import { PlayerToolbar } from "./PlayerToolbar.js";
import { PLAYER, PLAYER_MODE, getConfig } from "../bt.js";

const dialogs = {};
let channel = null;
const config = getConfig();

function initChannel(actions, store) {
	if (channel) {
		return channel;
	}

	channel = new BroadcastChannel(`player-${config.channelId}`);
	channel.addEventListener("message", ({ data }) => {
		if (!data.dialogId) {
			return;
		}

		const dialog = dialogs[data.dialogId];
		if (!dialog) {
			// eslint-disable-next-line no-console
			console.warn(
				`we got a message from dialog ${
					data.dialogId
				}, but we do not know who that is`,
			);

			return;
		}

		if (data.type === "DIALOG_LOADED") {
			if (dialog.timeout) {
				window.clearTimeout(dialog.timeout);
				dialog.timeout = null;
			}

			dialog.promise.resolve();
			channel.postMessage({
				type: "ACTION_SET_STATE",
				namespaces: {
					player: store.state[PLAYER.NAMESPACE],
				},
			});
		} else if (data.type === "DIALOG_CLOSED") {
			dialog.timeout = window.setTimeout(() => {
				dialog.onClose();
				delete dialogs[data.dialogId];
			}, 500);
		}
	});

	return channel;
}

/**
 * @param {ActionDispatcher} actions
 * @param {Store} store
 */
export async function PopoutPlayer(actions, store) {
	const channel = initChannel(actions, store);

	const promise = new PromiseSource();
	const toolbar = await PlayerToolbar(actions, store);

	const dialogId = Math.random().toString();

	const unloads = [
		() => toolbar.unload(),
		store.stateSet.subscribe(({ player: { mode } }) => {
			if (mode !== PLAYER_MODE.POPOUT) {
				channel.postMessage({ dialogId, type: "DIALOG_CLOSE" });
			}
		}),
	];

	const component = {
		el: createElement(
			"div",
			{
				className: "c-popout-player",
			},
			toolbar.el,
		),
		async unload() {
			for (const toUnload of unloads) {
				try {
					await toUnload();
				} catch (e) {
					// eslint-disable-next-line no-console
					console.error(e);
				}
			}
		},
	};

	dialogs[dialogId] = {
		promise,
		onClose() {
			if (store.state[PLAYER.NAMESPACE].mode === PLAYER_MODE.POPOUT) {
				// the user probably closed the dialog
				actions.dispatch(PLAYER.setMode(PLAYER_MODE.INLINE));
			}
		},
	};

	window.open(
		`/player.php?channelId=${config.channelId}&dialogId=${dialogId}`,
		"",
		"noopener,height=720,width=1280",
	);

	await promise.promise;
	return component;
}
