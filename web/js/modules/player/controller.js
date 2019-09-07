// eslint-disable-next-line no-unused-vars
import { PlayerDOM } from "./component.js";

import { DailyMotionPlayer } from "./types/dailymotion.js";
import { FilePlayer } from "./types/file.js";
import { OsmfPlayer } from "./types/osmf.js";
import { SoundcloudPlayer } from "./types/soundcloud.js";
import { TwitchPlayer } from "./types/twitch.js";
import { TwitchClipPlayer } from "./types/twitch-clip.js";
import { VimeoPlayer } from "./types/vimeo.js";
import { YoutubePlayer } from "./types/youtube.js";
import { BasePlayer } from "./types/base.js";
import { Subscribable } from "../actions.js";
import { comparePreferences } from "./index.js";

export class PlayerController {
	/**
	 * @param {PlayerDOM} component
	 */
	constructor(component) {
		this.nullPlayer = new BasePlayer(this, null);
		this.current = this.nullPlayer;
		this.stateChanged = new Subscribable();
		this.preferencesChanged = new Subscribable();
		this.component = component;

		this.players = {
			dm: new DailyMotionPlayer(this, component.getPlayerType("dm")),
			file: new FilePlayer(this, component.getPlayerType("file")),
			osmf: new OsmfPlayer(this, component.getPlayerType("osmf")),
			soundcloud: new SoundcloudPlayer(
				this,
				component.getPlayerType("soundcloud"),
			),
			twitchclip: new TwitchClipPlayer(
				this,
				component.getPlayerType("twitchclip"),
			),
			twitch: new TwitchPlayer(this, component.getPlayerType("twitch")),
			vimeo: new VimeoPlayer(this, component.getPlayerType("vimeo")),
			yt: new YoutubePlayer(this, component.getPlayerType("yt")),
		};
	}

	async ensureEnabled(type) {
		let next = this.players[type];
		if (next === this.current) {
			return this.current;
		}

		this.component.showPlayer(type);

		if (next) {
			const preferences = await this.current.getPreferences();
			if (!comparePreferences(preferences, await next.getPreferences())) {
				this.preferencesChanged.dispatch(preferences);
			}

			await next.setEnabled(true, preferences);
		} else {
			this.component.setError(`player type ${type} not found`);
			next = this.nullPlayer;
		}

		return (this.current = next);
	}
}
