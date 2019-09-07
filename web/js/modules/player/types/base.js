/* eslint-disable no-unused-vars */
import { PlayerController } from "../controller.js";
/* eslint-enable no-unused-vars */

import { DEFAULT_PREFERENCES } from "../index.js";

export class BasePlayer {
	/**
	 * @param {PlayerController} controller
	 * @param {string} type
	 */
	constructor(controller, type) {
		this.type = type;
		this.controller = controller;
		this.preferences = DEFAULT_PREFERENCES;
	}

	/**
	 * @param {boolean} isEnabled
	 * @param {IPlayerPreferences} preferences
	 */
	async setEnabled(isEnabled, preferences) {
		this.dom.setEnabled(isEnabled);
		this.preferences = preferences;
	}

	/**
	 * @returns {Promise<IPlayerState>}
	 */
	async getState() {
		return this.state;
	}

	/**
	 * @param {IPlayerState} state
	 * @returns {Promise<void>}
	 */
	async setState(state) {
		this.state = state;
	}

	/**
	 * @returns {Promise<IPlayerPreferences>}
	 */
	async getPreferences() {
		return this.preferences;
	}

	/**
	 * @param {IPlayerPreferences} preferences
	 * @returns {Promise<void>}
	 */
	async setPreferences(preferences) {
		this.preferences = preferences;
	}
}
