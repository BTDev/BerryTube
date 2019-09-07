import { Store } from "../../main.player.js";

export class BasePlayer {
	/**
	 * @param {string} type
	 */
	constructor(type) {
		this.type = type;
		Store.preferences.subscribe(p => this.setPreferences(p));
	}

	/**
	 * @param {boolean} isEnabled
	 * @param {IPlayerPreferences} preferences
	 */
	async setEnabled(isEnabled) {
		this.dom.setEnabled(isEnabled);
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
		return Store.preferences.value;
	}

	/**
	 * @param {IPlayerPreferences} preferences
	 * @returns {Promise<void>}
	 */
	async setPreferences(preferences) {}
}
