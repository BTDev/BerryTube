import { BasePlayer } from "./base.js";

export class TwitchClipPlayer extends BasePlayer {
	/**
	 * @param {PlayerTypeDOM} dom
	 */
	constructor(dom) {
		super("twitchclip");
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
