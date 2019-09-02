const PLAYER_STATE_PAUSED = 2;
const PLAYER_STATE_PLAYING = 1;
const PLAYER_STATE_ENDED = 0;
const PLAYER_STATE_BUFFERING = 3;

function resetVideoContainer() {
	$("#ytapiplayer").remove();

	$("<div />")
		.attr("id", "ytapiplayer")
		.appendTo($("#videowrap"));
}

/**
 * time has passed between when the forceVideoChange event happened
 * and now - so adjust the target time accordingly
 */
function adjustVideoTime(id, at) {
	const lastEvent = window.lastVideoChangeEvent;
	if (!lastEvent || lastEvent.id !== id) {
		return at;
	}

	return at + (new Date().getTime() - lastEvent.at) / 1000;
}

window.PLAYERS.dm = {
	async setEnabled(isEnabled) {
		if (!isEnabled) {
			if (this.$el) {
				this.$el.css("display", "none");
			}

			if (this.PLAYER) {
				this.PLAYER.pause();
			}

			return;
		}

		if (this.$el) {
			this.$el.css("display", "block");
			return;
		}
	},

    playVideo(id, at) {
		at = adjustVideoTime(id, at);
		if (at < 0) {
			this.PLAYER.pause();
			this.PLAYER.load(id, { autoplay: false });
			setTimeout(() => {
				this.play();
			}, at * -1000);
		} else {
			this.PLAYER.load(id, { autoplay: true, start: at });
		}
	},
	
    loadPlayer(id, at, volume) {
		if (this.PLAYER) {
			const setVolume = () => {
				this.PLAYER.seek(adjustVideoTime(id, at));
				this.PLAYER.setVolume(volume);
				this.PLAYER.removeEventListener("playing", setVolume);
			};

			this.PLAYER.addEventListener("playing", setVolume);
			this.playVideo(id, at);
			return;
		}
		
		return new Promise((resolve, reject) => {
			const timeoutTimeout = window.setTimeout(() => 
				reject(new Error("Dailymotion took too long?")), 
				10000);

			this.$el = $(`<div class="player" />`).appendTo($("#videowrap"));
			this.PLAYER = new DM.player($("<div />").appendTo(this.$el)[0], {
				video: id,
				params: {
					"queue-autoplay-next": false,
					"queue-enable": false,
					"sharing-enable": false,
					"ui-highlight": "c600ad",
					"ui-logo": false,
					"ui-start-screen-info": false,
					autoplay: false,
				}
			});

			const firstReady = () => {
				window.clearTimeout(timeoutTimeout);
				const adjustedAt = adjustVideoTime(id, at);
				if (adjustedAt < 0) {
					setTimeout(() => {
						this.PLAYER.play();
					}, adjustedAt * -1000);
				} else {
					const firstPlay = () => {
						this.PLAYER.setVolume(volume);
						this.PLAYER.seek(adjustVideoTime(id, at));
						this.PLAYER.removeEventListener("playing", firstPlay);
					};

					this.PLAYER.addEventListener("playing", firstPlay);
					this.PLAYER.play();
				}

				this.PLAYER.removeEventListener("playback_ready", firstReady);
				resolve();
			};

			this.PLAYER.addEventListener("playback_ready", firstReady);
		})
	},
	
    pause() {
        if (this.PLAYER) {
            this.PLAYER.pause();
        }
	},
	
    play(){
        if (this.PLAYER) {
            this.PLAYER.play();
        }
	},
	
    seek(pos) {
        if (this.PLAYER) {
            this.PLAYER.seek(pos);
        }
	},
	
    getVideoState() {
        return 1;
	},
	
    getTime(callback) {
        if (callback && this.PLAYER) {
            callback(this.PLAYER.currentTime);
        }
	},
	
    getVolume(callback) {
        if (callback && this.PLAYER) {
            callback(this.PLAYER.volume);
		}
    }
};

