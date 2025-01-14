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

		$("<div/>").addClass('title').text(tryDecodeURIComponent(vid.videotitle)).appendTo(entry);

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
