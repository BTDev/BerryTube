//test
function removeCurrentPlayer() {
	if ( videojs.getPlayers()['vjs_player'] )
        videojs('vjs_player').dispose();
    var currentEmbed = $("#ytapiplayer");
    var placeholder = $("<div/>").css({width:'100%', height:'100%', position:'relative'}).insertBefore(currentEmbed);
    currentEmbed.remove();
    placeholder.attr("id", "ytapiplayer");
    setVal("VIMEOPLAYERLOADED", false);
	setVal("DMPLAYERREADY", false);
}

window.PLAYERS.drive = {
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

			function getEncodeObject(base,params){
				var htmlparams = [];
				for(i in params){ htmlparams.push(i+"="+params[i]); }
				return (base+htmlparams.join("&"));
			}


			self.PLAYER = (function(id){

				var embed = document.createElement('embed');
				embed.width = "100%";
				embed.height = "100%";
				embed.type = "application/x-shockwave-flash";
				embed.setAttribute("allowscriptaccess",'always');
				embed.setAttribute("wmode",'opaque');

				embed.src = (function(id){

					var params = {
						docid: id,
						ps: 'docs',
						partnerid: 30,
						enablejsapi: 1,
						cc_load_policy: 1,
						auth_timeout: 86400000000
					};

					var str = 'https://www.youtube.com/get_player?';
					return getEncodeObject(str,params);

				})(id);

				return embed;

			})(id);

			window.onYouTubePlayerReady = function () {
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
			}

			$("#ytapiplayer").append(self.PLAYER);

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
        if(callback)callback(this.PLAYER.getCurrentTime());
    },
	getVolume: function(callback){
		var volume=null;
		if(this.PLAYER.getVolume){
			var volume = this.PLAYER.getVolume() / 100;
			if(this.PLAYER.isMuted()){
				volume = 0;
			}
		}
		if(callback)callback(volume);
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
                //fs:1,
                modestbranding: 1,
                iv_load_policy: 3,
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
        if(callback && this.PLAYER && this.PLAYER.getCurrentTime)callback(this.PLAYER.getCurrentTime());
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
    loadPlayer: function (id, at, volume) {
        var self = this;

        this.videoId = id;

        this.loadSources(id, function (error, sources) {
            if (error) {
                console.log("Shit's fucked");
                console.error(error);
                return;
            }

            var player = $("<video/>")
                    .addClass("video-js vjs-default-skin")
                    .css({ width: "100%", height: "100%" })
                    .attr({ id: "vjs_player" })
                    .appendTo($("#ytapiplayer"));

            sources.forEach(function (source) {
                $("<source/>")
                        .attr({
                            src: source.link,
                            type: source.contentType
                        })
                        .appendTo(player);
            });

            self.player = videojs(player[0], {
                autoplay: true,
                controls: true
            });

            self.player.ready(function onReady() {
                console.log("lel");

                self.player.on("error", function() {
                    console.log("Shit's fucked");
                    console.error(self.player.error());
                });

                self.player.volume(volume);

                self.player.on("ended", function onEnded() {
                    videoEnded();
                });

                self.player.on("play", function onPlay() {
                    videoPlaying();
                });

                self.player.on("pause", function onPause() {
                    videoPaused();
                });
            });
        });
    },
    loadSources: function (id, cb) {
        console.log("Asking proxy server for " + id);
        $.getJSON("http://tirek.cyzon.us:9999/vimeodata?id=" + id)
                .done(function (result) {
                    if (result.error) {
                        cb(new Error(result.error));
                    } else {
                        cb(null, result.sources);
                    }
                }).fail(function () {
                    cb(new Error("Unable to contact Vimeo data proxy"));
                });
    },
    playVideo: function (id, at) {
        this.videoId = id;
        removeCurrentPlayer();
        this.loadPlayer(id, at);
        return;
    },
    pause: function () {
        this.player && this.player.readyState() > 0 && this.player.pause();
    },
    play: function () {
        this.player && this.player.readyState() > 0 && this.player.play();
    },
    getVideoState: function () {
        return 1;
    },
    seek: function (pos) {
        this.player && this.player.readyState() > 0 && this.player.currentTime(pos);
    },
    getTime: function (callback) {
        this.player && this.player.readyState() > 0 && callback(this.player.currentTime());
    },
    getVolume: function(callback) {
        this.player && this.player.readyState() > 0 && callback(this.player.volume());
    }
};

window.PLAYERS.ustream = {
    loadPlayer: function (id) {
        var currentEmbed = $("#ytapiplayer");
        var ustream = $("<iframe/>").appendTo(currentEmbed);
        ustream.attr("width", videoWidth);
        ustream.attr("height", videoHeight);
        ustream.attr("src", "http://www.ustream.tv/embed/" + id + "?v=3&amp;wmode=direct");
        ustream.attr("scrolling", "no");
        ustream.attr("frameborder", "0");
        ustream.attr("allow", "autoplay; encrypted-media");
        ustream.css("border", "0");
    }
};

