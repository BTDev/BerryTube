/* eslint-disable no-unused-vars */
import { PlayerTypeDOM } from "../component.js";
import { PlayerController } from "../controller.js";
/* eslint-enable no-unused-vars */

import { BasePlayer } from "./base.js";

export class SoundcloudPlayer extends BasePlayer {
	/**
	 * @param {PlayerController} controller
	 * @param {PlayerTypeDOM} dom
	 */
	constructor(controller, dom) {
		super(controller, "soundcloud");
		this.dom = dom;
	}

	/**
	 * @param {boolean} isEnabled
	 * @param {IPlayerPreferences} preferences
	 */
	async setEnabled(isEnabled, preferences) {
		await super.setEnabled(isEnabled, preferences);
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

	/**
	 * @returns {Promise<IPlayerPreferences>}
	 */
	async getPreferences() {
		return await super.getPreferences();
	}

	/**
	 * @param {IPlayerPreferences} preferences
	 * @returns {Promise<void>}
	 */
	async setPreferences(preferences) {
		await super.setPreferences(preferences);
	}
}
