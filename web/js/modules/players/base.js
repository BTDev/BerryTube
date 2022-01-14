import { Errors } from "./errors.js";

export const Event = {
	Error: -1,
	Initialise: 0,
	Load: 1,
	Play: 2,
	End: 3,
	Pause: 4,
	Seek: 5,
	Volume: 6,
	Ready: 7,
	API: 8,
	Quality: 9,
	Buffer: 10,
};

export const Status = {
	UNREADY: 0,
	READY: 1,
	ERROR: 2,
};

//these are based on YT players states, assuming server uses similar
export const State = {
	ENDED: 0,
	PLAYING: 1,
	PAUSED: 2,
	BUFFER: 3,
};

//Maybe make this into a setting?
const MAX_REFRESH_RETRIES = 10;

export class Base {
	constructor() {
		this.height = window.videoHeight; //player height
		this.width = window.videoWidth; //player width
	
		this.retries = 0; //number of attempts when error occurred
		this.video = {}; //keep the video information

		//player status and state
		this.status = Status.UNREADY;
	}

	//this done due to legacy player removal (+ maltweaks)
	//the #ytapiplayer was deleted and then recreated, therefore
	//needing a dynamic grabbing of the frame
	frame() {
		return document.querySelector('#ytapiplayer');
	}

	error(error) {
		if (window.DEBUG) {
			console.error(
				`Player ${window.VIDEO_TYPE} errored:`,
				error
			);
		}

		//something is more broke, stop trying and fix
		if (this.retries >= MAX_REFRESH_RETRIES || error === Errors.PLAYER_UNPLAYABLE_VIDEO) {
			return;
		} else {
			if (window.DEBUG) {
				console.warn(
					'Error is probably recoverable, attempting to refresh player'
				);
			}

			this.destroy();
			this.loadPlayer(
				this.video.id,
				this.video.timestamp,
				window.volume.get(window.VIDEO_TYPE),
				this.video.length,
				this.video.meta,	
			);
		}

		this.retries += 1;
	}

	event(event, data) {
		switch (event) {
			case Event.End: window.videoEnded(); break; 
			case Event.Pause: window.videoPaused(); break;
			case Event.Seek: window.videoSeeked(data.time); break;
			case Event.Play: window.videoPlaying(); break;
			case Event.Volume: window.volume.set(data.volume); break;
			
			//incase the player has error event mixed
			case Event.Error: this.error(data.error, data.player); break;
			
			//there are more events that are not handled atm, but could be in the future
			//only bugger in debug mode
			default: {
				if (window.DEBUG) {
					console.info(`Player ${window.VIDEO_TYPE} gave an unhandled event ${event}`);
				}
			}
		}
	}

	resetRetries() {
		this.retries = 0;
	}

	setReady() {}

	ready(_cb) {}

	loadPlayer(_id, _timestamp, _volume, _length, _meta) {}

	playVideo(_id, _timestamp) {}

	//we have autoplay enabled everywhere 
	//yet we actively don't let it autoplay, smh
	delay(timestamp) {
		if (timestamp < 0) {
			setTimeout(() => this.play(), timestamp * -1000);
		} else {
			//this -> the player, not base class
			this.play();
			this.seek(timestamp);
		}
	}

	pause() {}

	play() {}

	seek(_to) {}

	getTime(cb) {
		cb(-1);
	}

	getVolume(cb) {
		cb(-1);
	}

	getVideoState() {
		return State.PLAYING;
	}

	isReady() {
		return this.status === Status.READY;
	}

	destroy() {}
}