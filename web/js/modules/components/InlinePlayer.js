// eslint-disable-next-line no-unused-vars
import { ActionDispatcher, Store } from "../actions.js";
import { createElement, PromiseSource } from "../lib.js";
import { PlayerToolbar } from "./PlayerToolbar.js";

/**
 * @param {ActionDispatcher} actions
 * @param {Store} store
 */
export async function InlinePlayer(actions, store) {
	const promise = new PromiseSource();
	const toolbar = await PlayerToolbar(actions, store);

	const iframe = createElement("iframe", {
		className: "c-inline-player__iframe",
		onload: finish,
		onerror(e) {
			promise.reject(e);
		},
	});

	const component = {
		el: createElement(
			"div",
			{
				className: "c-inline-player",
			},
			iframe,
			toolbar.el,
		),
		async unload() {
			await toolbar.unload();
		},
	};

	iframe.src = "/player.php";
	return component;

	function finish() {
		promise.resolve(component);
	}
}
