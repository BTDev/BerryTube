import { createElement } from "../lib.js";

const title = Symbol();

/**
 * Abstracts the player DOM
 */
export class PlayerDOM {
	get title() {
		return this[title];
	}

	set title(value) {
		this[title] = value;
		window.document.title = `${value} :: BerryTube`;
	}

	/**
	 * @param {HTMLElement} el
	 */
	constructor(el) {
		this.types = new Map();
		this.el = el;
		this.el.classList.add("c-player");
		this.el.appendChild(
			(this.elErrorMessage = createElement("div", {
				className: "c-player__error-message",
			})),
		);
	}

	setError(message) {
		this.el.classList.add("has-error");
		this.elErrorMessage.innerText = message;
	}

	clearError() {
		this.el.classList.remove("has-error");
		this.elErrorMessage.innerText = "";
	}

	/**
	 * @param {string} type
	 * @returns {PlayerTypeDOM}
	 */
	getPlayerType(type) {
		let dom = this.types.get(type);
		if (dom) {
			return dom;
		}

		const playerTypeEl = createElement("div", {
			className: `c-player-type is-inactive c-player-type__${type}`,
		});

		dom = new PlayerTypeDOM(this, playerTypeEl);
		this.types.set(type, dom);
		this.el.appendChild(playerTypeEl);
		return dom;
	}

	showPlayer(type) {
		const current = this.current;
		const next = this.types.get(type);
		if (current === next) {
			return;
		}

		if (current) {
			current.setEnabled(false);
		}

		this.current = next;
		if (next) {
			next.setEnabled(true);
		}
	}
}

/**
 * Represents the DOM of an individual player
 */
export class PlayerTypeDOM {
	get isEnabled() {
		return this.player.current === this;
	}

	/**
	 * @param {PlayerDOM} player
	 * @param {HTMLDivElement} el
	 */
	constructor(player, el) {
		this.player = player;
		this.el = el;
	}

	setEnabled(isEnabled) {
		if (isEnabled) {
			this.el.classList.add("is-active");
			this.el.classList.remove("is-inactive");
		} else {
			this.el.classList.remove("is-active");
			this.el.classList.add("is-inactive");
		}
	}
}
