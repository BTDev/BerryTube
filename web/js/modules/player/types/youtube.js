import { BasePlayer } from "./base.js";

export class YoutubePlayer extends BasePlayer {
	constructor(dom, actions) {
		super("yt", dom, actions);
	}

	/**
	 * @param {boolean} isEnabled
	 */
	async setEnabled(isEnabled) {
		await super.setEnabled(isEnabled);
	}

	/**
	 * @returns {Promise<BtVideoState>}
	 */
	async getState() {
		return await super.getState();
	}

	/**
	 * @param {BtVideoState} state
	 * @returns {Promise<void>}
	 */
	async setState(state) {
		await super.setState(state);
		this.dom.el.innerText = `${this.type}: ${JSON.stringify(
			state,
		)} ${JSON.stringify(this.preferences)}`;
	}
}
