import { Event, Base, State, Status } from "./base.js";

function parseTwitchSource(src) {
	const parts = src.split('/');

	if (parts[0] === 'videos') {
		return ['video', parts[1]];
	} else {
		return ['channel', parts[0]];
	}
}

export class Twitch extends Base {
	constructor() {
		super();

		this.player = null;
		this.events = new Map([
			[window.Twitch.Player.SEEK, Event.Seek],
			[window.Twitch.Player.PLAYING, Event.Play],
			[window.Twitch.Player.READY, Event.Ready],
		]);
	}

	ready(cb) {
		if (this.status === Status.READY) {
			return cb();
		}
	}

	event(event, data) {
		switch (event) {
			case Event.Ready: {
				this.status = Status.READY; 
				this.player.setVolume(this.video.volume);
				this.delay(this.video.timestamp);
				break;
			}
			case Event.Seek: {
				this.video.timestamp = data.position;
				data = {time: data.position}; 
				break;
			}
		}

		super.event(event, data);
	}

	loadPlayer(id, timestamp, volume, length) {
		this.video = {id, timestamp, volume, length, sync: length > 0};

		const parts = parseTwitchSource(id);
		const options = {
			[parts[0]]: parts[1],
			muted: volume === 0,
			width: this.width,
			height: this.height,
			autoplay: timestamp >= 0,
		};

		window.$(this.frame()).empty();

		this.player = new window.Twitch.Player(this.frame().id, options);
		this.events.forEach((value, key) => {
			this.player.addEventListener(key, (data) => this.event(value, data));
		});
	}

	playVideo(id, timestamp, volume, length) {
		this.video = {id, timestamp, volume, length, sync: length > 0};
		this.ready(() => {
			const parts = id.split('/');
			if (parts[0] === 'videos') {
				this.player.setVideo(parts[1], timestamp);
			} else {
				this.player.setChannel(parts[0]);
			}
		});
	}

	pause() {
		this.ready(() => this.player.pause());
	}

	play() {
		this.ready(() => this.player.play());
	}

	seek(to) {
		this.video.timestamp = to;
		this.ready(() => this.player.seek(to));
	}

	getTime(cb) {
		this.ready(() => {
			cb(this.player.getDuration() === Infinity ? -1 : this.player.getCurrentTime());
		});
	}

	getVolume(cb) {
		this.ready(() => cb(this.player.getVolume()));
	}

	getVideoState() {
		return State.PLAYING;
	}

	destroy() {
		this.status = Status.UNREADY;
		window.$(this.frame()).empty();
	}
}