window.PLAYERS.yt = {
	async setEnabled(isEnabled) {
		if (!isEnabled) {
			if (this.$el) {
				this.$el.css("display", "none");
			}

			if (this.PLAYER) {
				this.PLAYER.stopVideo();
			}

			return;
		}

		if (this.$el) {
			this.$el.css("display", "block");
			return;
		}

		this.$el = $(`<div class="player" />`).appendTo($("#videowrap"));

		await new Promise(resolve => waitForFlag("YTAPREADY", resolve));

		await new Promise(resolve => {
			const $innerEl = $("<div />").appendTo(this.$el);
			this.PLAYER = new YT.Player($innerEl[0], {
				playerVars: {
					disablekb: 1,
					enablejsapi: 1,
					iv_load_policy: 3,
					modestbranding: 1,
					playsinline: 1,
					rel: 0,
					autoplay: 1
				},
				events: {
					onReady: resolve,
					onStateChange: this.onPlayerStateChange
				}
			});
		});
	},

    playVideo(id, at) {
		const adjustedAt = adjustVideoTime(id, at);

		if (adjustedAt < 0) {
			this.PLAYER.cueVideoById({
				videoId: id,
			});
			setTimeout(() => {
				this.play();
			}, adjustedAt * -1000);
		} else {
			this.PLAYER.loadVideoById({
				videoId: id,
				startSeconds: adjustedAt
			});
		}
	},
	
    loadPlayer(id, at, volume) {
		this.PLAYER.setVolume(volume * 100);

		if (volume > 0) {
			this.PLAYER.unMute();
		} else {
			this.PLAYER.mute();
		}
		
		this.playVideo(id, at);
	},
	
    onPlayerStateChange(event) {
        var newState = event.data;
        //Possible values are unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5).
        switch (newState) {
            case -1:
                //videoUnstarted();
                break;
            case 0:
                videoEnded();
                break;
            case 1:
                videoPlaying();
                break;
            case 2:
                videoPaused();
                break;
            case 3:
                //videoBuffering();
                break;
            case 5:
                break;
        }
        dbg("Player's new state: " + newState);
	},
	
    pause() {
        this.PLAYER.pauseVideo();
	},
	
    play() {
		this.PLAYER.playVideo();
	},
	
    getVideoState() {
        return this.PLAYER.getPlayerState();
	},
	
    seek(pos) {
        this.PLAYER.seekTo(pos);
	},
	
    getTime(callback) {
        if(callback && this.PLAYER && this.PLAYER.getCurrentTime){
            callback(this.PLAYER.getCurrentTime());
        }
	},
	
	getVolume(callback){
		const volume = !this.PLAYER.isMuted() 
			? this.PLAYER.getVolume() / 100
			: 0;

		if (callback) {
			callback(volume);
		}
	}
};

window.PLAYERS.vimeo = {
	status: {
		state: PLAYER_STATE_BUFFERING,
	},
	
	async setEnabled(isEnabled) {
		if (!isEnabled) {
			if (this.$el) {
				this.$el.css("display", "none");
			}

			if (this.PLAYER) {
				this.PLAYER.pause();
			}

			return;
		}

		if (this.$el) {
			this.$el.css("display", "block");
			return;
		}
	},

    async playVideo(id, at) {
		await this.PLAYER.loadVideo(id);
		const adjustedAt = adjustVideoTime(id, at);
		if (adjustedAt < 0) {
			setTimeout(() => {
				this.play();
			}, adjustedAt * -1000);
		} else {
			await this.PLAYER.setCurrentTime(adjustedAt);
		}
	},
	
	async loadPlayer(id, at, volume) {
		if (this.PLAYER) {
			await this.playVideo(id, at);
			this.PLAYER.setVolume(volume);
			return;
		}
		
		this.$el = $(`<div class="player" />`).appendTo($("#videowrap"));
		const player = this.PLAYER = new Vimeo.Player(this.$el[0], { id, autoplay: false });
		await player.ready();

		player.on("ended", () => { this.status.state = PLAYER_STATE_ENDED; videoEnded(); });
		player.on("play", () => { this.status.state = PLAYER_STATE_PLAYING; videoPlaying(); });
		player.on("pause", () => { this.status.state = PLAYER_STATE_PAUSED; videoPaused(); });
		player.on("bufferstart", () => { this.status.state = PLAYER_STATE_BUFFERING; videoPaused(); });
		player.on("seeked", details => { videoSeeked(details.seconds); });

		this.playVideo(id, at);
		window.setTimeout(() => {
			player.setVolume(volume)
		}, 1000);
	},

	async pause() {
		this.status.state = PLAYER_STATE_PAUSED;
		if (!this.PLAYER) {
			return;
		}
		
		await this.PLAYER.pause();
	},

	async play() {
		this.status.state = PLAYER_STATE_PLAYING;
		if (!this.PLAYER) {
			return;
		}
		
		await this.PLAYER.play();
	},

	async seek(positionInSeconds) {
		if (!this.PLAYER) {
			return;
		}

		await this.PLAYER.setCurrentTime(positionInSeconds);
		if (await this.PLAYER.getPaused()) {
			if (this.status.state !== PLAYER_STATE_PAUSED) {
				this.pause();
			}
		} else {
			if (this.status.state !== PLAYER_STATE_PLAYING) {
				this.play();
			}
		}
	},

	getVideoState() {
		return this.status.state;
	},

	async getTime(callback) {
		if (!callback) {
			return;
		}

		callback(await this.PLAYER.getCurrentTime());
	},

	async getVolume(callback) {
		if (!callback) {
			return;
		}

		callback(await this.PLAYER.getVolume());
	}
};

