import { Base, Event, State, Status } from "./base.js";
import { Errors } from "./errors.js";

export class Vimeo extends Base {
	constructor() {
		super();
		this.player = null;
		this.options = {
			autopause: false,
			color: 'C600AD',
			keyboard: false,
		};
 
		this.events = new Map([
			['ended', Event.End],
			['play', Event.Play],
			['volumechange', Event.Volume],
			['pause', Event.Pause],
			['seeked', Event.Seek],
			['loaded', Event.Load],
			['bufferstart', Event.Buffer]
		]);

		this.errors = new Map([
			//video cannot be played
			['PasswordError', Errors.PLAYER_UNPLAYABLE_VIDEO],
			['PrivacyError', Errors.PLAYER_UNPLAYABLE_VIDEO],
			
			//some generic error, can be attempted to play
			['Error', Errors.PLAYER_UNKNOWN_ERROR],
			
			//TODO: Add more relevant error
			['UnsupportedError', Errors.PLAYER_UNKNOWN_ERROR],
			['RangeError', Errors.PLAYER_UNKNOWN_ERROR],
		]);

		this.state = State.PLAYING;
		this.err = null;
	}

	error(err) {
		this.err = this.errors.get(err.name) || Errors.PLAYER_UNKNOWN_ERROR;

		super.error(
			this.err,
			this
		);
	}

	ready(cb) {
		if (this.err || this.status !== Status.READY) {
			return;
		}

		this.player.ready().then(cb).catch(err => this.error(err));
	}

	event(event, data) {
		switch (event) {
			case Event.End: this.state = State.ENDED; break;
			case Event.Play: this.state = State.PLAYING; break;
			case Event.Pause: this.state = State.PAUSED; break;
			case Event.Buffer: this.state = State.BUFFER; break;
		}

		//map the things
		super.event(
			event,
			{
				time: data.seconds,
				volume: data.volume,
				player: this,
			}
		);
	}

	loadPlayer(id, timestamp, volume) {
		this.video = {id, timestamp};
		this.err = null;

		const frame = super.frame();

		//vimeo keeps the "Loading...", so clear it
		//parent and actual frame also needs 100% on width and height
		window.$(frame).empty().append(
			window.$('<iframe>', {
				src: `https://player.vimeo.com/video/${id}`,
				class: 'player_vimeo',
				frameborder: '0',
				allow: `autoplay; encrypted-media; fullscreen`,
			})
		);

		this.player = new window.Vimeo.Player(frame.children[0], {
			id,
			muted: volume === 0,
			autoplay: timestamp >= 0,
			...this.options,
		});

		//for some reason this doesn't work when creating the player \\bpshrug 
		this.player.setColor(this.options.color);
		
		//attach events
		this.events.forEach((value, key) => {
			this.player.on(key, (data) => this.event(value, data));
		});
		//wait for ready
		this.player.ready().then(() => {
			this.status = Status.READY;
			this.player.setVolume(volume);
			this.delay(timestamp);
		}).catch(err => this.error(err));
	}

	playVideo(id, timestamp) {
		this.video = {id, timestamp};
		this.player.loadVideo(id).then(() => {
			this.delay(timestamp);
		});
	}

	pause() {
		this.ready(() => this.player.pauseVideo());
	}

	play() {
		this.ready(() => this.player.play());
	}

	seek(to) {
		this.video.timestamp = to;
		this.ready(() => this.player.setCurrentTime(to));
	}

	getTime(cb) {
		this.ready(() => this.player.getCurrentTime().then(cb));
	}

	getVolume(cb) {
		this.ready(() => this.player.getVolume().then(cb));
	}

	getVideoState() {
		return this.state;
	}

	destroy() {
		this.status = Status.UNREADY;

		for (const key of this.events.keys()) {
			this.player.off(key);
		}

		this.err = null;
		this.player.unload().then(() => {
			this.player.destroy();
		});
	}
}