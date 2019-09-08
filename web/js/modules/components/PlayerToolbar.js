// eslint-disable-next-line no-unused-vars
import { ActionDispatcher, Store } from "../actions.js";
import { PLAYER, PLAYER_MODE } from "../bt.js";
import { createElement } from "../lib.js";

/**
 * @param {ActionDispatcher} actions
 * @param {Store} store
 */
export async function PlayerToolbar(actions, store) {
	const modeButtons = {};

	return {
		el: createElement(
			"div",
			{ className: "c-player-toolbar" },
			(modeButtons[PLAYER_MODE.INLINE] = createElement("div", {
				className: "c-player-toolbar__button",
				innerText: "[I]",
				title: "player: inline",
				onClick: () =>
					actions.dispatch(PLAYER.setMode(PLAYER_MODE.INLINE)),
			})),
			(modeButtons[PLAYER_MODE.POPOUT] = createElement("div", {
				className: "c-player-toolbar__button",
				innerText: "[^]",
				title: "player: popout",
				onClick: () =>
					actions.dispatch(PLAYER.setMode(PLAYER_MODE.POPOUT)),
			})),
			(modeButtons[PLAYER_MODE.AUDIO_ONLY] = createElement("div", {
				className: "c-player-toolbar__button",
				innerText: "[A]",
				title: "player: audio only",
				onClick: () =>
					actions.dispatch(PLAYER.setMode(PLAYER_MODE.AUDIO_ONLY)),
			})),
			(modeButtons[PLAYER_MODE.DISABLED] = createElement("div", {
				className: "c-player-toolbar__button",
				innerText: "[X]",
				title: "player: hidden",
				onClick: () =>
					actions.dispatch(PLAYER.setMode(PLAYER_MODE.DISABLED)),
			})),
		),
		unload: store.stateSet.subscribe(({ player: { mode } }) => {
			for (const [key, button] of Object.entries(modeButtons)) {
				if (key === mode) {
					button.classList.add("is-enabled");
				} else {
					button.classList.remove("is-enabled");
				}
			}
		}, true),
	};
}
