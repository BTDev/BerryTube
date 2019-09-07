import { BasePlayer } from "./base.js";

export class TwitchPlayer extends BasePlayer {
	/**
	 * @param {PlayerTypeDOM} dom
	 */
	constructor(dom) {
		super("twitch");
		this.dom = dom;
	}

	/**
	 * @param {boolean} isEnabled
	 */
	async setEnabled(isEnabled) {
		await super.setEnabled(isEnabled);
	}

	/**
	 * @returns {Promise<IPlayerState>}
	 */
	async getState() {
		return await super.getState();
	}

	/**
	 * @param {IPlayerState} state
	 * @returns {Promise<void>}
	 */
	async setState(state) {
		await super.setState(state);
		this.dom.el.innerText = `${this.type}: ${JSON.stringify(
			state,
		)} ${JSON.stringify(this.preferences)}`;
	}
}
