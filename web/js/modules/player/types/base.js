// eslint-disable-next-line no-unused-vars
import { ActionDispatcher } from "../../actions.js";

// eslint-disable-next-line no-unused-vars
import { PlayerDOM } from "../component.js";

import { createElement } from "../../lib.js";

export class BasePlayer {
	/**
	 * @param {string} type
	 * @param {PlayerDOM} dom
	 * @param {ActionDispatcher} actions
	 */
	constructor(type, dom, actions) {
		this.actions = actions;
		this.type = type;
		this.isEnabled = false;
		this.dom = dom;
		this.playerDom = dom.getPlayerType(this.type);
	}

	/**
	 * @param {boolean} isEnabled
	 */
	async setEnabled(isEnabled) {
		this.isEnabled = isEnabled;
		this.playerDom.setEnabled(isEnabled);
	}

	/**
	 * @returns {Promise<BtVideoState>}
	 */
	async getState() {
		return this.state;
	}

	/**
	 * @param {BtVideoState} state
	 * @returns {Promise<void>}
	 */
	async setState(state) {
		this.state = state;

		if (state.video === null) {
			this.dom.innerText = "No video.";
		} else {
			this.dom.innerText = `Unsupported video type: ${
				state.video.videotype
			}`;
		}
	}
}