function osmfEventHandler(playerId, event, data) {
    if (event == "volumechange") {
        PLAYERS.osmf.VOLUME = (data.muted ? 0 : data.volume);
        dbg("Volume change", PLAYERS.osmf.VOLUME);
    }
}

window.PLAYERS.osmf = {
    loadPlayer: function (src, at, volume) {
        if (volume === false){
            volume = 1;
        }
        var player = $("<video>", {
            "style" : "width:100%;height:100%",
            "id" : "vjs_player",
            "data-setup" : '{ "autoplay": true, "controls": true, "bigPlayButton": false, "techorder": ["flash","html5"] }',
            "class" : "video-js vjs-default-skin"
        });

        var source = $("<source>", {
            "src" : src,
            "type" : "rtmp/mp4"
        });

        player.append(source);

        $("#ytapiplayer").append(player);
        videojs("vjs_player").ready(function(){
            this.volume(volume);
            this.on('volumechange',function(){
                VOLUME = this.volume();
            });
        });

    },
    getVolume: function(callback){
        if (callback) callback(videojs('vjs_player').volume());
    }

};

window.PLAYERS.soundcloud = {
	/*playVideo: function (id, at) {

    },*/
    loadPlayer: function (id, at, volume, length) {
		var self = this;
    volume *= 100;

		if (volume === false) {
            volume = 50;
        }

		var placeHolderDiv = $('#ytapiplayer');
		var background = $('<div id="scBackground"/>').appendTo(placeHolderDiv);
		var player = $('<iframe id="scPlayer"/>').appendTo(placeHolderDiv);
        player.attr("allow", "autoplay; encrypted-media");
		var volumeSliderWrap = $('<div id="scVolumeSliderWrap"/>').appendTo(placeHolderDiv);
		var volumeSlider = $('<div id="scVolumeSlider"/>').slider({orientation:'vertical', range:'min', value:volume,
			stop:function(event, ui) {
				self.PLAYER.setVolume(ui.value);
			}}).appendTo(volumeSliderWrap);
    $( "#scVolumeSlider .ui-slider-range" ).css('background', '#C600AD');
		player.attr('src', 'https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/' + id.substr(2) +
			encodeURIComponent('?liking=false&sharing=false&show_comments=false&show_playcount=false&color=C600AD'));

		this.PLAYER = SC.Widget(player[0]);
    this.PLAYER.bind(SC.Widget.Events.READY,()=>{
			this.PLAYER.setVolume(volume);
    });
		// If Soundbutt ever gets its shit together, this should fix our volume woes

		if (at < 0) {
            var wait = (at * -1000);
            setTimeout(function () {
                videoPlay();
                self.PLAYER.bind(SC.Widget.Events.PLAY_PROGRESS, function(obj) {
                    if (obj.loadedProgress > 0) {
                        self.PLAYER.setVolume(volume);
                        self.PLAYER.unbind(SC.Widget.Events.PLAY_PROGRESS);
                    }
                });
            }, wait);
        }
		else {
            videoPlay();
            var initial = new Date();
			this.PLAYER.bind(SC.Widget.Events.PLAY_PROGRESS, function(obj) {
                var target = (at * 1.0) / length;
				if (target < obj.loadedProgress) {
		            self.getVolume(function(vol){
                        self.PLAYER.setVolume(vol);
                    });
                    var now = new Date();
					self.seek(at + ((now - initial) / 1000));
					self.PLAYER.unbind(SC.Widget.Events.PLAY_PROGRESS);
				}
			});
        }
	},
	pause: function () {
        this.PLAYER.pause();
    },
    play: function () {
        this.PLAYER.play();
    },
    seek: function (pos) {
        var self = this;
        this.PLAYER.seekTo(pos * 1000);
        setTimeout(function() {
            self.PLAYER.isPaused(function(paused) {
                if (paused) {
                    self.PLAYER.play();
                }
            });
        }, 1000);
    },
    getVideoState: function () {
        return 1;
    },
    getTime: function (callback) {
		this.PLAYER.getPosition(function(time) { if(callback)callback(time / 1000.0); });
    },
    getVolume: function(callback){
		if(callback)callback($('#scVolumeSlider').slider('value') / 100.0);
    }
};

