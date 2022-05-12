//test
function removeCurrentPlayer() {
	if ( videojs.getPlayers()['vjs_player'] )
        videojs('vjs_player').dispose();
    //clean up after youtube and vimeo
    if (PLAYER && PLAYER.PLAYER && PLAYER.PLAYER.destroy) {
      PLAYER.PLAYER.destroy("ytapiplayer");
    }
    var currentEmbed = $("#ytapiplayer");
    var placeholder = $("<div/>").css({width:'100%', height:'100%', position:'relative'}).insertBefore(currentEmbed);
    currentEmbed.remove();
    placeholder.attr("id", "ytapiplayer");
    setVal("VIMEOPLAYERLOADED", false);
	setVal("DMPLAYERREADY", false);
}

window.PLAYERS.dm = {
    playVideo: function(id, at) {
        this.PLAYER.load(id, {
            autoplay: !(at < 0),
            start: Math.max(at, 0)
        });
        if (at < 0) {
            setTimeout(() => {
                this.play();
            }, at * -1000);
        }
    },
    loadPlayer: function(id, at, volume) {
        const preloadTime = Date.now();

        this.PLAYER = window.DM.player('ytapiplayer', {
            video: id,
            width: '100%',
            height: '100%',
            params: {
                autoplay: !(at < 0),
                start: Math.max(at, 0),
                'queue-autoplay-next': false,
                'queue-enable': false,
                'sharing-enable': false,
                'ui-highlight': 'c600ad',
                'ui-logo': false,
                'ui-start-screen-info': false
            }
        });

		this.PLAYER.addEventListener('apiready', function() {
			//attempting to set volume in apiready or playback_ready
			//somehow is often ignored for some odd reason, 
			//it does however work on video_start \\bpshrug

			//if you manually set the volume using the slider
			//instead of 1, it'll grab that set value
			
			//note: video_start fires when the player fades to black, before any sound is heard
			this.addEventListener('video_start', function() {
				this.setVolume(volume);
				this.addEventListener('volumechange', function() {
					window.volume.set(this.volume);
				});
			});
			
			this.addEventListener('playback_ready', onceFunction(function() {
				// adjust in case loading the player took a while
				at += (Date.now() - preloadTime) / 1000;
	
				if (at < 0) {
					setTimeout(() => {
						this.play();
					}, at * -1000);
				}
			}));
		});
    },
    pause: function() {
        if (this.PLAYER) {
            this.PLAYER.pause();
        }
    },
    play: function(){
        if (this.PLAYER) {
            this.PLAYER.play();
        }
    },
    seek: function(pos) {
        if (this.PLAYER) {
            this.PLAYER.seek(pos);
        }
    },
    getVideoState: function () {
        return 1;
    },
    getTime: function(callback) {
        if (callback && this.PLAYER && this.PLAYER.currentTime) {
            callback(this.PLAYER.currentTime);
        }
    },
    getVolume: function(callback) {
        if (callback && this.PLAYER && this.PLAYER.currentTime) {
            callback(this.PLAYER.volume);
        }
    }
};

