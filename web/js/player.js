//test
function removeCurrentPlayer() {
	if ( videojs.getPlayers()['vjs_player'] )
        videojs('vjs_player').dispose();
    //clean up after youtube and vimeo
    if (PLAYER && PLAYER.PLAYER && PLAYER.PLAYER.destroy) {
      PLAYER.PLAYER.destroy();
    }
    var currentEmbed = $("#ytapiplayer");
    var placeholder = $("<div/>").css({width:'100%', height:'100%', position:'relative'}).insertBefore(currentEmbed);
    currentEmbed.remove();
    placeholder.attr("id", "ytapiplayer");
    setVal("VIMEOPLAYERLOADED", false);
	setVal("DMPLAYERREADY", false);
}

window.PLAYERS.dm = {};

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
            self.PLAYER = new YT.Player('ytapiplayer', {
                height: videoHeight,
                width: videoWidth,
                videoId: id,
                playerVars: params,
                events: {
                    'onReady': function () {
                        if (volume !== false) {
                            self.PLAYER.setVolume(volume*100);
                            self.PLAYER.unMute();
                        }
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
        var volume = this.PLAYER.getVolume() / 100;
        if(this.PLAYER.isMuted()){
            volume = 0;
        }
		if(callback)callback(volume);
	}
};

window.PLAYERS.vimeo = {
  status: {
    time: 0,
    volume: VOLUME,//idk if anything even sets this anymore. seems to mostly be false
    state: 3,
    ready: false
  },
  loadPlayer: function(id, at, volume) {
    this.preloadTime = Date.now();
    if (volume === false) {
      volume = VOLUME;
    }
    var currentEmbed = $("#ytapiplayer");
    var frame = $("<iframe src='https://player.vimeo.com/video/"+id+"' style='width:100%;height:100%' frameborder='0' allow='autoplay; encrypted-media; fullscreen' allowfullscreen />").appendTo(currentEmbed);
    this.PLAYER = new Vimeo.Player(frame[0],{
      id:id,
      autoplay:false
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
          VOLUME = o.volume;
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
    loadPlayer: function (src, to, volume) {
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
            })
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

window.PLAYERS.file = {
    loadPlayer: function (src, to, volume) {
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
            "type" : "video/" + parts[parts.length - 1]
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

window.PLAYERS.dash = {
    loadPlayer: function (src, to, volume) {
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
    loadPlayer: function (src, to, volume) {
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
    loadPlayer: function (src, to, volume) {
        if (volume === false){
            volume = 1;
        }

        $('<div>', {
            id: 'twitchplayer'
        }).appendTo('#ytapiplayer');

        const opts = {
            width: $('#ytapiplayer').width(),
            height: $('#ytapiplayer').height()
        };

        const parts = src.split('/');
        if (parts[0] === 'videos') {
            opts.video = parts[1];
        } else {
            opts.channel = parts[0];
        }

        twitchplayer = new Twitch.Player("twitchplayer", opts);
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
    loadPlayer: function (src, to, volume) {
        if (volume === false){
            volume = 1;
        }

        $('<iframe>', {
            id: 'twitchclipplayer',
            src: 'https://clips.twitch.tv/embed?clip=' + src,
            width: $('#ytapiplayer').width(),
            height: $('#ytapiplayer').height(),
            frameborder: '0',
            scrolling: 'no',
            preload: 'auto',
            allowfullscreen: 'true',
            autoplay: 'true',
            muted: volume === 0
        }).appendTo('#ytapiplayer');
    }
};
