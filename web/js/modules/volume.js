const playerVolumeInfo = {
	yt: { range: 100, listen: true },
	dm: { range: 1, listen: false },
	vimeo: { range: 1, listen: false },
	soundcloud: { range: 100, listen: false },
	file: { range: 1, listen: false },
	dash: { range: 1, listen: false },
	twitch: { range: 1, listen: true },
	twitchclip: { range: 1, listen: true },
	osmf: { range: 1, listen: false },
	hls: { range: 1, listen: false },

	//defined for internal volume
	internal: { range: 1, listen: false },
};

export class VolumeManager {
	constructor() {
		this.volume = this.load();
		this.listener = null;
		this.disabled = false;
	}

	/**
	 * Enable the automatic listening
	 */
	enable() {
		this.disabled = false;
	}

	/**
	 * Disable the automatic listening
	 */
	disable() {
		this.stop();
		this.disabled = true;
	}

	/**
	 * Load the saved volume from localStorage.
	 * Defaults to 0.5 if volume doesn't exist
	 * @returns {number} Volume
	 */
	load() {
		//initial load will always end up being null
		//so volume will initially be 0.5
		const storedVolume = localStorage.getItem("volume");
		const volume = storedVolume ? parseFloat(storedVolume) : 0.5;

		//backwards compatible
		//lets not break userscripts yet
		window.VOLUME = volume;

		return volume;
	}

	/**
	 * Saves the internal volume to localStorage.
	 */
	save() {
		localStorage.setItem("volume", this.volume.toString());
	}

	/**
	 * Get volume, converts to given players volume range if necessary
	 * @param {string} player videotype/player type
	 * @returns {number} volume
	 */
	get(player = "internal") {
		const info = playerVolumeInfo[player];

		if (!info) {
			console.warn(`Invalid player: ${player}, returning internal volume`);
			return this.volume;
		}

		return Number(this.volume) * info.range;
	}

	/**
	 * Set the volume, converts to 0..1 range if player outputs
	 * volume range that exceeds 0..1
	 * @param {number} volume
	 * @param {boolean} save Save the volume to localStorage
	 */
	set(volume, save = true) {
		if (typeof volume !== "number" || volume < 0) {
			return;
		}

		//majority of the players do have max 3 decimals, except dailymotion
		const converted = Math.min(Number((volume > 1 ? volume / 100 : volume).toFixed(3)), 1);

		//we have nothing to update
		if (converted === this.volume) {
			return;
		}

		this.volume = converted;

		//backwards compatible
		//lets not break userscripts yet
		window.VOLUME = converted;

		if (save) {
			this.save();
		}
	}

	/**
	 * Stop the listener
	 */
	stop() {
		clearInterval(this.listener);
	}

	/**
	 * Attempts to listen to volume changes on the player.
	 * Not all players require this and will be handled accordingly
	 * @param {*} player Player object
	 * @param {string} playerType Player or videotype, eg. "yt"
	 */
	listen(player, playerType) {
		if (this.disabled) {
			return;
		}

		//stop it regardless of whether it's listening
		this.stop();

		const info = playerVolumeInfo[playerType];

		//this isn't a player you want to listen
		if (!info || !info.listen) {
			return;
		}

		this.listener = setInterval(() => {
			//either player hasn't finished initialization yet
			//or we have no volume control support(?)
			if (!player || !player.getVolume) {
				return;
			}

			player.getVolume(volume => this.set(volume));
		}, 2000);
	}
}