window.PLAYERS.yt = {
    playVideo: function (id, at) {
        var self = this;
        waitForFlag("YTAPREADY", function () {
            self.PLAYER.loadVideoById(id);
            if (at < 0) {
                videoPlay();
                videoPause();
                var wait = (at * -1000);
                setTimeout(function () {
                    videoPlay();
                }, wait);
            } else {
                videoSeekTo(at);
                videoPlay();
            }
        });
    },
    loadPlayer: function (id, at, volume) {
        var self = this;
        waitForFlag("YTAPREADY", function () {
            var params = {
                disablekb: 1,
                enablejsapi: 1,
                iv_load_policy: 3,
                modestbranding: 1,
                playsinline: 1,
                rel: 0
            };
            if (getStorage("legacyPlayer") == 0) {
                params.wmode = "transparent";
            }
            if (parseInt(getStorage("disableYoutube")) == 1) {
                return;
            }
            self.PLAYER = new YT.Player('ytapiplayer', {
                height: videoHeight,
                width: videoWidth,
                videoId: id,
                playerVars: params,
                events: {
                    'onReady': function () {
                        self.PLAYER.setVolume(volume);

                        if (at < 0) {
                            videoPlay();
                            videoPause();
                            var wait = (at * -1000);
                            setTimeout(function () {
                                videoPlay();
                            }, wait);
                        } else {
                            videoSeekTo(at);
                            videoPlay();
                        }
                    },
                    'onStateChange': self.onPlayerStateChange
                }
            });
        });
    },
    onPlayerStateChange: function (event) {
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
    pause: function () {
        this.PLAYER.pauseVideo();
    },
    play: function () {
        //if (this.getVideoState() != 3)
            this.PLAYER.playVideo();
    },
    getVideoState: function () {
        return this.PLAYER.getPlayerState();
    },
    seek: function (pos) {
        this.PLAYER.seekTo(pos);
    },
    getTime: function (callback) {
        if(callback && this.PLAYER && this.PLAYER.getCurrentTime){
            callback(this.PLAYER.getCurrentTime());
        }
    },
	getVolume: function(callback){
        let volume = window.volume.get('yt');

        //only grab volumes if youtube's api is ready, 
        //otherwise default to current volume
        if (this.PLAYER && this.PLAYER.getVolume) {
            volume = this.PLAYER.getVolume();
        }

        if (this.PLAYER && this.PLAYER.isMuted) {
    		volume = this.PLAYER.isMuted() ? 0 : volume;
        }

		if(callback)callback(volume);
	}
};

window.PLAYERS.vimeo = {
  status: {
    time: 0,
    state: 3,
    ready: false
  },
  loadPlayer: function(id, at, volume) {
    this.preloadTime = Date.now();
    var currentEmbed = $("#ytapiplayer");
    var frame = $("<iframe src='https://player.vimeo.com/video/"+id+"' style='width:100%;height:100%' frameborder='0' allow='autoplay; encrypted-media; fullscreen' allowfullscreen />").appendTo(currentEmbed);
    this.PLAYER = new Vimeo.Player(frame[0],{
      id:id,
      autoplay:true
    });
    //YoU dO nOt nEeD to WaIt FoR ReAdy tO trigger to begin adding event listeners or calling other methods.LIES
    //no really, it fails to find setvolume sometimes
    this.PLAYER.ready().then(()=>{
      this.PLAYER.setVolume(volume);
      this.status.ready = true;
      this.status.oldVolume = volume;
      //Idk how much the state is used much anymore, but whatever, covering the bases
      //also using these for post-seek changes, to know what our state_should_ be,
      //since seeking autostarts
      var eventFunctions = {
        'ended': ()=>{
          this.status.state = 0;
          videoEnded();
        },
        'play': ()=>{
          this.status.state = 1;
          videoPlaying();
        },
        'volumechange': (o)=>{
          window.volume.set(o.volume);
        },
        'pause': ()=>{
          this.status.state = 2;
          videoPaused();
        },
        'bufferstart': ()=>{
          this.status.state = 3;
        },
        'seeked': (seekDetails)=>{
          videoSeeked(seekDetails.seconds);
        }
      };
      for (var p in eventFunctions) {
        this.PLAYER.on(p, eventFunctions[p]);
      }
      //adjust the time for player getting ready
      //doing this here once because maybe the player is already present when playVideo gets called
      at += (Date.now() - this.preloadTime)/1000;
      this.playVideo(id, at);
    });
  },
  playVideo: function(id, at) {
    this.preloadTime = Date.now();
    //let's see if it'll just continue if given the same id..
    //not sure if there might be a race for the player's initiallization, or the video load, we'll see I guess
    this.status.ready = false;
    this.PLAYER.loadVideo(id).then(()=>{
      //this didn't seem to work earlier in the process, stayed blue
      //complains about not enough contrast, looks fine to me.
      this.PLAYER.setColor('C600AD').catch(()=>{});
      this.status.ready = true;
      //Loading takes a bit of time, adjust for this
      //may want to use an eventlistener like bufferfinish or whatever
      at += (Date.now() - this.preloadTime)/1000;
      if (at < 0) {
        videoPause();
        var wait = (at * -1000);
        setTimeout(()=>{
          videoPlay();
        }, wait);
      } else {
        videoSeekTo(at);
        //current vimeo API starts playback as soon as seek happens
        //Fine for us for now, but seems presumptuous
      }
    });

  },
  pause: function() {
    this.status.state = 2;
    if (this.status.ready) {
      this.PLAYER.pause();
    }
  },
  play: function() {
    this.status.state = 1;
    if (this.status.ready) {
      this.PLAYER.play().catch((err)=>{
        console.log("could not start playback", err);
      });
    }
  },
  seek: function(pos) {
    if (this.status.ready) {
      //may want to adjust this for load time too,
      this.PLAYER.setCurrentTime(pos).then(()=>{
      }).catch((err)=>{
        console.log("could not seek",err);
        //if there's a seek error, it'll try and start at the beginning, stop that
        videoPause();
      });
      //restore playback state since vimeo autoplays on seek...or tries
      this.PLAYER.getPaused().then((paused)=>{
        if (!paused && this.status.state == 2) {
          videoPause();
        } else if (paused && this.status.state != 2) {
          videoPlay();
        }
      });
    }
  },
  getVideoState: function() {
    return this.status.state;
  },
  getTime: function(callback) {
    if (callback) {
      if (!this.status.ready) {
        callback(0);
      } else {
        this.PLAYER.getCurrentTime()
        .then((time)=>{
          callback(time);
        }).catch((err)=>{
          console.log("Vimeo getTime error",err);
        });
      }
    }
  },
  getVolume: function(callback) {
    if (callback) {
      this.PLAYER.getVolume()
      .then(callback)
      .catch((err)=>{
        console.log("Vimeo getVolume error",err);
      });
    }
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
                window.volume.set(this.volume());
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
		var placeHolderDiv = $('#ytapiplayer');
		var background = $('<div id="scBackground"/>').appendTo(placeHolderDiv);
		var player = $('<iframe id="scPlayer"/>').appendTo(placeHolderDiv);
        player.attr("allow", "autoplay; encrypted-media");
		var volumeSliderWrap = $('<div id="scVolumeSliderWrap"/>').appendTo(placeHolderDiv);
		var volumeSlider = $('<div id="scVolumeSlider"/>').slider({
			orientation:'vertical',
			range:'min',
			value: volume,
			min: 0,
			max: 100,
			stop:function(_, ui) {
				self.PLAYER.setVolume(ui.value);
				window.volume.set(ui.value);
			}
		}).appendTo(volumeSliderWrap);

		$( "#scVolumeSlider .ui-slider-range" ).css('background', '#C600AD');
		player.attr('src', 'https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/' + id.substr(2) +
			encodeURIComponent('?liking=false&sharing=false&show_comments=false&show_playcount=false&color=C600AD'));

		this.PLAYER = SC.Widget(player[0]);
		this.PLAYER.bind(SC.Widget.Events.READY,()=>{
			this.PLAYER.setVolume(volume);
		});

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
		if(callback)callback($('#scVolumeSlider').slider('value'));
    }
};

const fileExtensionRegex = /(mp4|m4v|webm)([^/]*)$/;

window.PLAYERS.file = {
    loadPlayer: function (src, at, volume, length, meta) {
        var player = $("<video>", {
            "style" : "width:100%;height:100%",
            "id": "vjs_player",
            "data-setup" : '{ "autoplay": true, "controls": true }',
            "class" : "video-js vjs-default-skin"
        });

        const fileExtensionMatch = fileExtensionRegex.exec(src);
        let fileExtension = fileExtensionMatch
            ? fileExtensionMatch[1]
            : "mp4";

        // m4v is just mp4 with additional Apple bullshit
        if (fileExtension === 'm4v') {
            fileExtension = 'mp4';
        }

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
                window.volume.set(this.volume());
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
                window.volume.set(this.volume());
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
                window.volume.set(this.volume());
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
        const opts = {
            width: videoWidth,
            height: videoHeight,
            parent: [document.location.hostname],
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
                twitchplayer.seek(0);
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
		const parameters = [
			`clip=${src}`,
			`parent=${document.location.hostname}`,
			
			//autoplay and muted are querystring parameters
			`autoplay=true`,
			`muted=${volume === 0}`
		];

        $('<iframe>', {
            id: 'twitchclipplayer',
            src: `https://clips.twitch.tv/embed?${parameters.join('&')}`,
            width: videoWidth,
            height: videoHeight,
            frameborder: '0',
            scrolling: 'no',
            preload: 'auto',
            allowfullscreen: 'true',
            css: {
                width: '100%',
                height: '100%'
            }
        }).appendTo('#ytapiplayer');
    }
};

window.PLAYERS.cloudflare = {
    loadPlayer: function (src, at, volume) {
		const url = new URL(src, 'https://iframe.cloudflarestream.com');
        url.searchParams.set('autoplay', 'true');
        url.searchParams.set('preload', 'auto');
        if (volume === 0) {
            url.searchParams.set('muted', 'true');
        }

        $('<iframe>', {
            id: 'cloudflareplayer',
            src: url,
            width: videoWidth,
            height: videoHeight,
            frameborder: '0',
            scrolling: 'no',
            preload: 'auto',
            allow: 'autoplay; encrypted-media',
            allowfullscreen: 'true',
            css: {
                width: '100%',
                height: '100%'
            }
        }).appendTo('#ytapiplayer');
    }
};