window.PLAYERS.livest = {
    loadPlayer: function (id) {
        var currentEmbed = $("#ytapiplayer");
        var livestream = $("<iframe/>").appendTo(currentEmbed);
        livestream.attr("width", videoWidth);
        livestream.attr("height", videoHeight);
        livestream.attr("src", "http://cdn.livestream.com/embed/" + id + "?layout=4&amp;height=" + videoHeight + "&amp;width=" + videoWidth + "&amp;autoplay=true");
        livestream.attr("scrolling", "no");
        livestream.attr("frameborder", "0");
        livestream.attr("allow", "autoplay; encrypted-media");
        livestream.css("border", "0");
    }
};

window.PLAYERS.twitch = {
    loadPlayer: function (channel, time, volume) {
        var url = "http://www.justin.tv/widgets/live_embed_player.swf?channel=" + channel;
        var params = {
            allowFullScreen: "true",
            allowScriptAccess: "always",
            allowNetworking: "all",
            movie: "http://www.justin.tv/widgets/live_embed_player.swf",
            flashvars: "hostname=www.justin.tv&channel=" + channel + "&auto_play=true&start_volume=" + (volume !== false ? volume : 1)
        };
        swfobject.embedSWF(url, "ytapiplayer", videoWidth, videoHeight, "8", null, null, params, {});
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
            "data-setup" : '{ "autoplay": true, "controls": true , "bigPlayButton" : false }',
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

		if (volume === false) {
            volume = 1;
        }

		var placeHolderDiv = $('#ytapiplayer');
		var background = $('<div id="scBackground"/>').appendTo(placeHolderDiv);
		var player = $('<iframe id="scPlayer"/>').appendTo(placeHolderDiv);
        player.attr("allow", "autoplay; encrypted-media");
		var volumeSliderWrap = $('<div id="scVolumeSliderWrap"/>').appendTo(placeHolderDiv);
		var volumeSlider = $('<div id="scVolumeSlider"/>').slider({orientation:'vertical', range:'min', value:volume * 100,
			stop:function(event, ui) {
				self.PLAYER.setVolume(ui.value / 100.0);
			}}).appendTo(volumeSliderWrap);
		player.attr('src', 'http://w.soundcloud.com/player/?url=http://api.soundcloud.com/tracks/' + id.substr(2) +
			encodeURIComponent('?liking=false&sharing=false&show_comments=false&show_playcount=false'));

		this.PLAYER = SC.Widget(player[0]);
		// If Soundbutt ever gets its shit together, this should fix our volume woes
		self.getVolume(function(vol){
            self.PLAYER.setVolume(vol);
        });

		if (at < 0) {
            var wait = (at * -1000);
            setTimeout(function () {
                videoPlay();
                self.PLAYER.bind(SC.Widget.Events.PLAY_PROGRESS, function(obj) {
                    if (obj.loadedProgress > 0) {
		                self.getVolume(function(vol){
                            self.PLAYER.setVolume(vol);
                        });
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

window.PLAYERS.dm = {
	loadPlayer: function (id, at, volume) {
		if (volume === false) {
            volume = 1;
        }

		$('#ytapiplayer').append('<div id="dmplayer"/>');
		var url = 'http://www.dailymotion.com/swf/' + id.substr(2) + '&enableApi=1&playerapiid=dmplayer';
		var params = { allowScriptAccess:'always' };
		var attrs = { id:'dmapiplayer' };
		var swf = swfobject.embedSWF(url, 'dmplayer', videoWidth, videoHeight, '9', null, null, params, attrs);
		var self = this;
		waitForFlag('DMPLAYERREADY', function () {
			self.PLAYER = document.getElementById('dmapiplayer');
			self.PLAYER.setVolume(volume * 100);
			if (at < 0) {
				var wait = (at * -1000);
				videoPlay();
				videoPause();
				setTimeout(function () {
					videoPlay();
				}, wait);
			} else {
                videoSeekTo(at);
                videoPlay();
			}
		});
	},
	playVideo: function (id, at) {
		this.PLAYER.cueVideoById(id.substr(2));
		if (at < 0) {
			var wait = (at * -1000);
			videoPlay();
			videoPause();
			setTimeout(function () {
				videoPlay();
			}, wait);
		} else {
			videoSeekTo(at);
			videoPlay();
		}
	},
	pause: function () {
        this.PLAYER.pauseVideo();
    },
    play: function () {
        this.PLAYER.playVideo();
    },
    seek: function (pos) {
        this.PLAYER.seekTo(pos);
    },
    getVideoState: function () {
        return 1;
    },
    getTime: function (callback) {
		if(callback)callback(this.PLAYER.getCurrentTime());
    },
	getVolume: function(callback){
		if(callback)callback(this.PLAYER.getVolume() / 100.0);
    }
};

