/* eslint-disable no-console */
/* eslint-disable no-undef */
import { Base, State } from "./base.js";

export class Twitchclip extends Base {
	constructor() {
		super();
	}

	loadPlayer(src, _, volume) {
		this.video = {id: src};

		const parameters = [
			`clip=${src}`,
			`parent=${document.location.hostname}`,
			`autoplay=true`
		];

		$(super.frame()).empty().append(
			$('<iframe>', {
				id: 'twitchclipplayer',
				src: `https://clips.twitch.tv/embed?${parameters.join('&')}`,
				width: this.width,
				height: this.height,
				frameborder: '0',
				scrolling: 'no',
				preload: 'auto',
				allowfullscreen: 'true',
				muted: volume === 0,
			})
		);
	}

	getVideoState() {
		return State.PLAYING;
	}

	destroy() {
		document.getElementById('twitchclipplayer').remove();
	}
}