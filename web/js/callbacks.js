function vimeo_player_loaded(id) {
	//id is automatically passed
	setVal("VIMEOPLAYERLOADED", true);
}
function onYouTubeIframeAPIReady() {
	setVal("YTAPREADY", true);
}
function onDailymotionPlayerReady() {
	setVal("DMPLAYERREADY", true);
}
function videoEnded() {
	// Playlist progression is controlled by the server now, but if someone has berry, it should still ask for next.
	// TODO: Should we really be doing this? Could this be causing the berry delay bug?
	if (LEADER) {
		//socket.emit("playNext");
	}
}
function videoSeeked(time) {
	// Playlist progression is controlled by the server now.
	if (controlsVideo()) {
		console.log('videoSeek');
		socket.emit("videoSeek", time);
	}
}
function videoPlaying() {
	//PLAYING_VID = getLiteralPlayingVidID();
	if (controlsVideo()) {
		videoGetTime(function (time) {
			SEEK_TO = time;
			if (SEEK_TO != SEEK_FROM) {
				videoSeeked(time);
			}
			SEEK_FROM = 0;
			forceStateChange();
			dbg("PLAYING");
		});
	}
}
function videoPaused() {
	if (controlsVideo()) {
		videoGetTime(function (time) {
			if (SEEK_FROM == 0) SEEK_FROM = time;
			forceStateChange();
			dbg("PAUSED");
		});
	}
}

