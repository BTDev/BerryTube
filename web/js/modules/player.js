import { Dailymotion } from "./players/dailymotion.js";
import { Raw } from "./players/raw.js";
import { Soundcloud } from "./players/soundcloud.js";
import { Twitch } from "./players/twitch.js";
import { Twitchclip } from "./players/twitchclip.js";
import { Vimeo } from "./players/vimeo.js";
import { Youtube } from "./players/youtube.js";

export class Players {
	constructor() {
		this.Youtube = new Youtube();
		this.Vimeo = new Vimeo();
		this.Dailymotion = new Dailymotion();
		this.Soundcloud = new Soundcloud();
		this.Twitch = new Twitch();
		this.Twitchclip = new Twitchclip();
		this.Raw = new Raw();

		this.mappings = new Map([
			['yt', this.Youtube],
			['vimeo', this.Vimeo],
			['dm', this.Dailymotion],
			['twitch', this.Twitch],
			['twitchclip', this.Twitchclip],

			['soundcloud', this.Soundcloud],
			['osmf', this.Raw],
			['manifest', this.Raw],
			['file', this.Raw],
			['dash', this.Raw],
			['hls', this.Raw],
		]);
	}

	hasPlayer(videotype) {
		return this.mappings.has(videotype);
	}

	playerFromVideoType(video) {
		return this.mappings.get(video);
	}

	switch(from, to) {
		const [now, next] = [from, to].map(kind => this.playerFromVideoType(kind));

		if (now) {
			now.destroy();
			now.resetRetries();
		}

		return [next, to];
	}

	register(name, player) {
		this.mappings.set(
			name,
			player
		);
	}

	unregister(name) {
		this.mappings.delete(name);
	}
}