const fileExtensionRegex = /(mp4|webm)([^/]*)$/;

window.PLAYERS.file = {
    loadPlayer: function (src, at, volume, length, meta) {
        if (volume === false){
            volume = 1;
        }

        var player = $("<video>", {
            "style" : "width:100%;height:100%",
            "id": "vjs_player",
            "data-setup" : '{ "autoplay": true, "controls": true }',
            "class" : "video-js vjs-default-skin"
        });

        const fileExtensionMatch = fileExtensionRegex.exec(src);
        const fileExtension = fileExtensionMatch
            ? fileExtensionMatch[1]
            : "mp4";

		if (meta.manifest) {
			const sourceCount = meta.manifest.sources.length;
			if (sourceCount > 1) {
				const targetSource = pickSourceAtQuality(meta.manifest.sources, getUserQualityPreference());
				for (const source of meta.manifest.sources) {
					let $source = $("<source>", {
						src: source.url,
						type: source.contentType,
						label: source.quality,
					});
	
					if (targetSource == source) {
						// jQuery does dumb things sometimes, we need the selected attribute to be the
						// string literal of true
						$source[0].setAttribute("selected", "true");
					}
					
					player.append($source);
				}
			} else if (sourceCount === 1) {
				const { url, contentType } = meta.manifest.sources[0]
				player.append($("<source>", {
					"src" : url,
					"type" : contentType
				}));
			} else {
				console.error("manifest had no sources?!")
			}
		} else {
			var source = $("<source>", {
				"src" : src,
				"type" : `video/${fileExtension}`
			});
	
			player.append(source);
		}

        $("#ytapiplayer").append(player);
		const videoJsPlayer = videojs("vjs_player");
		
		videoJsPlayer.ready(function(){
			this.volume(volume);
			
            this.on("volumechange",function(){
                VOLUME = this.volume();
			});
			
            this.on("seeked",function(){
                videoSeeked(this.currentTime());
            });

			this.on("qualitySelected", (e, { label }) => {
				setUserQualityPreference(parseInt(label));
			});

			
		});

		videoJsPlayer.controlBar.addChild("QualitySelector");
    },
    pause: function () {
        videojs('vjs_player').pause();
    },
    play: function () {
        videojs('vjs_player').play();
    },
    seek: function (pos) {
        videojs('vjs_player').currentTime(pos);
    },
    getVideoState: function () {
        return 1;
    },
    getTime: function (callback) {
        if(callback) callback(videojs('vjs_player').currentTime());
    },
    getVolume: function(callback){
        if (callback) callback(videojs('vjs_player').volume());
    }
};

