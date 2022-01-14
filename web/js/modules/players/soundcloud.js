import { Event, Base, State, Status } from "./base.js";

/*
Players.Soundcloud.loadPlayer('SC208485541', 0, volume.get('soundcloud'))
*/

export class Soundcloud extends Base {
	constructor() {
		super();

		this.player = null;
		this.events = null;

		this.parameters = [
			'liking=false',
			'sharing=false',
			'show_comments=false',
			'show_playcount=false',
			'color=C600AD',
			'single_active=false'
		];
		
		this.source = 'https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/';
		this.slider = null;
		this.events = new Map([
			[window.SC.Widget.Events.PLAY, Event.Play],
			[window.SC.Widget.Events.PAUSE, Event.Pause],
			[window.SC.Widget.Events.FINISH, Event.End],
			[window.SC.Widget.Events.SEEK, Event.Seek],
			[window.SC.Widget.Events.ERROR, Event.Error]
		]);

		this.iframe = null;
	}

	ui(parent, volume) {
		parent.empty().append(
			window.$('<div>', {id: 'scBackground'}),
			window.$('<iframe>', {id: 'scPlayer'}).attr('allow', 'autoplay; encrypted-media'),
			window.$('<div>', {id: 'scVolumeSliderWrap'}).append(
				window.$('<div>', {id: 'scVolumeSlider'})
			),
		);
		
		//grab slider since it's the source of volume
		this.slider = parent.find('#scVolumeSlider');
		this.slider.slider({
			orientation:'vertical',
			range:'min',
			value: volume,
			min: 0,
			max: 100,
			stop: (_, ui) => {
				this.player.setVolume(ui.value);
				this.event(Event.Volume, {volume: ui.value});
			}
		});

		return parent.find('#scPlayer');
	}

	ready(cb) {
		if (this.status === Status.READY) {
			return cb();
		}
	}

	event(event, data) {
		switch (event) {
			case Event.Seek: data.time = data.currentPosition / 1000; break;
		}

		super.event(event, data);
	}

	loadPlayer(id, timestamp, volume) {
		this.video = {id, timestamp};

		this.iframe = this.ui(window.$(super.frame()), volume);
		this.iframe.attr(
			'src',
			`${this.source}${id.substr(2)}?${encodeURIComponent(this.parameters.join('&'))}`
		);
		this.player = window.SC.Widget(this.iframe[0]);

		//keep Events.READY separate
		this.player.bind(window.SC.Widget.Events.READY, () => {
			this.status = Status.READY;
			
			this.player.setVolume(volume);
			this.delay(timestamp);
		});

		//bind the rest of the events
		for (const [key, event] of this.events) {
			this.player.bind(key, (data) => this.event(event, data));
		}
	}

	playVideo(id) {
		this.player.load(
			`https://api.soundcloud.com/tracks/${id.substr(2)}`
		);
		this.player.play();
	}

	pause() {
		this.ready(() => this.player.pause());
	}

	play() {
		this.ready(() => this.player.play());
	}

	seek(to) {
		this.video.timestamp = to;
		this.ready(() => {
			this.player.seekTo(to * 1000);
		});
	}

	getTime(cb) {
		this.ready(() => this.player.getPosition(time => cb(time / 1000.0)));
	}

	getVolume(cb) {
		this.ready(() => this.player.getVolume(cb));
	}

	getVideoState() {
		return State.PLAYING;
	}

	destroy() {
		this.status = Status.UNREADY;

		for (const key of this.events.keys()) {
			this.player.unbind(key);
		}

		window.$(super.frame()).empty();
	}
}
