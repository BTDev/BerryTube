import { Event, Base, State } from "./base.js";
import { Errors } from "./errors.js";

const QUALITY_LOCAL_STORAGE_KEY = "quality";
let selectedQuality = null;

const fileExtensionRegex = /\.([\w]+)$/;
const fileMimeTypes = new Map([
	['mp4', 'video/mp4'],
	['m4v', 'video/mp4'],
	['webm', 'video/webm'],
	['m3u8', 'application/x-mpegURL'],
	['mpd', 'application/dash+xml'],
	['rtmp', 'rtmp/mp4']
]);

function getFileExtension(path) {
	const match = path.match(fileExtensionRegex);

	if (!match) {
		return null;
	}

	return match[1];
}

function getUserQualityPreference() {
	if (selectedQuality === null) {
		selectedQuality = window.getStorageInteger(QUALITY_LOCAL_STORAGE_KEY, 1080);
	}

	return selectedQuality;
}

function setUserQualityPreference(value) {
	if (typeof (value) !== "number") {
		return;
	}

	selectedQuality = value;
	window.setStorageInteger(QUALITY_LOCAL_STORAGE_KEY, value);
}

function pickSourceAtQuality(sources, quality) {
	// make this smarter sometime? dunno

	for (const source of sources) {
		if (source.quality === quality) {
			return source;
		}
	}

	return sources.length > 0 ? sources[0] : null;
}

function sourcesFromManifest(manifest) {
	const target = pickSourceAtQuality(manifest.sources, getUserQualityPreference());
	const sources = manifest.sources.map((source) => {
		const $source = {
			src: source.url,
			type: source.contentType,
			label: source.quality
		};

		if (target == source) {
			$source.selected = true;
		}

		return $source;
	});

	return sources;
}

export class Raw extends Base {
	constructor() {
		super();
		
		this.player = null;
		this.events = new Map([
			['volumechange', Event.Volume],
			['ended', Event.End],
			['pause', Event.Pause],
			['seeked', Event.Seek],
			['play', Event.Play],
			['qualitySelected', Event.Quality],
			['error', Event.Error]
		]);

		this.errors = new Map([
			[MediaError.MEDIA_ERR_NETWORK, Errors.PLAYER_UNKNOWN_ERROR],
			[MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED, Errors.PLAYER_UNPLAYABLE_VIDEO],
			[MediaError.MEDIA_ERR_DECODE, Errors.PLAYER_UNKNOWN_ERROR],
		]);

		this.sources = [];
		this.state = State.PLAYING;
		this.config = {
			autoplay: false,
			controls: true,
		};
	}

	ready(cb) {
		this.player.ready(cb);
	}

	event(event, data) {
		switch (event) {
			case Event.Volume: data.volume = this.player.volume(); break;
			case Event.Pause: this.state = State.PAUSED; break;
			case Event.Play: this.state = State.PLAYING; break;
			case Event.Seek: data.time = this.player.currentTime(); break;
			case Event.End: this.state = State.ENDED; break;
			//label can be undefined so keep the quality preference
			case Event.Quality: setUserQualityPreference(data.label || getUserQualityPreference()); break;
		}

		super.event(
			event,
			data
		);
	}

	getSources(file, manifest) {
		let extension = manifest ? null : getFileExtension(file);   
		
		//TODO: Implement better handling for RTMP and 
		//other extensionless links (currently only rtmp)
		//maybe have the info in meta?
		if (!extension && !manifest) {
			extension = file.startsWith('rtmp') ? 'rtmp' : null;
		}

		if (manifest) {
			return sourcesFromManifest(manifest);
		} else {
			return [{src: file, type: fileMimeTypes.get(extension) || 'video/mp4'}];
		}
	}

	loadPlayer(id, timestamp, volume, length, meta) {
		if (meta.manifest && meta.manifest.sources.length === 0) {
			console.error('Manifest has no items');
			return;
		}

		this.video = {id, meta, timestamp, sync: length > 0};
		this.frame = window.$("<video>", {
			id: "vjs_player",
			class: "video-js vjs-default-skin"
		});
	
		//clear frame and add player
		window.$(super.frame()).empty().append(
			this.frame
		);

		this.player = window.videojs(this.frame[0].id, this.config);
		this.sources = this.getSources(id, meta.manifest);
	
		//if we have multiple sources/qualities, add the quality selector 
		if (this.sources.length > 1) {
			this.player.controlBar.addChild('QualitySelector');
		}
	
		this.ready(() => {
			this.player.volume(volume);
	
			for (const [key, event] of this.events) {
				this.player.on(key, (_, data) => this.event(event, {...data}));
			}
	
			//add the sources
			this.player.src(this.sources);
			this.delay(timestamp);
		});
	}

	playVideo(id, timestamp, _, length, meta) {
		this.player.controlBar.removeChild('QualitySelector');

		this.video = {id, timestamp, meta, sync: length > 0};
		this.sources = this.getSources(id, meta.manifest);

		if (this.sources.length > 1) {
			this.player.controlBar.addChild('QualitySelector');
		}

		this.ready(() => {
			this.player.src(this.sources);
			this.delay(timestamp);
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
		this.ready(() => this.player.currentTime(to));
	}

	getTime(cb) {
		this.ready(() => cb(this.video.sync ? this.player.currentTime() : -1));
	}

	getVolume(cb) {
		this.ready(() => cb(this.player.muted() ? 0 : this.player.volume()));
	}

	getVideoState() {
		return this.state;
	}

	destroy() {
		this.player.dispose();
	}
}