window.PLAYERS.dash = {
    loadPlayer: function (src, at, volume) {
        if (volume === false){
            volume = 1;
        }
        var player = $("<video>", {
            "style" : "width:100%;height:100%",
            "id" : "vjs_player",
            "data-setup" : '{ "autoplay": true, "controls": true }',
            "class" : "video-js vjs-default-skin"
        });

        const parts = src.split('.');
        var source = $("<source>", {
            "src" : src,
            "type" : 'application/dash+xml'
        });

        player.append(source);

        $("#ytapiplayer").append(player);
        videojs("vjs_player").ready(function(){
            this.volume(volume);
            this.on('volumechange',function(){
                VOLUME = this.volume();
            });
            this.on('seeked',function(){
                videoSeeked(this.currentTime());
            });
        });
    },
    pause: function () {
        videojs('vjs_player').pause();
    },
    play: function () {
        videojs('vjs_player').play();
    },
    seek: function (pos) {
        videojs('vjs_player').currentTime(pos);
    },
    getVideoState: function () {
        return 1;
    },
    getTime: function (callback) {
        if(callback) callback(videojs('vjs_player').currentTime());
    },
    getVolume: function(callback){
        if (callback) callback(videojs('vjs_player').volume());
    }
};

window.PLAYERS.hls = {
    loadPlayer: function (src, at, volume) {
        if (volume === false){
            volume = 1;
        }
        var player = $("<video>", {
            "style" : "width:100%;height:100%",
            "id" : "vjs_player",
            "data-setup" : '{ "autoplay": true, "controls": true }',
            "class" : "video-js vjs-default-skin"
        });

        const parts = src.split('.');
        var source = $("<source>", {
            "src" : src,
            "type" : "application/x-mpegURL"
        });

        player.append(source);

        $("#ytapiplayer").append(player);
        videojs("vjs_player").ready(function(){
            this.volume(volume);
            this.on('volumechange',function(){
                VOLUME = this.volume();
            });
        });
    },
    getVolume: function(callback){
        if (callback) callback(videojs('vjs_player').volume());
    }
};

var twitchplayer = null;
window.PLAYERS.twitch = {
    loadPlayer: function (src, at, volume) {
        if (volume === false){
            volume = 1;
        }

        const opts = {
            width: videoWidth,
            height: videoHeight
        };

        const parts = src.split('/');
        if (parts[0] === 'videos') {
            opts.video = parts[1];
        } else {
            opts.channel = parts[0];
        }

        twitchplayer = new Twitch.Player("ytapiplayer", opts);
        twitchplayer.addEventListener(Twitch.Player.READY, function(){
            if (twitchplayer) {
                twitchplayer.setVolume(volume);
                twitchplayer.seek(to || 0);
            }
        });
        twitchplayer.addEventListener(Twitch.Player.PLAYING, function(){
            if (twitchplayer) {
                videoSeeked(twitchplayer.getCurrentTime());
            }
        });
    },/*
    playVideo: function (id, at) {
        if (twitchplayer) {
            const parts = id.split('/');
            if (parts[0] === 'videos') {
                twitchplayer.setVideo(parts[1], at);
            } else {
                twitchplayer.setChannel(parts[0]);
            }
        }
    },*/
    pause: function () {
        if (twitchplayer) twitchplayer.pause();
    },
    play: function () {
        if (twitchplayer) twitchplayer.play();
    },
    seek: function (pos) {
        if (twitchplayer) twitchplayer.seek(pos);
    },
    getTime: function (callback) {
        if(callback && twitchplayer) callback(twitchplayer.getCurrentTime());
    },
    getVolume: function(callback){
        if (callback && twitchplayer) callback(twitchplayer.getVolume());
    }
};

window.PLAYERS.twitchclip = {
    loadPlayer: function (src, at, volume) {
        if (volume === false){
            volume = 1;
        }

        $('<iframe>', {
            id: 'twitchclipplayer',
            src: 'https://clips.twitch.tv/embed?clip=' + src,
            width: videoWidth,
            height: videoHeight,
            frameborder: '0',
            scrolling: 'no',
            preload: 'auto',
            allowfullscreen: 'true',
            autoplay: 'true',
            muted: volume === 0,
            css: {
                width: '100%',
                height: '100%'
            }
        }).appendTo('#ytapiplayer');
    }
};