socket.on("createPlayer", function (data) {
	console.log('createPlayer', data);

	if (!INIT_TIME) {
		INIT_TIME = data.time;
	}

	const isNew = ACTIVE.videoid != data.video.videoid;

	unfuckPlaylist();
	setPlaylistPosition(data);

	// avoid skipping on socket reconnects, by not reloading current video
	if (isNew) {
		videoLoadAtTime(ACTIVE, data.time);
	}
});
socket.on("renewPos", function (data) {
	setPlaylistPosition(data);
});
socket.on("recvNewPlaylist", function (data) {
	PLAYLIST = new LinkedList.Circular();
	for (var i in data) {
		PLAYLIST.append(data[i]);
	}
	newPlaylist($("#plul"));
	socket.emit("renewPos");
});
socket.on("recvPlaylist", function (data) {
	PLAYLIST = new LinkedList.Circular();
	for (var i in data) {
		PLAYLIST.append(data[i]);
	}
	whenExists("#leftpane", function (obj) {
		initPlaylist($(obj));
		setVal("PLREADY", true);
	});
});
socket.on("hbVideoDetail", function (data) {

	//if(videoGetState() == -1 || videoGetState() == 3 ) return;
	if (controlsVideo()) return;
	dbg('hbVideoDetail data');
	dbg(data);
	//Check if video ID is the same as ours.
	if (ACTIVE.videoid != data.video.videoid) {
		// Ask server for a videochange/update.
		dbg("SHIT: " + ACTIVE.videoid + " != " + data.video.videoid);
		socket.emit("refreshMyVideo");
	}
	/*else if(ACTIVE.videoid == data.video.videoid && videoGetState() == 0) // We've already finished.
	{
		// Ho hum.
		dbg("SHIT: ho-hum");
	}*/
	else if (getStorage('syncAtAll') == 1) {
		dbg("SYNCH_AT_ALL");
		videoGetTime(function (time) {
			if (Math.abs(time - data.time) > getStorage('syncAccuracy')) {
				dbg("SHIT: " + (time - data.time) + " > " + getStorage('syncAccuracy'));
				videoSeekTo(data.time);
			}

			if (videoGetState() == 2) {
				dbg("SHIT: " + videoGetState() + " > 2");
				videoSeekTo(data.time);
			}

			if (data.state == 1 && videoGetState() != 1) {
				dbg("SHIT: " + data.state + " == 1 && " + videoGetState() + " != 1");
				videoPlay();
			}

			if (data.state == 2 && videoGetState() != 2) {
				dbg("SHIT: " + data.state + " == 2 && " + videoGetState() + " != 2");
				videoPause();
				videoSeekTo(data.time);
			}

			if (data.state == 3 && videoGetState() != 2) // Intentionally 2
			{
				dbg("SHIT: " + data.state + " == 3 && " + videoGetState() + " != 2");
				videoPause();
				videoSeekTo(data.time);
			}
		});
	}
	dbg("hbVideoDetail Complete");
});
socket.on("sortPlaylist", function (data) {
	unfuckPlaylist();
	waitForNegativeFlag('sorting', function () { sortPlaylist(data); });
});
socket.on("forceVideoChange", function (data) {
	unfuckPlaylist();
	setPlaylistPosition(data);
	videoLoadAtTime(ACTIVE, data.time);
	if (MONITORED_VIDEO != null) {
		ATTENTION.play();
		MONITORED_VIDEO.domobj.removeClass('notify');
		MONITORED_VIDEO = null;
	}
	dbg("got new video ID from server");
	dbg(data);
	dbg("forceVideoChange comeplete");
});
socket.on("dupeAdd", function () {
	revertLoaders();
});
socket.on("badAdd", function () {
	dbg("Bad Add");
	revertLoaders();
});
socket.on("setAreas", function (data) {
	for (var i = 0; i < data.length; i++) {
		(function (i) {
			var name = data[i].name;
			var html = data[i].html;
			var selName = "#dyn_" + name;
			whenExists(selName, function (area) {
				area.html(html);
				$("a:not([rel])", area).attr("rel", "noopener noreferrer");
				$("img:not([alt])", area).attr("alt", "");
			});
		})(i);
	}
});
socket.on("addVideo", function (data) {
	unfuckPlaylist();
	addVideo(data.video, data.queue, data.sanityid);
});
socket.on("addPlaylist", function (data) {
	dbg(data);
	var vs = data.videos;
	for (var i = 0; i < vs.length; i++) {
		if (vs[i] != null) addVideo(vs[i]);
	}
});
socket.on("delVideo", function (data) {
	unfuckPlaylist();
	dbg(data);
	var pos = data.position;
	elem = $("#playlist ul").children().eq(pos).data('plobject');
	// Sanity check
	if (elem.videoid != data.sanityid) {
		// DOOR STUCK
		socket.emit("refreshMyPlaylist");
	}
	else {
		elem.domobj.remove();
		PLAYLIST.remove(elem);
		smartRefreshScrollbar();
		recalcStats();
	}
});
socket.on("setLeader", function (data) {
	if (data && !LEADER) {
		addChatMsg(
			{
				msg: {
					emote: "rcv",
					nick: "server",
					type: 0,
					msg: "You have been given berry",
					multi: 0,
					metadata: { isSquee: true },
				},
				ghost: false,
			},
			"#chatbuffer",
		);
	}

	LEADER = data;
	handleACL();
	if (sortUserList) sortUserList();
});
socket.on("chatMsg", function (data) {
	switch (data.msg.metadata.channel) {
		case 'main':
			addChatMsg(data, '#chatbuffer');
			break;
		case 'admin':
			addChatMsg(data, '#adminbuffer');
			break;
		default:
			dbg('Oh shit unexpected channel, channel=' + data.msg.metadata.channel + ', msg=' + data.msg.msg);
			addChatMsg(data, '#chatbuffer'); // This might change? Backwards compat for now, though.
			break;
	}
});
socket.on("setNick", function (data) {
	setNick(data);
});
socket.on("setType", function (data) {
	TYPE = data;
	handleACL();
});
socket.on("setToken", function (data) {
	onModuleLoaded(() => {
		window.token.set(data);
	});
});
socket.on("newChatList", function (data) {
	initChatList(data);
});
socket.on("userJoin", function (data) {
	dbg('JOIN'); dbg(data);
	addUser(data, true);
});
socket.on("fondleUser", function (data) {
	switch (data.action) {
		case 'setUserNote':
			updateUserNote(data.info.nick, data.info.note);
			break;
	}
});
socket.on("userPart", function (data) {
	dbg('PART'); dbg(data);
	rmUser(data.nick);
});
socket.on("shadowBan", function (data) {
	var o = $(`#chatlist ul li[nick="${data.nick}"]`);
	o.addClass('sbanned');
});
socket.on("unShadowBan", function (data) {
	var o = $(`#chatlist ul li[nick="${data.nick}"]`);
	o.removeClass('sbanned');
});
socket.on("drinkCount", function (data) {
	manageDrinks(data.drinks);
});
socket.on("numConnected", function (data) {
	handleNumCount(data);
});
socket.on(
	"leaderIs",
	data => {
		// Keep trying to set until you do.
		if (data.nick == false) {
			// server is leading.
			$("#chatlist ul li").removeClass("leader");
			return;
		}

		whenExists("#chatlist ul li", function (obj) {
			$(obj).removeClass("leader");
			$(obj).each(function (key, val) {
				if (data.nicks.includes($(val).data("nick"))) {
					$(val).addClass("leader");
				}
			});
		});

		if (sortUserList) {
			sortUserList();
		}
	}
);
socket.on("setVidVolatile", function (data) {
	pos = data.pos;
	isVolat = data.volat;
	setVidVolatile(pos, isVolat);
});
socket.on("setVidColorTag", function (data) {
	var pos = data.pos;
	var tag = data.tag;
	var volat = data.volat;
	setVidColorTag(pos, tag, volat);
});
socket.on("kicked", function (reason) {
	var msg = "You have been kicked";
	if (reason) {
		msg += ": " + reason;
	}
	$('<div/>').addClass("kicked").text(msg).appendTo($('.chatbuffer'));
});
socket.on('serverRestart', function () {
	onSocketReconnecting('serverRestart');
});
/* Poll Stuff */
socket.on("newPoll", function (data) {
	newPoll(data);
});
socket.on("updatePoll", function (data) {
	updatePoll(data);
});
socket.on("setToggleable", function (data) {
	tn = data.name;
	ts = data.state;
	setToggleable(tn, ts);
});
socket.on("setToggleables", function (data) {
	dbg(data);
	for (var i in data) {
		tn = i;
		ts = data[i].state;
		tl = data[i].label;
		setToggleable(tn, ts, tl);
	}
});
socket.on("clearPoll", function (data) {
	updatePoll(data);
	closePoll(data);
});
socket.on("recvFilters", function (data) {
	FILTERS = data;
});
socket.on("recvBanlist", function (data) {
	BANLIST = data;
});
socket.on("recvPartyRoomList", function (data) {
	PARTYROOMLIST = data;
});
socket.on("recvPlugins", function (data) {
	for (var i = 0; i < data.length; i++) {
		//console.log("plugins",data[i]);
		var obj = {};
		for (var j in data[i]) {
			if (data[i][j].match(/^function/)) {
				obj[j] = eval("temp = " + data[i][j]);
			} else {
				obj[j] = data[i][j];
			}
		}
		PLUGINS.push(obj);
	}
	for (var i = 0; i < PLUGINS.length; i++) {
		if (PLUGINS[i].onLoad) PLUGINS[i].onLoad();
	}
});
//socket.emit("setOverrideCss","http://74.67.181.100/test.css")
socket.on("overrideCss", function (data) {
	setStorage("themeOverride", data);
	setColorTheme(data);
});
socket.on("loginError", function (data) {
	loginError(data);
});
socket.on("debug", function (data) {
	dbg(data);
});

