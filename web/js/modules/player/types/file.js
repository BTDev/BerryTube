import { BasePlayer } from "./base.js";

export class FilePlayer extends BasePlayer {
	constructor(dom, actions) {
		super("file", dom, actions);
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
			this.state.video,
		)} ${JSON.stringify(this.state.preferences)}`;
	}
}
