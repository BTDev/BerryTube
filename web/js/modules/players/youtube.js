import { Base, Event, Status } from "./base.js";
import { Errors } from "./errors.js";

export class Youtube extends Base {
	constructor() {
		super();

		this.player = null;
		this.options = {
			playerVars: {
				disablekb: 1,
				enablejsapi: 1,
				iv_load_policy: 3,
				modestbranding: 1,
				playsinline: 1,
				rel: 0,
				autoplay: 0,
			},
			events: {
				'onError': this.error.bind(this),
				'onReady': this.setReady.bind(this),
				'onStateChange': this.event.bind(this),
			}
		};

		if (window.getStorage("legacyPlayer") == 0) {
			this.options.playerVars.wmode = "transparent";
		}
		
		//not using namespaced variables here to avoid waiting in constructor
		this.states = new Map([
			[-1, Event.Initialise],
			[0, Event.End],
			[1, Event.Play],
			[2, Event.Pause],
			[3, Event.Buffer],
			[5, Event.Load],
		]);

		this.errors = new Map([
			//why are you yeeting an invalid id at me?
			[2, Errors.PLAYER_INVALID_ID],

			//something happened, probably a cosmic ray
			[5, Errors.PLAYER_UNKNOWN_ERROR],

			//private video
			[100, Errors.PLAYER_UNPLAYABLE_VIDEO],
			
			//syndicated video, aka watch at youtube.com only
			[101, Errors.PLAYER_UNPLAYABLE_VIDEO],
			[150, Errors.PLAYER_UNPLAYABLE_VIDEO],
		]);
	}

	setReady() {
		//when the player is ready state has to be > -1
		//-1 when ready means the content is not playable/error occurred
		this.status = this.player.getPlayerState() > -1 ? Status.READY : Status.ERROR;

		//no idea what error state to give, assume unplayable video
		if (this.status === Status.ERROR) {
			return this.error({data: 101});
		}

		//set volume
		this.player.setVolume(this.video.volume);

		//finally seek to the correct spot
		this.delay(this.video.timestamp);
	}

	//error is not always triggered
	error(event) {
		this.status = Status.ERROR;

		super.error(
			this.errors.get(event.data),
			this
		);
	}

	ready(cb) {
		if (this.status === Status.READY) {
			cb();
		}
	}

	event(event) {
		super.event(this.states.get(event.data));
	}

	loadPlayer(id, timestamp, volume, length) {
		this.video = {id, timestamp, volume, length, sync: length > 0};
		//clear up past crashes
		this.status = Status.UNREADY;

		window.waitForFlag('YTAPREADY', () => {
			this.player = new window.YT.Player(this.frame().id, {
				videoId: id,
				width: this.width,
				height: this.height,
				...this.options,
			});
		});
	}

	playVideo(id, timestamp, volume, length) {
		//different video, clear error status
		if (this.status === Status.ERROR) {
			this.status = Status.READY;
		}
		
		window.waitForFlag('YTAPREADY', () => {
			this.video = {id, timestamp, volume, length, sync: length > 0};
			this.player.cueVideoById(id);
			this.player.setVolume(volume);
			this.delay(timestamp);
		});
	}

	pause() {
		this.ready(() => this.player.pauseVideo());
	}

	play() {
		this.ready(() => this.player.playVideo());
	}

	seek(to) {
		this.video.timestamp = to;
		this.ready(() => {
			this.player.seekTo(to, true);
		});
	}

	getTime(cb) {
		this.ready(() => cb(this.video.sync ? this.player.getCurrentTime() : -1));
	}

	getVolume(cb) {
		this.ready(() => {
			const muted = this.player.isMuted();
			const volume = muted ? 0 : this.player.getVolume();

			cb(volume);
		});
	}

	getVideoState() {
		return this.player.getPlayerState();
	}

	destroy() {
		this.status = Status.UNREADY;
		this.player.destroy();
	}
}