socket.on('reconnecting', () => { onSocketReconnecting('reconnecting'); });
function onSocketReconnecting(from) {
	// The socket disconnected and is trying to reconnect; display a message indicating it
	if ($('.chatbuffer .reconnecting').length == 0) {
		let msg = 'Connection lost. Attempting to reconnect...';
		if (from === 'serverRestart') {
			msg = 'Server is restarting... Reconnecting soon!';
		}

		$('.chatbuffer').append($('<div/>').addClass('reconnecting').text(msg));
		$('#chatinput input').prop('disabled', true);
		scrollBuffersToBottom();
	}

	// Also set this flag so that we don't get the ghost messages when we reconnect
	IGNORE_GHOST_MESSAGES = true;
}

socket.on('reconnect', function () {
	// Reconnection was successful; if there's login data set, log the user back in
	$('.chatbuffer .reconnecting').remove();
	$('#chatinput input').prop('disabled', false);
	scrollBuffersToBottom();

	var data = $('#headbar').data('loginData');
	if (data != undefined) {
		data.ghostBust = true;
		socket.emit('setNick', data);
	}
});
function cleanupSessionNick(s) {
	return s.replace(/session\((\d+), ([^,]+), ([^)]+)\)/, '$2');
}
socket.on('adminLog', function (data) {
	if (data.timestamp) {
		data.timestamp = new Date(data.timestamp);
	}
	if (data.nick) {
		data.nick = cleanupSessionNick(data.nick);
	}
	if (data.msg) {
		data.msg = cleanupSessionNick(data.msg);
	}
	if (data.logEvent && data.logEvent.data && data.logEvent.data.mod) {
		data.logEvent.data.mod = cleanupSessionNick(data.logEvent.data.mod);
	}
	if (data.logEvent && data.logEvent.formatted) {
		data.logEvent.formatted = cleanupSessionNick(data.logEvent.formatted);
	}
	ADMIN_LOG.push(data);
	if (ADMIN_LOG.length > 200) {
		ADMIN_LOG.shift();
	}
	addLogMsg(data, $('#logBuffer'));
});
socket.on('searchHistoryResults', function (data) {
	var plul = $('#playlist ul');
	for (var i in data) {
		var vid = data[i];
		var entry = $("<li/>").addClass('history').appendTo(plul);
		entry.data('plobject', vid);
		vid.domobj = entry;

		$("<div/>").addClass('title').text(decodeURIComponent(vid.videotitle)).appendTo(entry);

		$("<div/>").addClass('delete').text("X").click(function () {
			var video = $(this).parent().data('plobject');
			var type = video.videotype;
			var id = video.videoid;
			socket.emit('delVideoHistory', {
				videotype: type,
				videoid: id
			});

			$(this).parent().remove();
		}).mousedown(function (e) {
			e.stopPropagation();
			e.preventDefault();
		}).appendTo(entry);

		$("<div/>").addClass('requeue').text("V").click(function () {
			var video = $(this).parent().data('plobject');
			var type = video.videotype;
			var id = video.videoid;
			var videotitle = video.videotitle;
			LAST_QUEUE_ATTEMPT = {
				queue: true,
				videotype: type,
				videoid: id,
				videotitle: videotitle,
				volat: true
			};
			socket.emit('addVideo', LAST_QUEUE_ATTEMPT);

			$(this).parent().remove();
		}).mousedown(function (e) {
			e.stopPropagation();
			e.preventDefault();
		}).appendTo(entry);

		$("<div/>").addClass('requeue').text("Q").click(function () {
			var video = $(this).parent().data('plobject');
			var type = video.videotype;
			var id = video.videoid;
			var videotitle = video.videotitle;
			LAST_QUEUE_ATTEMPT = {
				queue: true,
				videotype: type,
				videoid: id,
				videotitle: videotitle,
				volat: false
			};
			socket.emit('addVideo', LAST_QUEUE_ATTEMPT);

			$(this).parent().remove();
		}).mousedown(function (e) {
			e.stopPropagation();
			e.preventDefault();
		}).appendTo(entry);

		entry.bind("contextmenu", function (e) {
			var me = $(this);
			var cmds = $("body").dialogWindow({
				title: "Video Options",
				uid: "videomenu",
				offset: {
					top: e.pageY,
					left: e.pageX
				},
				toolBox: true
			});
			var optionList = $("<ul/>").addClass("optionList").appendTo(cmds);
			if (me.data("plobject").videotype == "yt") {
				var optBtn = $("<div/>").addClass("button").appendTo($("<li/>").appendTo(optionList));
				$("<span/>").text("Open on YouTube").appendTo(optBtn);
				optBtn.click(function () {
					var vid = me.data("plobject").videoid;
					window.open('https://youtu.be/' + vid, '_blank');
				});
			}
			else if (me.data("plobject").videotype == "vimeo") {
				var optBtn = $("<div/>").addClass("button").appendTo($("<li/>").appendTo(optionList));
				$("<span/>").text("Open on Vimeo").appendTo(optBtn);
				optBtn.click(function () {
					var vid = me.data("plobject").videoid;
					window.open('https://vimeo.com/' + vid, '_blank');
				});
			}
			else if ($(entry).data("plobject").videotype == "soundcloud") {
				var optBtn = $("<div/>").addClass("button").appendTo($("<li/>").appendTo(optionList));
				$("<span/>").text("Open on SoundCloud").appendTo(optBtn);
				optBtn.click(function () {
					var vid = $(entry).data("plobject").meta.permalink;
					if (vid) {
						window.open(vid, '_blank');
					}
				});
			}
			else if ($(entry).data("plobject").videotype == "dm") {
				var optBtn = $("<div/>").addClass("button").appendTo($("<li/>").appendTo(optionList));
				$("<span/>").text("Open on DailyMotion").appendTo(optBtn);
				optBtn.click(function () {
					var vid = me.data("plobject").videoid.substr(2);
					window.open('https://www.dailymotion.com/video/' + vid, '_blank');
				});
			}

			if (optionList.children().length == 0) {
				cmds.window.close();
			}

			return false;
		});

		var seconds = vid.videolength;
		$("<div/>").addClass('time').text(secToTime(seconds)).appendTo(entry);

		$('<div/>').addClass("clear").appendTo(entry);
	}
	smartRefreshScrollbar();
	scrollToPlEntry(0);
	realignPosHelper();
});
socket.on('videoRestriction', function (data) {
	showVideoRestrictionDialog(data);
});
socket.on('doorStuck', function () {
	// DOOR STUCK, DOOR STUCK
	// PLEASE
	// I BEG YOU
	// YOU'RE A... A GENUINE DICK SUCKER
	showDoorStuckDialog();
});
socket.on('forceRefresh', function (data) {
	let delay = 0;
	if (data && data.delay) {
		if (data.delay === true) {
			if (data.delayMin === undefined) {
				data.delayMin = 100;
			}
			if (data.delayMax === undefined) {
				data.delayMax = 5000;
			}
			delay = Math.random() * (data.delayMax - data.delayMin) + data.delayMin;
		} else {
			delay = data.delay;
		}
	}
	setTimeout(function () {
		// disable drunk mode to skip confirmation dialog
		if (window.Bem) {
			Bem.loggingIn = true;
		}
		window.location.reload();
	}, delay);
});
socket.on('shitpost', function (data) {
	console.log('shitpost', data);
	const parts = data.msg.split(' ');
	switch (parts[0].toLowerCase()) {
		case 'roll':
		case 'spin':
		case 'zspin':
			const rollTarget = $(parts[1] || '#ytapiplayer,#chatpane');
			const animation = parts[2] || '-zspin';
			rollTarget.css('animation', '1.5s ' + animation);
			setTimeout(function () {
				rollTarget.css('animation', '');
			}, 1500 + 100);
			break;
		case 'ikea':
			const target = $(`#chatbuffer .msgwrap[data-uuid=${data.randomMessage}] .msg`).filter(':not(.ikea)')[0];
			if (!target) {
				return;
			}

			target.classList.add('ikea');
			if (getComputedStyle(target).display === 'inline') {
				target.classList.add('ikea-inline');
			}

			setTimeout(function() {
				target.classList.remove('ikea');
				target.classList.remove('ikea-inline');
			}, 1000 * (5 + 2 + 3) + 100);
			break;
	}
});
socket.on('debugDump', function (data) {
	DEBUG_DUMPS.push(data);
});
