// eslint-disable-next-line no-unused-vars
import { ActionDispatcher, Store } from "../actions.js";
import { createElement } from "../lib.js";
import { PlayerToolbar } from "./PlayerToolbar.js";

/**
 * @param {ActionDispatcher} actions
 * @param {Store} store
 */
export async function DisabledPlayer(actions, store) {
	const videoWrap = document.querySelector("#videowrap");

	const toolbar = await PlayerToolbar(actions, store);
	videoWrap.classList.add("is-collapsed");
	return {
		el: createElement(
			"div",
			{
				className: "c-disabled-player",
			},
			toolbar.el,
			createElement("div", { innerText: "DISABLED" }),
		),
		async unload() {
			videoWrap.classList.remove("is-collapsed");
			await toolbar.unload();
		},
	};
}
