const { PollService } = require("./modules/polls");
const { AuthService, actions } = require("./modules/auth");
const { sanitize, generateRandomPassword } = require("./modules/security");
const { sanitizeManifest } = require("./modules/playlist");
const { DefaultLog, events, levels, consoleLogger, createStreamLogger } = require("./modules/log");
const { DatabaseService } = require("./modules/database");
const { SessionService, getSocketName, userTypes } = require("./modules/sessions");
const { parseRawFileUrl } = require("./modules/utils");
const { EventServer } = require("./modules/event-server");
const fetchYoutubeVideoInfo = require("youtube-info");

// Include the SERVER.settings
var SERVER = {};
SERVER.settings = require('./bt_data/settings.js');
SERVER.ponts = require('./bt_data/ponts.js');
SERVER.dbcon = require('./bt_data/db_info.js');
SERVER.nick_blacklist = require('./bt_data/nick_blacklist.js');

const eventServer = new EventServer(SERVER.settings.core.nodeport);
const io = require('socket.io').listen(eventServer.native);

// Configure
io.enable('browser client minification');  // send minified client
//io.enable('browser client etag');		   // apply etag caching logic based on SERVER.VERSION number
io.enable('browser client gzip');		   // gzip the file
io.set('log level', 1);					   // reduce logging
io.set('transports', [					   // enable all transports (optional if you want flashsocket)
	'websocket'
	//	, 'flashsocket'
	, 'htmlfile'
	, 'xhr-polling'
	, 'jsonp-polling'
]);


// our composition root
const serviceLocator = {
	log: DefaultLog,
	io,
	isUserBanned,
	banUser,
	setServerState,
	getToggleable,
};

// init all services, circular references in the ctors are not allowed
const databaseService = serviceLocator.db = new DatabaseService(serviceLocator);
const authService = serviceLocator.auth = new AuthService(serviceLocator);
const sessionService = serviceLocator.sessions = new SessionService(serviceLocator);
const pollService = serviceLocator.polls = new PollService(serviceLocator);

// all registered services receive certain events, so group them up
const services = [databaseService, authService, pollService, sessionService];

var https = require('https');
var et = require('elementtree');
var fs = require('fs');
var util = require('util');
var url = require('url');
const getDuration = require('get-video-duration');
const isoDuration = require('iso8601-duration');
const fetch = require('node-fetch');
const bcrypt = require('bcrypt');
const isoCountries = require('i18n-iso-countries');
const { randomUUID } = require("crypto");

process.on("uncaughtException", function (err) {
	console.error(`Uncaught ${err.code}: ${err.message}`);
	console.error(err.stack);

	try {
		const isIgnored = err.code === "ECONNRESET" || err.code === "EPIPE";

		DefaultLog.error(events.EVENT_PROC_UNHANDLED_EXCEPTION,
			"unhandled process exception {code}: {message}. Ignoring: {isIgnored}",
			{ isIgnored, code: err && err.code, message: err && err.message },
			err);

		if (isIgnored) { return; }
	}
	catch (err) { /* the error has already been printed, so just fall out and exit */ }

	process.exit(1);
});

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
	try {
		eval(chunk);
	} catch (e) {
		DefaultLog.error(events.EVENT_REPL, "error invoking repl script: {script}", { script: chunk }, e);
	}
});

services.forEach(s => s.init());
const mysql = databaseService.connection;

// Add new feature to socket.io, for granular broadcasts and such
// This is probably the best solution to sending packets to all people matching x criteria easily.
// Perhaps implement some way to let superusers see secret info, like IP's, shadownban status etc
io.sockets.each = function (callback) {
	var clients = io.sockets.clients();
	for (var i = 0; i < clients.length; i++) {
		(function (i) {
			callback(clients[i]);
		})(i);
	}
};

// VIDEO OBJECT
function Video() { }
Video.prototype = {
	videoid: null,
	videolength: null,
	videotitle: null,
	videotype: null,
	volat: false,
	meta: null,
	deleted: false,
	next: null,
	previous: null
};
Video.prototype.pack = function () {
	return {
		videoid: this.videoid,
		videolength: this.videolength,
		videotitle: this.videotitle,
		videotype: this.videotype,
		volat: this.volat,
		meta: this.meta,
		obscure: this.obscure
	};
};

// CREATE THE LINKED LIST DATATYPE
function LinkedList() { }
LinkedList.prototype = {
	length: 0,
	first: null,
	last: null
};
LinkedList.Circular = function () { };
LinkedList.Circular.prototype = new LinkedList();
LinkedList.Circular.prototype.append = function (node) {
	if (this.first === null) {
		node.prev = node;
		node.next = node;
		this.first = node;
		this.last = node;
	} else {
		node.prev = this.last;
		node.next = this.first;
		this.first.prev = node;
		this.last.next = node;
		this.last = node;
	}
	this.length++;
};
LinkedList.Circular.prototype.insertAfter = function (node, newNode) {
	newNode.prev = node;
	newNode.next = node.next;
	node.next.prev = newNode;
	node.next = newNode;
	if (newNode.prev == this.last) { this.last = newNode; }
	this.length++;
};
LinkedList.Circular.prototype.insertBefore = function (node, newNode) {
	newNode.prev = node.prev;
	newNode.next = node;
	node.prev.next = newNode;
	node.prev = newNode;
	if (newNode.next == this.first) { this.first = newNode; }
	this.length++;
};
LinkedList.Circular.prototype.remove = function (node) {
	if (this.length > 1) {
		node.prev.next = node.next;
		node.next.prev = node.prev;
		if (node == this.first) { this.first = node.next; }
		if (node == this.last) { this.last = node.prev; }
	} else {
		this.first = null;
		this.last = null;
	}
	node.prev = null;
	node.next = null;
	this.length--;
};
LinkedList.Circular.prototype.toArray = function () {
	var elem = this.first;
	var out = [];
	for (var i = 0; i < this.length; i++) {
		out.push(elem.pack());
		elem = elem.next;
	}
	return out;
};

/* VAR INIT */
SERVER.PLAYLIST = new LinkedList.Circular();
SERVER.ACTIVE = null;
SERVER.LIVE_MODE = false;
SERVER.AREAS = [];
SERVER.STATE = 1;
SERVER.LOCKDOWN = false;
SERVER.TIME = 0 - SERVER.settings.vc.head_time; // referring to time
SERVER._TIME = 0; // Previous tick time.
SERVER.OUTBUFFER = {};
SERVER.BANS = [];
SERVER.PARTYROOMS = [];
SERVER.FILTERS = [];
SERVER.DRINKS = 0;
SERVER.FAILED_LOGINS = [];
SERVER.RECENTLY_REGISTERED = [];
SERVER.GILDNAME = "*";

// sets where our log output goes for our default logger...
DefaultLog.addLogger(
	// outputs everything to the console...
	consoleLogger,

	// outputs to the log files...
	createStreamLogger({
		[levels.LEVEL_DEBUG]: fs.createWriteStream(SERVER.settings.core.debug_file_name, { flags: "w" }),
		[levels.LEVEL_INFORMATION]: fs.createWriteStream(SERVER.settings.core.log_file_name, { flags: "w" }),
		[levels.LEVEL_ERROR]: fs.createWriteStream(SERVER.settings.core.error_file_name, { flags: "a" })
	}),

	// forwards all log messages that begin with "EVENT_ADMIN_" to the mod channel...
	async (logEvent) => {
		const { event, formatted, data, createdAt } = logEvent;

		if (!event.startsWith("EVENT_ADMIN_")) { return; }

		const buffer = SERVER.OUTBUFFER["adminLog"] = (SERVER.OUTBUFFER["adminLog"] || []);
		const adminMessage = {
			msg: formatted,
			type: data.type || "site",
			nick: data.mod,
			berry: sessionService.getBerries().some(sess => sess.nick === data.mod),
			timestamp: Math.round(createdAt.getTime() / 1000),
			logEvent
		};

		buffer.push(adminMessage);
		if (buffer.length > SERVER.settings.core.max_saved_buffer) { buffer.shift(); }

		sessionService.forCan(actions.CAN_SEE_ADMIN_LOG, session => session.emit("adminLog", adminMessage));
	});

function initPlaylist(callback) {
	var sql = `select * from ${SERVER.dbcon.video_table} order by position`;
	mysql.query(sql, function (err, result) {
		if (err) {
			DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
			return;
		}

		for (var i in result) {
			var row = result[i];
			var o = new Video();
			o.videoid = row.videoid;
			o.videolength = row.videolength;
			o.videotitle = row.videotitle;
			o.videotype = row.videotype;
			try {
				o.meta = JSON.parse(row.meta);
				if (typeof o.meta != "object") {
					o.meta = {};
				}
			} catch (e) { o.meta = {}; }
			SERVER.PLAYLIST.append(o);
		}

		SERVER.ACTIVE = SERVER.PLAYLIST.first;
		if (callback) { callback(); }
	});
}
function initResumePosition(callback) {
	getMisc({ name: 'server_active_videoid' }, function (old_videoid) {
		var elem = SERVER.PLAYLIST.first;
		for (var i = 0; i < SERVER.PLAYLIST.length; i++) {
			if (elem.videoid == old_videoid) {
				SERVER.ACTIVE = elem;
				getMisc({ name: 'server_time' }, function (old_time) {
					if (+old_time) {
						SERVER.TIME = +old_time + 1;
					}
					if (callback) { callback(); }
				});
				return;
			}
			elem = elem.next;
		}
		if (callback) { callback(); }
	});
}
function upsertMisc(data, callback) {
	var sql = `insert into misc (name,value) VALUES (?,?) ON DUPLICATE KEY UPDATE value = ?`;
	mysql.query(sql, [data.name, data.value, data.value], function (err) {
		if (err) { DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err); }

		if (callback) { callback(); }
	});
}
function getMisc(data, callback) {
	var val = "";
	var sql = `select * from misc where name = ?`;
	mysql.query(sql, [data.name], function (err, result, fields) {
		if (err) {
			DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
			return;
		}
		if (result.length == 1) {
			var row = result[0];
			try {
				val = row.value;
			} catch (e) {
				val = "";
				DefaultLog.error(events.EVENT_GENERAL, `Bad stored misc. Blah. ${data.name}`);
			}
		}
		if (callback) { callback(val); }
	});
}
function initHardbant(callback) {
	getMisc({ name: 'hardbant_ips' }, function (ips) {
		if (ips) {
			SERVER.BANS = JSON.parse(ips) || [];
		}
		if (callback) { callback(); }
	});
}
function initShadowbant(callback) {
	getMisc({ name: "shadowbant_ips" }, function (ips) {
		if (ips) {
			var shadowbant = JSON.parse(ips) || [];
			for (var i = 0; i < shadowbant.length; ++i) {
				var data = shadowbant[i];
				sessionService.setShadowbanForIp(data.ip, true, data.temp);
			}
		}

		if (callback) {
			callback();
		}
	});
}
function initPartyRooms(callback) {
	getMisc({ name: "partyroom_ips" }, function (ips) {
		if (ips) {
			var partyRooms = JSON.parse(ips) || [];
			for (var i = 0; i < partyRooms.length; ++i) {
				var data = partyRooms[i];
				sessionService.setPartyRoomForIp(data.ip, data.duration, data.maxVotes, data.note, data.nicks, data.partyRoomAppliedOn);
			}
		}

		if (callback) {
			callback();
		}
	});
}
function initFilters(callback) {
	getMisc({ name: 'filters' }, function (filters) {
		if (filters) {
			SERVER.FILTERS = [];
			try {
				SERVER.FILTERS = JSON.parse(filters) || [];
			} catch (e) {
				SERVER.FILTERS = [];
			}

		}
		if (callback) { callback(); }
	});
}
function initTimer() {
	SERVER._TIME = new Date().getTime();
	setInterval(function () {
		if (SERVER.ACTIVE == null) {
			return;
		}

		const timestamp = (new Date()).getTime();
		const elapsedMilliseconds = (timestamp - SERVER._TIME);
		const elapsedSeconds = elapsedMilliseconds / 1000;
		SERVER._TIME = timestamp;

		for (const service of services) {
			service.onTick(elapsedMilliseconds);
		}

		if (Math.ceil(SERVER.TIME + 1) >= (SERVER.ACTIVE.videolength + SERVER.settings.vc.tail_time)) {
			playNext();
		} else if (SERVER.STATE != 2) {
			if (isTrackingTime()) {
				SERVER.TIME += elapsedSeconds;
			} else {
				resetTime();
			}
		}
	}, 1000);

	setInterval(function () {
		if (isTrackingTime()) {
			if ( // This should prevent the crazy jumping to end/beginning on video change.
				(SERVER.ACTIVE.videolength - SERVER.TIME > (SERVER.settings.core.heartbeat_interval / 1000)) &&
				(SERVER.TIME > (SERVER.settings.core.heartbeat_interval / 1000))
			) {
				sendStatus("hbVideoDetail", io.sockets);
			}
		}
	}, SERVER.settings.core.heartbeat_interval);
}
function initAreas() {
	var sql = 'select * from areas';
	mysql.query(sql, function (err, result) {
		if (err) {
			DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
			return;
		}
		else {
			for (var i in result) {
				var row = result[i];
				var newArea = {
					name: row.name,
					html: row.html
				};
				SERVER.AREAS.push(newArea);
			}
		}
	});
}
function sendAreas(socket) {
	socket.emit("setAreas", SERVER.AREAS);
}
function removeBlacklistedHTML(content) {
	var blacklist = ['script', 'frame', 'style', 'marquee', 'blink'];
	for (var i in blacklist) {
		var re = RegExp("<(/*[ ]*" + blacklist[i] + "[ ]*)([^>]*)>", 'gi');
		content = content.replace(re, "&lt;$1$2&gt;");
	}
	return content;
}
/* Grumble, the regex above makes my syntax highlighter lose its mind. Putting this here to end the madness. */
function setAreas(areaname, content) {
	// Just for the 8-year olds
	content = removeBlacklistedHTML(content);
	for (var i in SERVER.AREAS) {
		if (SERVER.AREAS[i].name == areaname) {
			SERVER.AREAS[i].html = content;
			sendAreas(io.sockets);
			return;
		}
	}
	var newArea = {
		name: areaname,
		html: content
	};
	SERVER.AREAS.push(newArea);
	sendAreas(io.sockets);
}
function sendStatus(name, target) {
	if (SERVER.ACTIVE != null) {
		target.emit(name, {
			video: SERVER.ACTIVE.pack(),
			time: SERVER.TIME,
			state: SERVER.STATE
		});
		eventServer.emit('videoStatus', {
			time: Math.round(SERVER.TIME),
			state: SERVER.STATE
		});
	}
}
function doorStuck(socket) {
	socket.emit("recvNewPlaylist", SERVER.PLAYLIST.toArray());
	socket.emit('doorStuck');
}
function playNext() {
	const active = {
		position: getVideoPosition(SERVER.ACTIVE),
		node: SERVER.ACTIVE
	};

	SERVER.ACTIVE = SERVER.ACTIVE.next;

	if (!active.node.volat && 'colorTagVolat' in active.node.meta) {
		_setVideoColorTag(active.node, active.position, false, false);
	}

	if (active.node.volat) {
		delVideo(active);
	}

	handleNewVideoChange();
	sendStatus("forceVideoChange", io.sockets);
}
function prepareBans() {
	var i = SERVER.BANS.length;
	while (i--) {

		if (SERVER.BANS[i].duration == -1) { continue; }

		//CHECK DURATION AND TIME, REMOVE BAN IF APPROPRIATE
		// Ban duration is in minutes, so multiply all values by 60 seconds, and 1000 millis, for 60000
		var d = SERVER.BANS[i].duration * 60000;
		var now = new Date().getTime();

		if ((now - SERVER.BANS[i].bannedOn) >= d) {
			//Ban expired.
			SERVER.BANS.splice(i, 1);
		}
	}
}
function augmentBan(ban, o) {

	if (!getToggleable("spaceaids")) { return; }

	// Merge IPs, Nicks, Take earlier time, take longer duration.
	for (ip in o.ips) {
		if (ban.ips.indexOf(o.ips[ip]) < 0) {
			ban.ips.push(o.ips[ip]);
		}
	}
	for (nick in o.nicks) {
		if (ban.nicks.indexOf(o.nicks[nick]) < 0) {
			ban.nicks.push(o.nicks[nick]);
		}
	}

	// Take earlier ban time.
	if (o.bannedOn < ban.bannedOn) { ban.bannedOn = o.bannedOn; }

	// Take all special values direct, otherwise, replace only if longer period.
	if (o.duration <= 0) { ban.duration = o.duration; }
	else if (o.duration > ban.duration) { ban.duration = o.duration; }
}
function isUserBanned(o) {
	var required = ['ips', 'nicks'];
	for (elem in required) { if (!(required[elem] in o)) return; }

	prepareBans();
	for (bannedguy in SERVER.BANS) {

		// Check all IP's
		for (ip in o.ips) {
			if (!SERVER.BANS[bannedguy].ips) { SERVER.BANS[bannedguy].ips = []; }
			if (SERVER.BANS[bannedguy].ips.indexOf(o.ips[ip]) >= 0) {
				augmentBan(SERVER.BANS[bannedguy], o);
				return SERVER.BANS[bannedguy];
			}
		}
		// Check all Nicks
		for (nick in o.nicks) {
			if (!SERVER.BANS[bannedguy].nicks) { SERVER.BANS[bannedguy].nicks = []; }
			if (SERVER.BANS[bannedguy].nicks.indexOf(o.nicks[nick]) >= 0) {
				augmentBan(SERVER.BANS[bannedguy], o);
				return SERVER.BANS[bannedguy];
			}
		}
	}

	return false;
}
function augmentBan(ban, o) {

	if (!getToggleable("spaceaids")) { return; }

	// Merge IPs, Nicks, Take earlier time, take longer duration.
	for (ip in o.ips) {
		if (ban.ips.indexOf(o.ips[ip]) < 0) {
			ban.ips.push(o.ips[ip]);
		}
	}
	for (nick in o.nicks) {
		if (ban.nicks.indexOf(o.nicks[nick]) < 0) {
			ban.nicks.push(o.nicks[nick]);
		}
	}

	// Take earlier ban time.
	if (o.bannedOn < ban.bannedOn) { ban.bannedOn = o.bannedOn; }

	// Take all special values direct, otherwise, replace only if longer period.
	if (o.duration <= 0) { ban.duration = o.duration; }
	else if (o.duration > ban.duration) { ban.duration = o.duration; }
}
function isUserPartyRoom(o) {
	var required = ['ips', 'nicks'];
	for (elem in required) { if (!(required[elem] in o)) return; }

	preparePartyRooms();
	for (partyRoom in SERVER.PARTYROOMS) {

		// Check all IP's
		for (ip in o.ips) {
			if (!SERVER.PARTYROOMS[partyRoom].ips) { SERVER.PARTYROOMS[partyRoom].ips = []; }
			if (SERVER.PARTYROOMS[partyRoom].ips.indexOf(o.ips[ip]) >= 0) {
				return SERVER.PARTYROOMS[partyRoom];
			}
		}
		// Check all Nicks
		for (nick in o.nicks) {
			if (!SERVER.PARTYROOMS[partyRoom].nicks) { SERVER.PARTYROOMS[partyRoom].nicks = []; }
			if (SERVER.PARTYROOMS[partyRoom].nicks.indexOf(o.nicks[nick]) >= 0) {
				return SERVER.PARTYROOMS[partyRoom];
			}
		}
	}

	return false;
}

function preparePartyRooms() {
	var i = SERVER.PARTYROOMS.length;
	while (i--) {

		if (SERVER.PARTYROOMS[i].duration == -1) { continue; }

		//CHECK DURATION AND TIME, REMOVE PARTY ROOM STATUS IF APPROPRIATE
		var d = SERVER.PARTYROOMS[i].duration * 60000;
		var now = new Date().getTime();

		if ((now - SERVER.PARTYROOMS[i].partyRoomAppliedOn) >= d) {
			//Party's over.
			SERVER.PARTYROOMS.splice(i, 1);
		}
	}
}
function sendBanlist(socket) {
	prepareBans();
	socket.emit("recvBanlist", SERVER.BANS);
}
function sendPartyRoomList(socket) {
	preparePartyRooms();
	socket.emit("recvPartyRoomList", SERVER.PARTYROOMS);
}
function isUserShadowBanned(socket) {
	return sessionService.getIpEntry(socket.ip).shadowban.is;
}
function kickIfUnderLevel(socket, reason, level) {
	if (socket.session.type < level) {
		socket.session.kick(reason);
	}
}
function kickForIllegalActivity(socket, reason) {
	DefaultLog.info(events.EVENT_ADMIN_KICKED,
		"{nick} got kicked because {reason} (illegal things)",
		{ nick: getSocketName(socket), type: "user", reason });

	socket.emit("kicked", reason);
	socket.disconnect(); // NOT ALLOWED.
}
function kickUserByNick(socket, nick, reason) {
	sessionService.forNick(nick, session => session.kick(reason, getSocketName(socket)));
}
var commit = function () {
	var elem = SERVER.PLAYLIST.first;
	for (var i = 0; i < SERVER.PLAYLIST.length; i++) {
		var sql = `update ${SERVER.dbcon.video_table} set position = ? where videoid = ?`;
		mysql.query(sql, [i, '' + elem.videoid], function (err) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
				return;
			}
		});
		elem = elem.next;
	}

	for (var i = 0; i < SERVER.AREAS.length; i++) {
		var sql = 'update areas set html = ? where name = ?';
		mysql.query(sql, [SERVER.AREAS[i].html, SERVER.AREAS[i].name], function (err) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
				return;
			}
		});
	}

	upsertMisc({ name: 'filters', value: JSON.stringify(SERVER.FILTERS) });

	const shadowbant = Object.values(sessionService.ipAddresses)
		.reduce((acc, entry) => {
			if (!entry.isShadowbanned) {
				return acc;
			}

			acc.push({
				ip: entry.ip,
				temp: this.isTempShadowban
			});

			return acc;
		}, []);

	upsertMisc({ name: 'shadowbant_ips', value: JSON.stringify(shadowbant) });
	upsertMisc({ name: 'hardbant_ips', value: JSON.stringify(SERVER.BANS) });
	upsertMisc({ name: 'partyroom_ips', value: JSON.stringify(SERVER.PARTYROOMS) });
	upsertMisc({ name: 'server_time', value: '' + Math.ceil(SERVER.TIME) });
	upsertMisc({ name: 'server_active_videoid', value: '' + SERVER.ACTIVE.videoid });
};

const commitInterval = setInterval(commit, SERVER.settings.core.db_commit_delay);

process.on('SIGTERM', function (signal) {
	clearInterval(commitInterval);
	io.sockets.emit('serverRestart');
	commit();
	setTimeout(function () {
		process.exit(128 + signal);
	}, 3000);
});
function setServerState(state) {
	SERVER.STATE = state;
}
function getCommand(msg) {
	var re = new RegExp("^/([a-zA-Z]*)([-0-9.]*)\\s*(.*)", "i");
	var parsed = { msg: msg, command: false, multi: 1 };
	if (ret = msg.match(re)) {
		parsed.command = ret[1].toLowerCase();
		parsed.multi = parseFloat(ret[2] || 1);
		parsed.msg = ret[3];
	}

	return parsed;
}
function handleNewVideoChange() {
	DefaultLog.info(events.EVENT_VIDEO_CHANGE,
		"changed video to {videoTitle}",
		{ videoTitle: decodeURI(SERVER.ACTIVE.videotitle) });


	eventServer.emit('videoChange', {
		id: SERVER.ACTIVE.videoid,
		length: SERVER.ACTIVE.videolength,
		title: decodeURI(SERVER.ACTIVE.videotitle),
		type: SERVER.ACTIVE.videotype,
		volat: SERVER.ACTIVE.volat
	});

	resetDrinks();
	resetTime();
	// Is this a livestream? if so, stop ticking.
	if (SERVER.ACTIVE.videolength == 0) {
		SERVER.LIVE_MODE = true;
	} else {
		SERVER.STATE = 1; // Play.
		SERVER.LIVE_MODE = false;
	}
}
function sendDrinks(socket) {
	socket.emit("drinkCount", {
		drinks: formatDrinkMessage(SERVER.DRINKS)
	});

	eventServer.emit('drinkCount', {
		drinks: SERVER.DRINKS
	});
}
function resetDrinks() {
	SERVER.DRINKS = 0;
	sendDrinks(io.sockets);
}
function resetTime() {
	SERVER.TIME = (0 - SERVER.settings.vc.head_time);
}
function addDrink(amount, socket, callback) {
	SERVER.DRINKS += parseFloat(amount);

	if (isDrinkAmountExcessive(SERVER.DRINKS)) {
		kickForIllegalActivity(socket, "Berry Punch is mad at you");
	}

	if (callback) {
		callback();
	}
}
function randomPoni() {
	return SERVER.ponts[Math.floor(Math.random() * SERVER.ponts.length)];
}
function sendFilters(socket) {
	socket.emit("recvFilters", SERVER.FILTERS);
}
function applyFilters(nick, msg, socket) {
	var actionChain = [];
	const flags = {
		sendToSelf: undefined,
		sendToUsers: undefined,
		sendToAdmins: undefined,
		addToBuffer: undefined,
		serverResponseMessage: undefined
	};

	try {
		for(var i=0;i<SERVER.FILTERS.length;i++){
			var d = SERVER.FILTERS[i];
			// Enabled?
			if (d.enable == false) {
				continue;
			}

			// Sanity Check, kill rule on failure.
			try {
				var nickCheck = new RegExp(d.nickMatch, d.nickParam);
				var chatCheck = new RegExp(d.chatMatch, d.chatParam);
			} catch (e) {
				DefaultLog.error(events.EVENT_ADMIN_APPLY_FILTERS, "could not apply filter {filterId} to chat message", { filterId: i }, e);
				SERVER.FILTERS.splice(i, 1);
				continue;
			}
			
			try{
				if(d.chance != null && Math.random() >= d.chance/100)
					continue;
			}catch{}
				
			if (nick.match(nickCheck)) {
				if (msg.match(chatCheck)) {
					// Perform Action
					actionChain.push({ action: d.actionSelector, meta: d.actionMetadata });
				}
				if (d.chatReplace.trim().length > 0) {
					msg = msg.replace(chatCheck, d.chatReplace);
				}
			}
		}

		for (const action of actionChain) {
			switch (action.action) {
				case "kick":
					kickIfUnderLevel(socket, action.meta, 1);
					break;

				case "hush":
					msg = msg.toLowerCase();
					break;

				case "suppress":
					flags.addToBuffer = false;
					flags.sendToAdmins = true;
					flags.sendToSelf = true;
					flags.sendToUsers = false;
					flags.serverResponseMessage = action.meta;
					break;
			}
		}
	} catch(e) {
		// The filters are fucked, somehow.
		DefaultLog.error(events.EVENT_ADMIN_APPLY_FILTERS, "could not apply filters to chat message", {}, e);
	}

	return { message: msg, flags };
}
function applyPluginFilters(msg, socket) {
	if (getToggleable("bestponi")) {
		//handle best pony.
		var re = new RegExp('^[a-zA-Z ]+is bes([st]) pon([tiye])(.*)', 'i');
		msg = msg.replace(re, randomPoni() + ' is bes$1 pon$2$3');
	}

	if (getToggleable("wobniar")) {
		//handle backwards text.
		var words = msg.split(" ");
		for (var i = 0; i < words.length; i++) {
			words[i] = words[i].split("").reverse().join("");
		}
		msg = words.join(" ");
	}

	return msg;
}
function setVideoVolatile(socket, pos, isVolat) {
	var elem = SERVER.PLAYLIST.first;
	for (var i = 0; i < pos; i++) {
		elem = elem.next;
	}
	elem.volat = isVolat;

	DefaultLog.info(events.EVENT_ADMIN_SET_VOLATILE,
		"{mod} set {title} to {status}",
		{ mod: getSocketName(socket), type: "playlist", title: decodeURIComponent(elem.videotitle), status: isVolat ? "volatile" : "not volatile" });

	io.sockets.emit("setVidVolatile", {
		pos: pos,
		volat: isVolat
	});
}
function setVideoColorTag(pos, tag, volat) {
	var elem = SERVER.PLAYLIST.first;
	for (var i = 0; i < pos; i++) {
		elem = elem.next;
	}
	_setVideoColorTag(elem, pos, tag, volat);
}
function _setVideoColorTag(elem, pos, tag, volat) {

	if (tag == false) {
		delete elem.meta.colorTag;
	} else {
		elem.meta.colorTag = tag;
	}

	if (volat != true) {
		delete elem.meta.colorTagVolat;
	} else {
		elem.meta.colorTagVolat = volat;
	}

	var sql = 'update ' + SERVER.dbcon.video_table + ' set meta = ? where videoid = ?';
	mysql.query(sql, [JSON.stringify(elem.meta), '' + elem.videoid], function (err) {
		if (err) {
			DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
			return;
		}
	});
	io.sockets.emit("setVidColorTag", {
		pos: pos,
		tag: tag,
		volat: volat
	});
}

function banUser(data, mod = undefined) {
	var required = ['ips', 'nicks', 'duration']; // nick and ip should be arrays, even if single-element
	data.bannedOn = new Date().getTime();

	for (const elem in required) {
		if (!(required[elem] in data)) {
			return;
		}
	}

	var existing = isUserBanned(data);

	if (existing) {
		augmentBan(existing, data);
	} else {
		SERVER.BANS.push(data);
	}

	prepareBans();

	if (mod) {
		DefaultLog.info(events.EVENT_ADMIN_BANNED,
			"{mod} {action} {nick} {duration}",
			{ nick: data.nicks.join('/'), action: data.duration === 0 ? 'unbanned' : 'banned', type: "user", mod, duration: data.duration > 0 ? `for ${data.duration} minutes` : 'permanently' });
	}

	for (const nick of data.nicks) {
		sessionService.forNick(nick, s => s.kick("You have been banned."));
	}
}

function applyPartyRoom(data) {
	var required = ['ips', 'nicks', 'duration', 'maxVotes']; // nick and ip should be arrays, even if single-element

	for (const elem in required) {
		if (!(required[elem] in data)) {
			return;
		}
	}

	data.partyRoomAppliedOn = new Date().getTime();

	var existing = isUserPartyRoom(data);
	if (existing) {
		existing.duration = data.duration;
		existing.maxVotes = data.maxVotes;
		if(data.note) existing.note = data.note;
	}
	else {
		SERVER.PARTYROOMS.push(data);
	}
	for (ip in data.ips) {
		sessionService.setPartyRoomForIp(data.ips[ip], data.duration, data.maxVotes, data.note, data.nicks, data.partyRoomAppliedOn);
	}

	preparePartyRooms();

}

/* ================= */
function emitChat(socket, data, ghost) {
	if (socket) {
		socket.emit("chatMsg", { msg: data, ghost: ghost });
	}
}

function sendChat(nick, type, incoming, socket) {
	if (!socket.doSpamblockedAction()) {
		kickIfUnderLevel(socket, "Spamming", 1);
		return;
	}

	_sendChat(nick, type, incoming, socket);
}

const doNormalChatMessage = { doSuppress: false };
const doSuppressChat = { doSuppress: true };

const chatCommandMap = {
	// /me wiggles the tub
	...withAliases(["me"], (_parsed, _socket, messageData) => {
		messageData.emote = "act";
		return doNormalChatMessage;
	}),

	// /sb greetings programs
	...withAliases(["sb"], (_parsed, _socket, messageData) => {
		messageData.emote = "sweetiebot";
		return doNormalChatMessage;
	}),

	// /rcv attention berrytube: BUTTS
	...withAliases(
		["rcv", "shout", "yell", "announcement", "rcv"],
		(parsed, socket, messageData) => {
			if (!authService.can(socket.session, actions.ACTION_ANNOUNCE)) {
				return doSuppressChat;
			}

			messageData.emote = "rcv";
			messageData.msg = parsed.msg; // Specifically not using the fun bits here.
			return doNormalChatMessage;
		},
	),

	// /r rainbow rocks
	...withAliases(
		["r", "request", "requests", "req"],
		(_parsed, _socket, messageData) => {
			messageData.emote = "request";
			return doNormalChatMessage;
		},
	),

	// /sp snape kills dumbledoor
	...withAliases(
		["spoiler", "sp", "spoilers"],
		(_parsed, _socket, messageData) => {
			messageData.emote = "spoiler";
			return doNormalChatMessage;
		},
	),

	// /d AMGIC!
	...withAliases(["drink", "d"], (parsed, socket, messageData) => {
		if (!authService.can(socket.session, actions.ACTION_CALL_DRINKS)) {
			return doSuppressChat;
		}

		messageData.emote = "drink";

		if (messageData.metadata.channel === "main") {
			addDrink(parsed.multi, socket, () => {
				sendDrinks(io.sockets);
			});
		}

		return doNormalChatMessage;
	}),

	// /kick nlaq
	...withAliases(["kick", "k"], (parsed, socket, _messageData) => {
		if (!authService.can(socket.session, actions.ACTION_KICK_USER)) {
			kickForIllegalActivity(socket);
			return doSuppressChat;
		}

		const parts = parsed.msg.split(" ");

		if (parts[0]) {
			kickUserByNick(
				socket,
				parts[0],
				parts.slice(1).join(" ") || undefined,
			);
		}

		return doSuppressChat;
	}),

	// what does this even do
	...withAliases(["shitpost"], (parsed, socket, messageData) => {
		if (!authService.can(socket.session, actions.ACTION_SHITPOST)) {
			kickForIllegalActivity(socket);
			return doSuppressChat;
		}

		const parts = parsed.msg.split(" ");
		if (parts[0]) {
			DefaultLog.info(
				events.EVENT_ADMIN_SHATPOST,
				"{mod} shatpost {title}",
				{ mod: messageData.nick, type: "site", title: parts[0] },
			);

			io.sockets.emit("shitpost", {
				msg: parsed.msg,
				random: Math.random(),
				randomMessage: SERVER.OUTBUFFER.main?.[Math.floor(Math.random() * SERVER.OUTBUFFER.main?.length)]?.metadata?.uuid,
			});
		}

		return doSuppressChat;
	}),

	// /fondlepw nlaq
	...withAliases(["fondlepw", "resetpw", "pwreset", "resetpassword", "passwordreset"], (parsed, socket, _messageData) => {
		if (
			!authService.can(socket.session, actions.ACTION_CAN_RESET_PASSWORD)
		) {
			kickForIllegalActivity(socket);
			return doSuppressChat;
		}

		const nickToReset = parsed.msg.trim();
		if (!nickToReset.length) {
			sendMessage(`please specify a nick: "/fondlepw nick"`);
			return doSuppressChat;
		}

		(async () => {
			const { result } = await databaseService.query`
				SELECT
					name
				FROM
					users
				WHERE
					name = ${nickToReset} AND type < 2`;

			if (!result || result.length !== 1) {
				sendMessage(
					`cannot reset password for "${nickToReset}": user does not exist or is an admin`,
				);
				return;
			}

			const foundNick = result[0].name;
			const randomPassword = generateRandomPassword();
			const randomPasswordHashed = await bcrypt.hash(
				randomPassword,
				SERVER.settings.core.bcrypt_rounds,
			);

			await databaseService.query`
				UPDATE
					users
				SET
					pass = ${randomPasswordHashed}
				WHERE
					name = ${foundNick}`;

			sendMessage(
				`password for "${foundNick}" has been reset to "${randomPassword}"`,
			);

			DefaultLog.info(
				events.EVENT_ADMIN_USER_PASSWORD_RESET,
				"{mod} reset {nick}'s password",
				{ mod: getSocketName(socket), type: "user", nick: foundNick },
			);
		})();

		// ok to return while we process the command above
		return doSuppressChat;

		function sendMessage(message) {
			emitChat(
				socket,
				{
					nick: "server",
					emote: "server",
					metadata: { channel: "main" },
					msg: message,
					timestamp: new Date().toUTCString(),
				},
				false,
			);
		}
	}),
};

function _sendChat(nick, type, incoming, socket) {
	const messageText = sanitize(incoming.msg);
	const metadata = incoming.metadata;
	const { channel = "main" } = metadata;
	const timestamp = new Date().toUTCString();
	const isSocketBanned = isUserShadowBanned(socket);
	
	const flags = {
		addToBuffer: true,
		sendToAdmins: false,
		sendToUsers: true,
		sendToSelf: false,
		serverResponseMessage: undefined
	};

	if (channel !== "main") {
		// Someone trying to send a message to a channel they're not in?!
		// Also, let server send messages to admin chat.
		if (
			type < userTypes.ADMINISTRATOR &&
			io.sockets.manager.roomClients[socket.id]["/" + channel] !== true
		) {
			return;
		}

		flags.sendToAdmins = true;
		flags.sendToUsers = false;
	}

	if (isSocketBanned) {
		flags.sendToAdmins = true;
		flags.addToBuffer = flags.sendToUsers = false;
		flags.sendToSelf = true;
	}

	if (getToggleable("mutegray") && type <= userTypes.ANONYMOUS) {
		emitChat(
			socket,
			{
				nick: "server",
				emote: "server",
				metadata: metadata,
				msg:
					"Unregistered users are not currently allowed to chat. Sorry!",
				timestamp: timestamp,
			},
			false,
		);

		metadata.graymute = true;
		flags.sendToAdmins = true;
		flags.addToBuffer = flags.sendToUsers = false;
		flags.sendToSelf = false;
	}

	const filterResult = applyFilters(nick, messageText, socket);
	for (const [key, value] of Object.entries(filterResult.flags)) {
		if (typeof(value) === "undefined") {
			continue;
		}

		flags[key] = value;
	}
	
	const parsed = getCommand(filterResult.message);

	const messageData = {
		emote: false,
		nick: nick,
		type: type,
		msg: applyPluginFilters(parsed.msg, socket),
		metadata: metadata,
		multi: parsed.multi,
		timestamp: timestamp,
	};

	const command = chatCommandMap[parsed.command];
	if (command) {
		const { doSuppress } = command(parsed, socket, messageData);

		if (doSuppress) {
			return;
		}
	}

	if (flags.serverResponseMessage) {
		emitChat(socket, { nick: "server", emote: "server", msg: flags.serverResponseMessage, metadata, timestamp });
	}

	if (flags.sendToAdmins) {
		sessionService.forCan(actions.CAN_SEE_SHADOWBANS, session =>
			emitChat(session, {
				...messageData,
				metadata: {
					...messageData.metadata,
					graymute: true
				}
			}, false),
		);
	}

	if (flags.sendToSelf) {
		emitChat(socket, messageData, false);
	}

	if (flags.sendToUsers) {
		emitChat(io.sockets, messageData, false);
	}

	if (flags.addToBuffer) {
		const targetBuffer = SERVER.OUTBUFFER[channel] || (SERVER.OUTBUFFER[channel] = []);
		targetBuffer.push(messageData);

		if (targetBuffer.length > SERVER.settings.core.max_saved_buffer) {
			targetBuffer.shift();
		}
	}
}

/* ================= */
function setOverrideCss(path) {
	upsertMisc({ name: "overrideCss", value: path }, function () {
		io.sockets.emit("overrideCss", path);
	});
}
function setToggleable(socket, name, state, callback) {
	if (typeof SERVER.settings.toggles[name] == "undefined") {
		callback(`Toggleable ${name} not found`);
		return;
	}
	if (typeof state == "undefined") {
		state = !SERVER.settings.toggles[name][0];
	}

	SERVER.settings.toggles[name][0] = state;

	if (callback) {
		callback(null, {
			name: name,
			state: state
		});
	}
}
function getToggleable(name) {
	if (typeof SERVER.settings.toggles[name] == "undefined") {
		DefaultLog.error(events.EVENT_GENERAL, "No such toggleable {name} found", { name });
		return false;
	}

	return SERVER.settings.toggles[name][0];
}
function sendToggleables(socket) {
	var data = {};
	for (var key in SERVER.settings.toggles) {
		if (SERVER.settings.toggles.hasOwnProperty(key)) {
			data[key] = {};
			data[key].label = SERVER.settings.toggles[key][1];
			data[key].state = SERVER.settings.toggles[key][0];
		}
	}
	socket.emit("setToggleables", data);
}

function getVideoPosition(node) {
	let video = SERVER.PLAYLIST.first;

	for (let index = 0; index < SERVER.PLAYLIST.length; index++) {
		if (video === node) {
			return index;
		}

		video = video.next;
	}

	return -1;
}

function getVideoAt(index) {
	if (index < 0 || index > SERVER.PLAYLIST.length) {
		return null;
	}

	let video = SERVER.PLAYLIST.first;

	for (let i = 0; i < SERVER.PLAYLIST.length; i++) {
		if (i === index) {
			return {
				position: index,
				node: video
			};
		}

		video = video.next;
	}

	return null;
}

function saveToHistory(node) {
	const historyQuery = "insert into videos_history (videoid, videotitle, videolength, videotype, date_added, meta) values (?,?,?,?,NOW(),?)";
	const historyQueryParams = [
		String(node.videoid),
		node.videotitle,
		node.videolength,
		node.videotype,
		JSON.stringify(node.meta || {})
	];

	mysql.query(historyQuery, historyQueryParams, function (err) {
		if (err) {
			DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql: historyQuery }, err);
			return;
		}
	});
}

function delVideo(video, sanity, socket) {
	const {node, position} = video;

	if (node.deleted) {
		return;
	}

	if (sanity && node.videoid !== sanity) {
		return doorStuck(socket);
	}

	try {
		SERVER.PLAYLIST.remove(node);
		io.sockets.emit('delVideo', {
			position,
			sanityid: node.videoid
		});
		
		const query = `delete from ${SERVER.dbcon.video_table} where videoid = ? limit 1`;

		mysql.query(query, [String(node.videoid)], function (err) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql: query }, err);
				return;
			}

			//save to history if not a livestream
			if (node.videolength > 0) {
				saveToHistory(node);
			}
		});

		node.deleted = true;

		DefaultLog.info(events.EVENT_ADMIN_DELETED_VIDEO,
			"{mod} deleted {title}",
			{ mod: getSocketName(socket), type: "playlist", title: decodeURIComponent(node.videotitle) });

	} catch (e) {
		DefaultLog.error(events.EVENT_ADMIN_DELETED_VIDEO,
			"{mod} could not delete {title}",
			{ mod: getSocketName(socket), type: "playlist", title: decodeURIComponent(node.videotitle) }, e);
	}
}

function rawAddVideoAsync(data) {
	return new Promise((res, rej) => {
		rawAddVideo(data,
			arg => res(arg),
			err => rej(err));
	});
}

function rawAddVideo(d, successCallback, failureCallback) {

	// Check for any existing metadata
	var sql = 'select meta from videos_history where videoid = ?';
	mysql.query(sql, ['' + d.videoid], function (err, result) {
		if (err) {
			DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
			return;
		}

		if (result.length == 1) {
			try {
				d.meta = {
					...JSON.parse(result[0].meta),
					...d.meta,
				};
			} catch (e) { }
		}
		var sql = 'delete from videos_history where videoid = ?';
		mysql.query(sql, ['' + d.videoid], function (err) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
				return;
			}
		});
		if (!('meta' in d) || d.meta == null) { d.meta = {}; }
		if (!('addedon' in d.meta)) { d.meta.addedon = new Date().getTime(); }
		sql = `insert into ${SERVER.dbcon.video_table} (position, videoid, videotitle, videolength, videotype, videovia, meta) VALUES (?,?,?,?,?,?,?)`;
		var qParams = [d.pos,
		'' + d.videoid,
		d.videotitle,
		d.videolength,
		d.videotype,
		d.who,
		JSON.stringify(d.meta || {})
		];
		mysql.query(sql, qParams, function (err) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
				if (failureCallback) { failureCallback(err); }
			} else {

				var o = new Video();
				o.videoid = d.videoid;
				o.videolength = parseInt(d.videolength);
				o.videotype = d.videotype;
				o.volat = d.volat;
				o.meta = d.meta || {};
				if (d.videolength > SERVER.settings.core.auto_volatile) {
					o.volat = true;
				}
				o.videotitle = d.videotitle;

				if (d.queue) // If we're queueing the video, instead of simply adding it...
				{
					if (SERVER.PLAYLIST.length == 0) {
						SERVER.PLAYLIST.append(o);
					} else {
						SERVER.PLAYLIST.insertAfter(SERVER.ACTIVE, o);
					}

					io.sockets.emit('addVideo', {
						queue: true,
						video: o.pack(),
						sanityid: SERVER.ACTIVE.videoid
					});
				} else {
					if (SERVER.PLAYLIST.length == 0) {
						SERVER.PLAYLIST.append(o);
					} else {
						SERVER.PLAYLIST.insertAfter(SERVER.PLAYLIST.last, o);
					}

					io.sockets.emit('addVideo', {
						queue: false,
						video: o.pack(),
						sanityid: SERVER.ACTIVE.videoid
					});
				}

				if (successCallback) { successCallback(); }
			}
		});

	});

}


function addLiveVideo(data, meta, successCallback, failureCallback) {
	data.videotitle = data.videotitle.replace(/[^0-9a-zA-Z_ \-~:]/g, "");
	if (!data.videotype.match(/^[a-z]{1,10}$/)) {
		failureCallback(new Error(`Videotype wasn't lowercase alpha or was too long: ${data.videotype}`));
		return;
	}

	var pos = SERVER.PLAYLIST.length;
	var videoid = data.videoid.trim();
	var volat = true;
	rawAddVideo({
		pos: pos,
		videoid: videoid,
		videotitle: data.videotitle,
		videolength: 0,
		videotype: data.videotype,
		who: meta.nick,
		queue: data.queue,
		volat: volat
	}, function () {
		if (successCallback) { successCallback({ title: data.videotitle }); }
	}, function (err) {
		if (failureCallback) { failureCallback(err); }
	});
}
function addVideoVimeo(socket, data, meta, successCallback, failureCallback) {
	var videoid = data.videoid.trim().replace('/', '');
	var publicPath = '/api/v2/video/' + videoid.toString() + ".json";
	var embedCallback = function () {
		var embedPath = '/api/oembed.json?url=http%3A//vimeo.com/' + videoid.toString();
		_addVideoVimeo(socket, data, meta, embedPath, successCallback, failureCallback);
	};
	_addVideoVimeo(socket, data, meta, publicPath, successCallback, embedCallback);
}
function _addVideoVimeo(socket, data, meta, path, successCallback, failureCallback) {
	var pos = SERVER.PLAYLIST.length;
	var volat = data.volat;
	var jdata;
	if (meta.type <= 0) { volat = true; }
	if (volat === undefined) { volat = false; }

	var options = {
		host: 'vimeo.com',
		path: path
	};
	var recievedBody = "";
	var req = https.get(options, function (res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			recievedBody += chunk;
		});
		res.on('end', function () {
			try {
				jdata = JSON.parse(recievedBody);
				if (util.isArray(jdata)) { jdata = jdata[0]; }
			}
			catch (err) {
				//json parse failure because the failure message from vimeo is a string. ex: 61966249 not found.
				if (failureCallback) { failureCallback(err); }
				return;
			}

			rawAddVideo({
				pos: pos,
				videoid: jdata.id || jdata.video_id,
				videotitle: encodeURI(jdata.title),
				videolength: jdata.duration,
				videotype: "vimeo",
				who: meta.nick,
				queue: data.queue,
				volat: volat
			}, function () {
				if (successCallback) { successCallback({ title: jdata.title }); }
			}, function (err) {
				if (failureCallback) { failureCallback(err); }
			});
		});
	});
	req.on('error', function (e) {
		if (failureCallback) { failureCallback(e); }
	});
}

function resolveRestrictCountries(restrictReasons) {
	if (restrictReasons.countries) {
		if (!Array.isArray(restrictReasons.countries)) {
			restrictReasons.countries = restrictReasons.countries.split(/\s+/);
		}
		restrictReasons.totalCountries = restrictReasons.countries.length;
		restrictReasons.countries = restrictReasons.countries.slice(0, 10);
		restrictReasons.countryNames = restrictReasons.countries.map(code => isoCountries.getName(code, 'en'));
	}
}

function parseDuration(duration) {
	var matches = duration.match(/[0-9]+[DHMS]/gi);
	var seconds = 0;
	matches.forEach(function (part) {
		var unit = part.charAt(part.length - 1);
		var amount = parseInt(part.slice(0, -1));
		switch (unit) {
			case 'D':
			case 'd':
				seconds += amount * 60 * 60 * 12;
				break;
			case 'H':
			case 'h':
				seconds += amount * 60 * 60;
				break;
			case 'M':
			case 'm':
				seconds += amount * 60;
				break;
			case 'S':
			case 's':
				seconds += amount;
				break;
			default:
			// noop
		}
	});

	return seconds;
};

function addVideoYT(socket, data, meta, successCallback, failureCallback) {
	var videoid = data.videoid.trim();
	if (videoid.length == 0) {
		if (failureCallback) { failureCallback("no title specified"); }
		return;
	}
	var options = {
		host: 'www.googleapis.com',
		path: '/youtube/v3/videos?id=' + encodeURIComponent(videoid.toString()) + '&key=' + SERVER.settings.apikeys.youtube + '&part=snippet%2CcontentDetails%2Cstatus&hl=en'
	};

	var recievedBody = "";
	var maybeError = null;

	var req = https.get(options, function (res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			recievedBody += chunk;
		});

		res.on('end', function () { //7zLNB9z_AI4
			try {
				var vidObj = JSON.parse(recievedBody);
			} catch (e) {
				maybeError = e;
				DefaultLog.error(events.EVENT_ADMIN_ADDED_VIDEO, "could not add youtube video {videoId}: {error}... trying fallback", { videoId: videoid, error: e.message || e }, err);
				addYoutubeVideoFallback();
				return;
			}

			if (vidObj && vidObj.items && vidObj.items.length > 0) {
				vidObj = vidObj.items[0];
			} else {
				maybeError = "bad json response";
				DefaultLog.error(events.EVENT_ADMIN_ADDED_VIDEO, "could not add youtube video {videoId}: {response}... trying fallback", { videoId: videoid, response: JSON.stringify(vidObj) });
				addYoutubeVideoFallback();
				return;
			}

			var formattedTitle = "Cades fucked it up";
			var formattedTime = "fucked";
			var restricted = [];
			var embeddable = true;
			if (vidObj &&
				vidObj.snippet &&
				vidObj.snippet.localized &&
				vidObj.snippet.localized.title &&
				typeof (vidObj.snippet.localized.title) == "string" &&
				vidObj.snippet.localized.title.length > 0) {
				formattedTitle = vidObj.snippet.localized.title;
			}
			else if (
				vidObj &&
				vidObj.snippet &&
				vidObj.snippet.title
			) { formattedTitle = vidObj.snippet.title; }

			if (
				vidObj &&
				vidObj.contentDetails &&
				vidObj.contentDetails.duration
			) { formattedTime = parseDuration(vidObj.contentDetails.duration); }

			if (
				vidObj &&
				vidObj.status
			) { embeddable = !!vidObj.status.embeddable; }

			var restrictReasons = {};

			if (!data.force &&
				vidObj.contentDetails.regionRestriction &&
				(vidObj.contentDetails.regionRestriction.allowed || vidObj.contentDetails.regionRestriction.blocked)) {
				// Country restrctions
				var countryRestriction = vidObj.contentDetails.regionRestriction.blocked;
				var countryAllow = vidObj.contentDetails.regionRestriction.allowed;

				if (countryRestriction) {
					var ignored = SERVER.settings.core.country_restriction_ignored;
					for (var i = 0; i < ignored.length; ++i) {
						var idx = countryRestriction.indexOf(ignored[i]);
						if (idx > -1) {
							countryRestriction.splice(idx, 1);
						}
					}
					if (countryRestriction.length > 0) {
						restrictReasons.countries = countryRestriction;
						maybeError = "video has country restrictions";
					}
				}
				if (countryAllow) {
					var required = SERVER.settings.core.country_allow_required || ['GB', 'CA', 'US'];
					for (var i = 0; i < required.length; ++i) {
						if (countryAllow.indexOf(required[i]) <= -1) {
							restricted.push(required[i]);
						}
					}
					if (restricted.length > 0) {
						restrictReasons.countries = restricted;
						maybeError = "video has country restrictions";
					}
				}
			}

			if (!embeddable) {
				restrictReasons.noembed = true;
				maybeError = "video cannot be embedded";
			}

			const ageRestricted = vidObj.contentDetails.contentRating.ytRating === 'ytAgeRestricted';

			//check for the age restrictions
			if (!data.force && ageRestricted) {
				restrictReasons.ageRestricted = ageRestricted;
				maybeError = 'video is possibly age restricted';
			}

			if (!data.force && restrictReasons.countries) {
				resolveRestrictCountries(restrictReasons);
			}

			if (!data.force && Object.keys(restrictReasons).length > 0) {
				socket.emit("videoRestriction", restrictReasons);
			}

			var pos = SERVER.PLAYLIST.length;

			if (!maybeError) {
				var volat = data.volat;
				if (meta.type <= 0) { volat = true; }
				if (volat === undefined) { volat = false; }

				rawAddVideo({
					pos: pos,
					videoid: videoid,
					videotitle: encodeURI(formattedTitle),
					videolength: formattedTime,
					videotype: "yt",
					who: meta.nick,
					queue: data.queue,
					volat: volat
				}, function () {
					if (successCallback) { successCallback({ title: formattedTitle }); }
				}, function (err) {
					if (failureCallback) { failureCallback(err); }
				});
			} else {
				if (failureCallback) { failureCallback(maybeError); }
			}
		});
	});

	req.on('error', function (e) {
		addYoutubeVideoFallback();
	});

	function addYoutubeVideoFallback() {
		fetchYoutubeVideoInfo(videoid, (err, videoData) => {
			if (err) {
				DefaultLog.error(events.EVENT_ADMIN_ADDED_VIDEO, "could not add youtube video {videoId}: {error}", { videoId: videoid, error: err }, err);
				failureCallback(err);
				return;
			}

			const { title, duration } = videoData;
			var pos = SERVER.PLAYLIST.length;
			var volat = data.volat;

			if (meta.type <= 0) { volat = true; }
			if (volat === undefined) { volat = false; }

			rawAddVideo({
				pos: pos,
				videoid: videoid,
				videotitle: encodeURI(title),
				videolength: duration,
				videotype: "yt",
				who: meta.nick,
				queue: data.queue,
				volat: volat
			}, function () {
				if (successCallback) { successCallback({ title }); }
			}, function (err) {
				if (failureCallback) { failureCallback(err); }
			});
		});
	}
}

function followRedirect(options, successCallback, failureCallback) {
	https.get(options, function (res) {
		// Detect a redirect
		if ((res.statusCode == 301 || res.statusCode == 302) && res.headers.location) {
			// The location for some (most) redirects will only contain the path,  not the hostname;
			// detect this and add the host to the path.
			var parsedUrl = url.parse(res.headers.location);
			if (parsedUrl.hostname) {
				// Hostname included; make request to res.headers.location
				options.path = parsedUrl.path;
			} else {
				// Hostname not included; get host from requested URL (url.parse()) and prepend to location.
				options.path = res.headers.location;
			}
			https.get(options, successCallback)
				.on('error', function (e) {
					if (failureCallback) { failureCallback(e); }
				});

			// Otherwise no redirect; capture the response as normal
		} else if (res.statusCode == 200) {
			successCallback(res);
		} else {
			if (failureCallback) { failureCallback(); }
		}
	}).on('error', function (e) {
		if (failureCallback) { failureCallback(e); }
	});
}

let soundCloudToken = null;
let soundCloudTokenExpiry = new Date();

async function getSoundCloudToken() {
	if (soundCloudToken && soundCloudTokenExpiry.getTime() > Date.now()) {
		return soundCloudToken;
	}

	const response = await fetch('https://api.soundcloud.com/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			client_id: process.env.SOUNDCLOUD_CLIENT_ID,
			client_secret: process.env.SOUNDCLOUD_CLIENT_SECRET,
			grant_type: 'client_credentials',
		}),
	});
	if (!response.ok) {
		throw new Error('Unable to fetch SoundCloud access token');
	}

	soundCloudToken = await response.json();
	soundCloudTokenExpiry = new Date();
	soundCloudTokenExpiry.setSeconds(soundCloudTokenExpiry.getSeconds() + soundCloudToken.expires_in * 0.9);
	return soundCloudToken;
}

async function addVideoSoundCloud(socket, data, meta, successCallback, failureCallback) {
	var videoid = data.videoid.trim();
	var path;
	if (videoid.length == 0) {
		if (failureCallback) { failureCallback(); }
		return;
	}
	if (videoid.substring(0, 2) == "SC") {
		path = '/tracks/' + encodeURIComponent(videoid.substring(2)) + '.json';
	} else {
		path = '/resolve.json?url=' + encodeURIComponent(videoid);
	}
	let accessToken;
	try {
		accessToken = (await getSoundCloudToken()).access_token;
	} catch (err) {
		if (failureCallback) { failureCallback(err); }
		return;
	}
	var options = {
		host: 'api.soundcloud.com',
		path: path,
		headers: {
			'Authorization': `OAuth ${accessToken}`
		}
	};
	var recievedBody = "";
	followRedirect(options, function (res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			recievedBody += chunk;
		});
		res.on('end', function () {
			try {
				jdata = JSON.parse(recievedBody);
			}
			catch (err) {
				if (failureCallback) { failureCallback(err); }
				return;
			}

			var volat = data.volat;
			if (meta.type <= 0) { volat = true; }
			if (volat === undefined) { volat = false; }
			rawAddVideo({
				pos: SERVER.PLAYLIST.length,
				// Don't collide with vimeo
				videoid: 'SC' + jdata.id,
				videotitle: encodeURI(jdata.user.username + " - " + jdata.title),
				// soundcloud is millis
				videolength: jdata.duration / 1000,
				videotype: "soundcloud",
				who: meta.nick,
				queue: data.queue,
				volat: volat,
				meta: {
					permalink: jdata.permalink_url
				}
			}, function () {
				if (successCallback) { successCallback({ title: jdata.user.username + " - " + jdata.title }); }
			}, function (err) {
				if (failureCallback) { failureCallback(err); }
			});
		});
	}, failureCallback);
}

async function addVideoFile(socket, data, meta, successCallback, failureCallback) {
	const videoid = data.videoid.trim();

	if (videoid.length == 0) {
		failureCallback();
		return;
	}

	const rawVideoInfo = parseRawFileUrl(videoid);
	if (!rawVideoInfo) {
		failureCallback("could not parse raw file information");
		return;
	}

	try {
		const duration = Math.ceil((await getDuration(videoid)) || 0);
		if (duration <= 0) {
			failureCallback("no duration");
			return;
		}

		const isVolatile = meta.type > 0
			? (data.volat || false)
			: true;

		await rawAddVideoAsync({
			pos: SERVER.PLAYLIST.length,
			videoid: videoid,
			videotitle: rawVideoInfo.title,
			videolength: duration,
			videotype: "file",
			who: meta.nick,
			queue: data.queue,
			volat: isVolatile
		});

		successCallback({ title: rawVideoInfo.title });
	} catch (e) {
		failureCallback(e);
	}
}

async function addVideoManifest(socket, data, meta, successCallback, failureCallback) {
	try {
		const manifestUrl = data.videoid.trim();
		const response = await fetch(manifestUrl);
		const manifest = sanitizeManifest(await response.json());

		if (manifest.sources.length === 0) {
			throw new Error("manifest must have one or more sources specified");
		}

		const isVolatile = meta.type > 0
			? (data.volat || false)
			: true;

		await rawAddVideoAsync({
			pos: SERVER.PLAYLIST.length,
			videoid: manifestUrl,
			videotitle: manifest.title,
			videolength: manifest.duration,
			videotype: "file",
			who: meta.nick,
			queue: data.queue,
			volat: isVolatile,
			meta: {
				manifest
			}
		});

		successCallback({ title: manifest.title });
	} catch (e) {
		failureCallback(e.message || e);
	}
}

function addVideoDash(socket, data, meta, successCallback, failureCallback) {
	var videoid = data.videoid.trim();
	if (videoid.length == 0) {
		failureCallback("invalid video id");
		return;
	}

	fetch(videoid)
		.then(resp => resp.text())
		.then(data => et.parse(data))
		.then(manifest => {
			const root = manifest.getroot();
			let duration = root.get('mediaPresentationDuration');
			if (!duration) {
				failureCallback('no duration');
				return;
			}
			duration = Math.ceil(isoDuration.toSeconds(isoDuration.parse(duration)));
			if (duration <= 0) {
				failureCallback('zero duration');
				return;
			}

			var volat = data.volat;
			if (meta.type <= 0) { volat = true; }
			if (volat === undefined) { volat = false; }
			const parts = videoid.split('/');
			const videoTitle = data.videotitle ? encodeURI(data.videotitle) : parts[parts.length - 1];
			rawAddVideo({
				pos: SERVER.PLAYLIST.length,
				videoid: videoid,
				videotitle: videoTitle,
				videolength: duration,
				videotype: "dash",
				who: meta.nick,
				queue: data.queue,
				volat: volat
			}, function () {
				if (successCallback) { successCallback({ title: videoTitle }); }
			}, function (err) {
				if (failureCallback) { failureCallback(err); }
			});
		}).catch(err => {
			failureCallback(err);
		});
}

async function twitchApi(path, params = {}) {
	// TODO: use an actual OAuth client and cache the token etc.
	const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
		method: 'POST',
		body: new URLSearchParams({
			client_id: process.env.TWITCH_CLIENT_ID,
			client_secret: process.env.TWITCH_CLIENT_SECRET,
			grant_type: 'client_credentials',
		}),
	});
	if (!tokenResponse.ok) {
		throw new Error(`token fetch error: ${await tokenResponse.text()}`);
	}
	const token = await tokenResponse.json();

	if (Array.isArray(path)) {
		path = path.join('/');
	}

	const url = new URL(path, 'https://api.twitch.tv/helix/');
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, value);
	}

	const response = await fetch(url.toString(), {
		headers: {
			'Client-Id': process.env.TWITCH_CLIENT_ID,
			'Authorization': `Bearer ${token.access_token}`,
		},
	});

	const data = await response.json();
	console.log('twitch', url.toString(), data);

	if (!response.ok) {
		throw new Error(`${data.error}: ${data.message}`);
	}

	return data.data;
}

function addVideoTwitch(socket, data, meta, successCallback, failureCallback) {
	var volat = data.volat;
	if (meta.type <= 0) { volat = true; }
	if (volat === undefined) { volat = false; }

	const parts = data.videoid.trim().split('/');
	if (parts[0] === 'videos') {
		twitchApi('videos', { id: parts[1] }).then(response => {
			response = response?.[0];
			if (!response) {
				if (failureCallback) { failureCallback('no such video'); }
				return;
			}

			let videoid = response.id;
			if (videoid[0] === 'v') {
				videoid = videoid.substr(1);
			}

			rawAddVideo({
				pos: SERVER.PLAYLIST.length,
				videoid: 'videos/' + videoid,
				videotitle: encodeURI(response.title),
				videolength: parseDuration(response.duration),
				videotype: "twitch",
				who: meta.nick,
				queue: data.queue,
				volat: volat
			}, function () {
				if (successCallback) { successCallback({ title: response.title }); }
			}, function (err) {
				if (failureCallback) { failureCallback(err); }
			});
		}).catch(error => {
			if (failureCallback) { failureCallback(error); }
		});
	} else {
		twitchApi(['search', 'channels'], { query: parts[0], first: 1 }).then(response => {
			response = response?.[0];
			if (!response) {
				if (failureCallback) { failureCallback('no such channel'); }
				return;
			}

			rawAddVideo({
				pos: SERVER.PLAYLIST.length,
				videoid: response.broadcaster_login,
				videotitle: encodeURI(response.display_name),
				videolength: 0,
				videotype: "twitch",
				who: meta.nick,
				queue: data.queue,
				volat: volat
			}, function () {
				if (successCallback) { successCallback({ title: response.display_name }); }
			}, function (err) {
				if (failureCallback) { failureCallback(err); }
			});
		}).catch(error => {
			if (failureCallback) { failureCallback(error); }
		});
	}
}

function addVideoTwitchClip(socket, data, meta, successCallback, failureCallback) {
	var volat = data.volat;
	if (meta.type <= 0) { volat = true; }
	if (volat === undefined) { volat = false; }

	twitchApi('clips', { id: data.videoid }).then(response => {
		response = response?.[0];
		if (!response) {
			if (failureCallback) { failureCallback('no such clip'); }
			return;
		}

		rawAddVideo({
			pos: SERVER.PLAYLIST.length,
			videoid: response.id,
			videotitle: encodeURI(response.title),
			videolength: Math.ceil(response.duration),
			videotype: "twitchclip",
			who: meta.nick,
			queue: data.queue,
			volat: volat
		}, function () {
			if (successCallback) { successCallback({ title: response.title }); }
		}, function (err) {
			if (failureCallback) { failureCallback(err); }
		});
	}).catch(error => {
		if (failureCallback) { failureCallback(error); }
	});
}

async function dailymotionApi(path, params = {}) {
	if (Array.isArray(path)) {
		path = path.join('/');
	}
	params = Object.keys(params)
		.map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
		.join('&');

	const response = await fetch('https://api.dailymotion.com/' + path + (params ? ('?' + params) : ''), {
		headers: {
			'Accept': 'application/json'
		}
	});

	if (!response.ok) {
		const data = await response.json();
		throw new Error(`${data.error}: ${data.message}`);
	}

	return response.json();
}

function addVideoDailymotion(socket, data, meta, successCallback, failureCallback) {
	var volat = data.volat;
	if (meta.type <= 0) { volat = true; }
	if (volat === undefined) { volat = false; }

	const videoId = data.videoid.trim();
	dailymotionApi(['video', videoId], {
		fields: 'title,duration'
	}).then(response => {
		rawAddVideo({
			pos: SERVER.PLAYLIST.length,
			videoid: videoId,
			videotitle: encodeURI(response.title),
			videolength: response.duration,
			videotype: "dm",
			who: meta.nick,
			queue: data.queue,
			volat: volat
		}, function () {
			if (successCallback) { successCallback({ title: response.title }); }
		}, function (err) {
			if (failureCallback) { failureCallback(err); }
		});
	}).catch(error => {
		if (failureCallback) { failureCallback(error); }
	});
}

async function getRedditVideoURL(url) {
	//gave v.redd.it link
	if (url.endsWith('.mpd')) {
		return url;
	}

	if (!url.endsWith('/')) {
		url += '/'
	}

	const response = await fetch(`${url}.json`, {
		headers: {
			'Accept': 'application/json'
		}
	});

	if (!response.ok) {
		const data = await response.json();
		throw new Error(`${data.error}: ${data.message}`);
	}

	const json = await response.json();

	/*
	JSON response (I assume) is like this:
	[0] -> the post itself
	[1] -> comments (only what's loaded on initial page load)
	*/

	if (json.length < 2) {
		throw new Error(`Invalid JSON response from: ${url}`);
	}

	const videoBlock = json[0]?.data?.children[0]?.data?.media?.reddit_video;

	if (!videoBlock) {
		throw new Error(`Given reddit URL has no video: ${url}`);
	}

	return videoBlock.dash_url;
}

async function addVideoReddit(socket, data, meta, successCallback, failureCallback) {
	getRedditVideoURL(data.videoid).then(url => {
		const sql = 'select videoid from videos where videoid = ?';
		const videoid = url.split('?')[0];
		const videotitle = videoid.split('/').reverse()[1];

		//reddit has two sources, thread and v.redd.it
		mysql.query(sql, [videoid], function(err, result) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
				if (failureCallback) { failureCallback(err); }
				return;
			}

			//doesn't already exist
			if (!result.length) {
				addVideoDash(socket, {...data, videoid, videotitle}, meta, successCallback, failureCallback);
			} else {
				if (failureCallback) { 
					failureCallback(new Error(`Reddit video is already on playlist: ${videoid}`)); 
				}
			}
		});
	}).catch(error => {
		if (failureCallback) { failureCallback(error)}
	})
}

function isTrackingTime() {
	if (SERVER.LIVE_MODE) { return false; }
	return true;
}

/* RUN ONCE INIT */
initPlaylist(function () {
	initResumePosition(function () {
		initTimer();
	});
});
initShadowbant();
initHardbant();
initPartyRooms();
initFilters();
initAreas();
DefaultLog.info(events.EVENT_SERVER_STATUS, "server version {version} started up", { version: SERVER.settings.core.version });

io.configure(function () {
	io.set('authorization', function (handshakeData, callback) {

		if (isUserBanned({
			ips: [handshakeData.address.address],
			nicks: []
		})) {
			callback("BAN", false); // error first callback style
		}

		// OK
		callback(null, true); // error first callback style
	});
});

io.sockets.on('connection', function (ioSocket) {
	const socket = serviceLocator.sessions.fromIoSocket(ioSocket);
	if (socket === null) {
		// the socket connection was rejected
		ioSocket.disconnect();
		DefaultLog.error(events.EVENT_GENERAL, "rejecting socket");
		return;
	}

	services.forEach(s => s.onSocketConnected(socket));

	socket.addOnAuthenticatedHandler(() => {
		if (socket.session.type < userTypes.MODERATOR) {
			return;
		}

		socket.socket.join("admin");
		sendToggleables(socket);

		for (var i in SERVER.OUTBUFFER["admin"]) {
			emitChat(socket, SERVER.OUTBUFFER["admin"][i], true);
		}

		for (var i in SERVER.OUTBUFFER["adminLog"]) {
			var data = SERVER.OUTBUFFER["adminLog"][i];
			data.ghost = true;
			socket.emit("adminLog", data);
		}
	});

	// Send the SERVER.PLAYLIST, and then the position.
	sendToggleables(socket);
	socket.emit("recvPlaylist", SERVER.PLAYLIST.toArray());
	sendDrinks(socket);
	sendAreas(socket);
	for (var i in SERVER.OUTBUFFER['main']) {
		emitChat(socket, SERVER.OUTBUFFER['main'][i], true);
	}

	socket.on("setOverrideCss", function (data) {
		if (!authService.can(socket.session, actions.ACTION_CAN_SET_CSS)) {
			kickForIllegalActivity(socket, "You cannot set the CSS");
			return;
		}

		DefaultLog.info(events.EVENT_ADMIN_SET_CSS,
			"{mod} set css override to {css}",
			{ mod: getSocketName(socket), type: "site", css: data });

		setOverrideCss(data);
	});
	socket.on("setFilters", function (data) {
		if (!authService.can(socket.session, actions.ACTION_SET_FILTERS)) {
			kickForIllegalActivity(socket, "You cannot set the Filters");
			return;
		}

		DefaultLog.info(events.EVENT_ADMIN_EDITED_FILTERS,
			"{mod} edited filters",
			{ mod: getSocketName(socket), type: "site" });

		SERVER.FILTERS = data;
	});
	socket.on("searchHistory", async function (data) {
		if (!authService.can(socket.session, actions.ACTION_SEARCH_HISTORY)) {
			socket.emit("searchHistoryResults", []);
			return;
		}

		const pattern = '%' + encodeURI(data.search).replace(/%/g, '\\%') + '%';
		const { result } = await databaseService.query`
			SELECT
				*
			FROM
				videos_history
			WHERE
				videotitle LIKE ${pattern}
			ORDER BY
				date_added DESC
			LIMIT 50`;

		socket.emit("searchHistoryResults",
			result.map(res => {
				let meta = null;
				try {
					meta = JSON.parse(res.meta);
				} catch { }

				return {
					...res,
					meta: typeof (meta) === "object" ? meta : {}
				};
			}));
	});
	socket.on("delVideoHistory", function (data) {
		if (!authService.can(socket.session, actions.ACTION_DELETE_HISTORY)) {
			return;
		}

		const logData = { mod: getSocketName(socket), type: "playlist", id: data.videoid };

		if (!data.videoid.match(/^[a-zA-Z0-9_ \-#]{3,50}$/)) {
			DefaultLog.error(events.EVENT_ADMIN_CLEARED_HISTORY, "{mod} could not delete history for invalid id {id}", logData);
			return;
		}

		var sql = 'delete from videos_history where videoid = ? limit 1';
		mysql.query(sql, [data.videoid], function (err) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
				DefaultLog.error(events.EVENT_ADMIN_CLEARED_HISTORY, "{mod} could not delete history for invalid id {id}", logData, err);
			} else {
				DefaultLog.info(events.EVENT_ADMIN_CLEARED_HISTORY, "{mod} deleted history for id {id}", logData, err);
			}
		});
	});
	socket.on("randomizeList", function (data) {
		if (!authService.can(socket.session, actions.ACTION_RANDOMIZE_LIST)) {
			return;
		}

		DefaultLog.info(events.EVENT_ADMIN_RANDOMIZED_PLAYLIST,
			"{mod} randomized playlist",
			{ mod: getSocketName(socket), type: "playlist" }
		);

		var newSz = SERVER.PLAYLIST.length;
		var tmp = [];
		var elem = SERVER.PLAYLIST.first;
		for (var i = 0; i < newSz; i++) {
			tmp.push(elem);

			elem = elem.next;
		}
		for (var i = 0; i < newSz; i++) {
			var x = Math.floor(Math.random() * tmp.length);
			var newGuy = tmp[x];
			tmp.splice(x, 1);
			SERVER.PLAYLIST.remove(newGuy);
			SERVER.PLAYLIST.append(newGuy);
		}
		io.sockets.emit("recvNewPlaylist", SERVER.PLAYLIST.toArray());
	});
	socket.on('getFilters', function () {
		if (!authService.can(socket.session, actions.ACTION_GET_FILTERS)) {
			kickForIllegalActivity(socket);
			return;
		}

		sendFilters(socket);
	});
	socket.on('setToggleable', function (data) {
		if (!authService.can(socket.session, actions.ACTION_SET_TOGGLEABLS)) {
			kickForIllegalActivity(socket);
			return;
		}

		tn = data.name;
		ts = data.state;
		setToggleable(socket, tn, ts, function (err) {
			const logData = { mod: getSocketName(socket), type: "site", name: tn, state: ts ? "on" : "off" };

			if (err) {
				DefaultLog.error(events.EVENT_ADMIN_SET_TOGGLEABLE, "{mod} could not set {name} to {state}", logData);
				return;
			}

			DefaultLog.info(events.EVENT_ADMIN_SET_TOGGLEABLE, "{mod} set {name} to {state}", logData);
			sendToggleables(io.sockets);
		});
	});

	socket.on("myPlaylistIsInited", function (data) {
		sendStatus("createPlayer", socket);
	});
	socket.on("renewPos", function (data) {
		sendStatus("renewPos", socket);
	});
	socket.on("refreshMyVideo", function (data) {
		sendStatus("forceVideoChange", socket);
	});
	socket.on("refreshMyPlaylist", function () {
		socket.emit("recvNewPlaylist", SERVER.PLAYLIST.toArray());
	});

	socket.on("chat", async data => {
		const { session: { type, nick }, ip } = socket;

		if (typeof (nick) !== "string" || !ip) { throw kick("You must be logged in to chat"); }

		if (typeof (data) !== "object" || typeof (data.msg) !== "string") { throw kick("Expected data"); }

		if (type < userTypes.ANONYMOUS || nick === '[no username]') { throw kick("Sending messages straight to socket"); }

		const { metadata: metaAttempt, msg } = data;
		if (msg.length > SERVER.settings.core.max_chat_size) { throw kick(`Message length exeeds max size of ${SERVER.settings.core.max_chat_size}`); }

		const metadata = {
			uuid: randomUUID(),
			nameflaunt: !!metaAttempt.nameflaunt,
			flair: ["string", "number"].includes(typeof (metaAttempt.flair))
				? metaAttempt.flair
				: "",
			channel: metaAttempt.channel
		};

		if (metadata.nameflaunt && type < 1) { throw kick(`User ${nick} attempted to flaunt their name, but they are not a mod!`); }

		sendChat(nick, type, { msg, metadata }, socket);
		DefaultLog.info(events.EVENT_CHAT, "user {session} on ip {ip} sent message {message}", {
			ip,
			session: socket.session.systemName,
			message: msg
		});

		function kick(message) {
			kickForIllegalActivity(socket);
			return new Error(message);
		}
	});

	socket.on("registerNick", function (data) {
		const logData = { ip: socket.ip, nick: data.nick };

		var i = SERVER.RECENTLY_REGISTERED.length;
		var ip = socket.ip;
		if (!ip) { return false; }
		var now = new Date();
		// Backwards to splice on the go
		const isLocalIp = ip == "172.20.0.1";
		if (!isLocalIp) {
			while (--i >= 0) {
				if (now - SERVER.RECENTLY_REGISTERED[i].time > SERVER.settings.core.register_cooldown) {
					SERVER.RECENTLY_REGISTERED.splice(i, 1);
				}
				else if (SERVER.RECENTLY_REGISTERED[i].ip == ip) {
					onRegisterError("You are registering too many usernames, try again later.");
					return;
				}
			}
		}
		if (!data.pass || data.pass.length <= 5) {
			onRegisterError("Invalid password. Must be at least 6 characters long.");
			return;
		}
		if (data.pass != data.pass2) {
			onRegisterError("Passwords do not match.");
			return;
		}
		if (!data.nick || data.nick.length <= 0 || data.nick.length > 15) {
			onRegisterError("Username must be under 15 characters.");
			return;
		}
		if (!data.nick.match(/^[0-9a-zA-Z_]+$/ig)) {
			onRegisterError("Username must contain only letters, numbers and underscores.");
			return;
		}
		if (!getToggleable("allowreg")) {
			onRegisterError("Registrations are currently Closed. Sorry for the inconvenience!");
			return;
		}
		if (SERVER.nick_blacklist.has(data.nick.toLowerCase())) {
			onRegisterError("Username not available.");
			return;
		}

		var sql = 'select * from users where name like ?';
		mysql.query(sql, [data.nick], function (err, result, fields) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql: q }, err);
				return;
			}

			if (result.length >= 1) {
				// Already registered, try logging in using the password we have.
				return sessionService.login(socket, data);
			}
			else {
				bcrypt.hash(data.pass, SERVER.settings.core.bcrypt_rounds, function (err, hash) {
					if (err) {
						DefaultLog.error(events.EVENT_REGISTER, "{nick} could not register from ip {ip}", logData, err);
						DefaultLog.error(events.EVENT_GENERAL, "Failed to bcrypt for {nick}'s password", { nick: data.nick }, err);
						return;
					}
					var sql = 'INSERT INTO users (name, pass, type) VALUES (?,?,?)';
					mysql.query(sql, [data.nick, hash, 0], function (err, result, fields) {
						if (err) {
							DefaultLog.error(events.EVENT_REGISTER, "{nick} could not register from ip {ip}", logData, err);
							DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
							return;
						}

						// Registered, log em in.
						return sessionService.login(socket, data);
					});
				});
			}
		});

		function onRegisterError(err) {
			DefaultLog.error(events.EVENT_REGISTER, "{nick} could not register from ip {ip}", logData, err);
			socket.emit("loginError", { message: err });
		}
	});
	socket.on("changePassword", function (data) {
		const nick = socket.session.nick;
		if (!nick) {
			DefaultLog.error(events.EVENT_GENERAL, "Failed to get nick from socket on ip {ip}", { ip: socket.ip });
			return;
		}

		const logData = { ip: socket.ip, nick };
		if (!data.pass || data.pass.length <= 5) {
			const err = "Invalid password. Must be at least 6 characters long.";
			DefaultLog.error(events.EVENT_USER_CHANGED_PASSWORD, "{nick} could not change password from ip {ip}", logData, err);
			socket.emit("loginError", { message: err });
			return;
		}

		bcrypt.hash(data.pass, SERVER.settings.core.bcrypt_rounds, function (err, hash) {
			if (err) {
				DefaultLog.error(events.EVENT_GENERAL, "Failed to bcrypt for {nick}'s password", { nick }, e);
				DefaultLog.error(events.EVENT_USER_CHANGED_PASSWORD, "{nick} could not change password from ip {ip}", logData, err);
				return;
			}

			const sql = "UPDATE users SET pass = ? WHERE name = ?";
			mysql.query(sql, [hash, nick], function (err) {
				if (err) {
					DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
					DefaultLog.error(events.EVENT_USER_CHANGED_PASSWORD, "{nick} could not change password from ip {ip}", logData, err);
					return;
				}

				DefaultLog.info(events.EVENT_USER_CHANGED_PASSWORD, "{nick} changed password from ip {ip}", logData, err);
				socket.emit('forceRefresh');
			});
		});
	});
	socket.on("playNext", function (data) {
		if (!authService.can(socket.session, actions.ACTION_CONTROL_PLAYLIST)) {
			kickForIllegalActivity(socket);
			return;
		}

		DefaultLog.info(events.EVENT_ADMIN_SKIPPED_VIDEO,
			"{mod} skipped video",
			{ mod: getSocketName(socket), type: "playlist" });

		playNext();
	});
	socket.on("sortPlaylist", function (data) {
		if (!authService.can(socket.session, actions.ACTION_CONTROL_PLAYLIST)) {
			kickForIllegalActivity(socket);
			return;
		}

		if (data.from == data.to) { return; } //wat.
		if (data.from < 0 || data.to < 0) { return; } //wat.
		var elem = SERVER.PLAYLIST.first;
		var fromelem, toelem;
		for (var i = 0; i < SERVER.PLAYLIST.length; i++) {
			if (i == data.from) {
				fromelem = elem;
				break;
			}
			elem = elem.next;
		}
		if (data.sanityid && elem.videoid != data.sanityid) { return doorStuck(socket); }
		elem = SERVER.PLAYLIST.first;
		for (var i = 0; i < SERVER.PLAYLIST.length; i++) {
			if (i == data.to) {
				toelem = elem;
				break;
			}
			elem = elem.next;
		}
		SERVER.PLAYLIST.remove(fromelem);
		if (data.to > data.from) { SERVER.PLAYLIST.insertAfter(toelem, fromelem); }
		else { SERVER.PLAYLIST.insertBefore(toelem, fromelem); }

		io.sockets.emit("sortPlaylist", data);

		DefaultLog.info(events.EVENT_ADMIN_MOVED_VIDEO,
			"{mod} moved {title}",
			{ mod: getSocketName(socket), title: decodeURIComponent(fromelem.videotitle), type: "playlist" });
	});
	socket.on("forceVideoChange", function (data) {
		if (!authService.can(socket.session, actions.ACTION_CONTROL_PLAYLIST)) {
			kickForIllegalActivity(socket);
			return;
		}

		let prev = null;
		let next = null;

		let video = SERVER.PLAYLIST.first;
		for (let index = 0; index < SERVER.PLAYLIST.length; index++) {
			if (video === SERVER.ACTIVE) {
				prev = {node: video, position: index};
			}

			if (index === data.index) {
				next = {node: video, position: index};
			}

			if (next && prev) {
				break;
			}

			video = video.next;
		}

		//check if we actually got both
		if (!next || !prev) {
			return doorStuck(socket);
		}

		if (data.sanityid && next.node.videoid !== data.sanityid) {
			return doorStuck(socket);
		}

		if (!prev.node.volat && 'colorTagVolat' in prev.node.meta) {
			_setVideoColorTag(prev.node, prev.position, false, false);
		}
	
		SERVER.ACTIVE = next.node;
	
		DefaultLog.info(events.EVENT_ADMIN_FORCED_VIDEO_CHANGE,
			"{mod} forced video change",
			{ mod: getSocketName(socket), type: "playlist" });
	
		handleNewVideoChange();
		sendStatus("forceVideoChange", io.sockets);

		if (prev.node.volat) {
			delVideo(prev, null, socket);
		} 
	});
	socket.on("delVideo", function (data) {
		if (!authService.can(socket.session, actions.ACTION_DELETE_VIDEO)) {
			kickForIllegalActivity(socket, "You cannot delete videos.");
			return;
		}

		const video = getVideoAt(data.index);

		if (video.node.videoid !== data.sanityid) {
			return doorStuck(socket);
		}

		//switch before actually deleting the correct video
		if (video.node === SERVER.ACTIVE) {
			SERVER.ACTIVE = SERVER.ACTIVE.next;

			handleNewVideoChange();
			sendStatus("forceVideoChange", io.sockets);
		}
		
		delVideo(video, data.sanityid, socket);
	});
	socket.on("addVideo", function (data) {
		if (!authService.can(socket.session, actions.ACTION_CONTROL_PLAYLIST)) {
			kickForIllegalActivity(socket);
			return;
		}

		const meta = { nick: socket.session.nick, type: socket.session.type };
		const logData = { mod: getSocketName(socket), type: "playlist", title: data.videotitle || data.videoid, provider: data.videotype };

		if (data.videotype == "yt") { addVideoYT(socket, data, meta, onVideoAddSuccess, onVideoAddError); }
		else if (data.videotype == "dm") { addVideoDailymotion(socket, data, meta, onVideoAddSuccess, onVideoAddError); }
		else if (data.videotype == "vimeo") { addVideoVimeo(socket, data, meta, onVideoAddSuccess, onVideoAddError); }
		else if (data.videotype == "soundcloud") { addVideoSoundCloud(socket, data, meta, onVideoAddSuccess, onVideoAddError); }
		else if (data.videotype == "file") { addVideoFile(socket, data, meta, onVideoAddSuccess, onVideoAddError); }
		else if (data.videotype == "dash") {
			addVideoDash(socket, data, meta, onVideoAddSuccess, function (error) {
				// TODO: less hax
				if (error === 'no duration') {
					if (!data.videotitle) data.videotitle = "~ Raw Livestream ~";
					addLiveVideo(data, meta, onVideoAddSuccess, onVideoAddError);
				} else {
					onVideoAddError(error);
				}
			});
		}
		else if (data.videotype == "twitch") { addVideoTwitch(socket, data, meta, onVideoAddSuccess, onVideoAddError); }
		else if (data.videotype == "twitchclip") { addVideoTwitchClip(socket, data, meta, onVideoAddSuccess, onVideoAddError); }
		else if (data.videotype === "manifest") {
			addVideoManifest(socket, data, meta, onVideoAddSuccess, onVideoAddError);
		}
		else if (data.videotype === "reddit") {
			addVideoReddit(socket, data, meta, onVideoAddSuccess, onVideoAddError);
		}
		else {
			// Okay, so, it wasn't vimeo and it wasn't youtube, assume it's a livestream and just queue it.
			// This requires a videotitle and a videotype that the client understands.
			addLiveVideo(data, meta, onVideoAddSuccess, onVideoAddError);
		}

		function onVideoAddSuccess(details) {
			logData.title = details.title;
			DefaultLog.info(
				events.EVENT_ADMIN_ADDED_VIDEO,
				"{mod} added {provider} video {title}",
				logData);
		}

		function onVideoAddError(error) {
			DefaultLog.error(
				events.EVENT_ADMIN_ADDED_VIDEO,
				"{mod} could not add {provider} video {title}",
				logData,
				error);

			socket.emit("dupeAdd");
		}
	});
	socket.on("importPlaylist", function (data) {
		// old implementation can be found in source control
		return false;
	});
	socket.on("forceStateChange", function (data) {
		if (!authService.can(socket.session, actions.ACTION_CONTROL_VIDEO)) {
			kickForIllegalActivity(socket);
			return;
		}

		SERVER.STATE = data.state;
		sendStatus("hbVideoDetail", io.sockets);
	});
	socket.on("videoSeek", function (data) {
		if (!authService.can(socket.session, actions.ACTION_CONTROL_VIDEO)) {
			kickForIllegalActivity(socket);
			return;
		}

		SERVER.TIME = data;
		sendStatus("hbVideoDetail", io.sockets);
	});
	socket.on("moveLeader", function (data) {
		data = data || "Server";

		if (data === "Server") {
			if (!authService.can(socket.session, actions.ACTION_RELINQUISH_BERRY)) {
				kickForIllegalActivity(socket, "You cannot relinquish berry");
				return;
			}

			DefaultLog.info(events.EVENT_ADMIN_SET_BERRY,
				"{user} relinquished berry",
				{ user: getSocketName(socket), type: "playlist" });

			sessionService.removeBerry(socket.session);
			return;
		}

		if (!authService.can(socket.session, actions.ACTION_MOVE_BERRY_TO_USER)) {
			kickForIllegalActivity(socket, "You cannot move berry");
			return;
		}

		DefaultLog.info(events.EVENT_ADMIN_SET_BERRY,
			"{mod} moved berry to {nick}",
			{ mod: getSocketName(socket), type: "playlist", nick: data });

		sessionService.forNick(data, session => sessionService.replaceBerry(session));
	});
	socket.on("addLeader", function (data) {
		if (!authService.can(socket.session, actions.ACTION_MOVE_BERRY_TO_USER)) {
			kickForIllegalActivity(socket, "You cannot add a berry");
			return;
		}

		DefaultLog.info(events.EVENT_ADMIN_ADD_BERRY,
			"{mod} gave a berry to {nick}",
			{ mod: getSocketName(socket), type: "playlist", nick: data });

		sessionService.forNick(data, session => sessionService.addBerry(session));
	});
	socket.on("removeLeader", function (data) {
		if (data === socket.session.nick) {
			if (!authService.can(socket.session, actions.ACTION_RELINQUISH_BERRY)) {
				kickForIllegalActivity(socket, "You cannot relinquish berry");
				return;
			}

			DefaultLog.info(events.EVENT_ADMIN_SET_BERRY,
				"{user} relinquished berry",
				{ user: getSocketName(socket), type: "playlist" });

			sessionService.removeBerry(socket.session);
			return;
		}

		if (!authService.can(socket.session, actions.ACTION_MOVE_BERRY_TO_USER)) {
			kickForIllegalActivity(socket, "You cannot remove a berry");
			return;
		}

		DefaultLog.info(events.EVENT_ADMIN_ADD_BERRY,
			"{mod} removed berry from {nick}",
			{ mod: getSocketName(socket), type: "playlist", nick: data });

		sessionService.forNick(data, session => sessionService.removeBerry(session));
	});
	socket.on("kickUser", function (data) {
		if (!authService.can(socket.session, actions.ACTION_KICK_USER)) {
			kickForIllegalActivity(socket);
			return;
		}

		kickUserByNick(socket, data.nick, data.reason);
	});
	socket.on("shadowBan", function (data) {
		if (!authService.can(socket.session, actions.ACTION_SHADOWBAN)) {
			kickForIllegalActivity(socket);
			return;
		}

		var targetNick = data.nick;
		var isbanning = data.sban;
		var temp = data.temp;
		var message = "";
		if (isbanning) {
			message = temp
				? `Temporarily shadow banned ${targetNick}`
				: `Shadow banned ${targetNick}`;

			DefaultLog.info(temp ? events.EVENT_ADMIN_SHADOWBAN_TEMP : events.EVENT_ADMIN_SHADOWBAN_PERMANENT,
				"{mod} shadow banned user {nick}",
				{ mod: getSocketName(socket), nick: targetNick, type: "site" });
		}
		else {
			message = `Un-shadow banned ${targetNick}`;

			DefaultLog.info(events.EVENT_ADMIN_SHADOWBAN_FORGIVEN,
				"{mod} un-shadow banned {nick}",
				{ mod: getSocketName(socket), nick: targetNick, type: "site" });
		}

		if (isbanning) {
			var banEmotes = ['[](/ihavenomouthandimustscream)'
				, '[](/bant)'
				, '[](/mmmbananas)'
				, '[](/celbanned)'
				, '[](/seriouslybanned)'
				, '[](/konahappy)'
				, '[](/ppshutup)'
				, '[](/bpstfu)'
				, '[](/eatadick)'
				, '[](/suggestionbox)'
				, '[](/rargtfo)'
				, '[](/fuckyoudobby)'
				, '[](/cleese)'
				, '[](/wingflipoff)'
				, '[](/pokemonkilledmyparents)'
				, '[](/fuckyourshit)'];
			message = banEmotes[Math.floor(Math.random() * banEmotes.length)] + ' ' + message;
		}
		message = '/me ' + message;
		_sendChat(socket.session.nick, 3, { msg: message, metadata: { channel: 'admin' } }, socket);
		const logData = { mod: getSocketName(socket), ip: socket.ip, type: "site" };

		if (isbanning) {
			sessionService.setShadowbanForNick(targetNick, true, temp);
		} else {
			sessionService.setShadowbanForNick(targetNick, false);
		}
	});
	socket.on("setAreas", function (data) {
		if (!authService.can(socket.session, actions.ACTION_SET_AREAS)) {
			kickForIllegalActivity(socket);
			return;
		}

		areaname = data.areaname;
		content = data.content;

		DefaultLog.info(events.EVENT_ADMIN_EDITED_AREA,
			"{mod} edited {area}",
			{ mod: getSocketName(socket), type: "site", area: areaname });

		setAreas(areaname, content);
	});
	socket.on("fondleVideo", function (data) {
		// New abstraction for messing with video details
		var elem = SERVER.PLAYLIST.first;
		for (var i = 0; i < data.info.pos; i++) {
			elem = elem.next;
		}
		if (data.sanityid && elem.videoid != data.sanityid) { return doorStuck(socket); }

		if ("action" in data) {
			if (data.action == "setVolatile") {
				data = data.info; // Drop action name.
				if (!authService.can(socket.session, actions.ACTION_SET_VIDEO_VOLATILE)) {
					kickForIllegalActivity(socket);
					return;
				}

				pos = data.pos;
				isVolat = data.volat;
				setVideoVolatile(socket, pos, isVolat);
			}
			if (data.action == "setColorTag") {
				data = data.info; // Drop action name.
				if (!authService.can(socket.session, actions.ACTION_SET_VIDEO_VOLATILE)) {
					kickForIllegalActivity(socket);
					return;
				}

				pos = ("pos" in data ? data.pos : 0);
				tag = ("tag" in data ? data.tag : false);
				volat = ("volat" in data ? data.volat : false);
				setVideoColorTag(pos, tag, volat);
			}
		}
	});
	socket.on("fondleUser", function (data) {
		if ("action" in data) {
			if (data.action == "setUserNote") {
				var d = data.info; // Drop action name.
				if (!authService.can(socket.session, actions.ACTION_SET_USER_NOTE)) {
					kickForIllegalActivity(socket);
					return;
				}

				// She wants the d.nick :3
				if (d.nick.match(/^[0-9a-zA-Z_]+$/) != null &&
					d.nick.length >= 1 &&
					d.nick.length <= 20
				) {
					var sql = "select meta from users where name = ?";
					mysql.query(sql, [d.nick], function (err, result, fields) {
						if (err) {
							DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
							return;
						}
						if (result.length == 1) {
							var meta = {};
							try {
								if (result[0].meta) { meta = JSON.parse(result[0].meta) || {}; }
							} catch (e) {
								DefaultLog.error(events.EVENT_GENERAL, "Failed to parse user meta for {nick}", { nick: d.nick }, e);
								meta = {};
							}
							meta.note = d.note;
							sql = "update users set meta = ? where name = ?";
							mysql.query(sql, [JSON.stringify(meta), d.nick], function (err, result, fields) {
								if (err) {
									DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
									return;
								}

								DefaultLog.info(events.EVENT_ADMIN_SET_NOTE,
									"{mod} set {nick}'s note to '{note}'",
									{ mod: getSocketName(socket), type: "user", nick: d.nick, note: d.note });

								sessionService.forNick(d.nick, s => s.updateMeta(meta));
								sessionService.forCan(actions.CAN_SEE_PRIVILEGED_USER_DATA,
									session => session.emit("fondleUser", data));
							});
						}
					});
				}
			}
		}
	});

	socket.on("getBanlist", function (data) {
		if (!authService.can(socket.session, actions.ACTION_BAN)) {
			kickForIllegalActivity(socket);
			return;
		}

		sendBanlist(socket);
	});
	socket.on("ban", function (data) {
		if (!authService.can(socket.session, actions.ACTION_BAN)) {
			kickForIllegalActivity(socket);
			return;
		}

		banUser(data, getSocketName(socket));
	});
	socket.on("partyRoom", function (data) {
		if (!authService.can(socket.session, actions.ACTION_PARTYROOM)) {
			kickForIllegalActivity(socket);
			return;
		}

		applyPartyRoom(data);
		var mod = socket.session.nick;
		var targetNick = data.nicks.join('/');
		var votes = data.maxVotes;
		var note = data.note || "[no note]";
		var duration = data.duration / 60;
		var ip = data.ips.join('/');//...there should never be more than one
		var idText = note?`"${note}", IP:${ip}, Original Nick ${targetNick}`:`${targetNick}, IP:${ip}`;
		var message;
		if (duration != 0) {
			var length = duration > 0 ? `for ${duration} hours` : `indefinitely`;
			message = `applied Party Room status to ${idText} ${length}, with ${votes} max votes.`;
		} else {
			message = `removed Party Room status from ${idText}.`;
		}
		DefaultLog.info(events.EVENT_ADMIN_PARTYROOM, "{mod} {message}", {mod: getSocketName(socket), message:message, type: "site" });

		message = '/me ' + message;
		_sendChat(mod, 3, { msg: message, metadata: { channel: 'admin' } }, socket);
	});

	socket.on("getPartyRoomList", function (data) {
		if (!authService.can(socket.session, actions.ACTION_PARTYROOM)) {
			kickForIllegalActivity(socket);
			return;
		}

		sendPartyRoomList(socket);
	});
	socket.on("forceRefreshAll", function (data) {
		if (!authService.can(socket.session, actions.ACTION_FORCE_REFRESH)) {
			kickForIllegalActivity(socket);
			return;
		}

		if (!data) {
			data = {};
		}
		if (!data.delay) {
			data.delay = true;
		}
		io.sockets.emit('forceRefresh', data);
	});
	socket.on("crash", function (data) {
		//socket.emit(socket);
	});
	socket.on("error", function (err) {
		DefaultLog.error(
			events.EVENT_SOCKET,
			"caught error on socket with ip {ip} and name {nick}",
			{ ip: socket.ip, nick: getSocketName(socket) });
	});
});

function formatDrinkMessage(drinks) {
	if (isDrinkAmountExcessive(drinks)) {
		return "lol go fuck yourself";
	}

	if (Number.isInteger(drinks)) {
		return drinks;
	}

	return drinks.toFixed(2);
}

function isDrinkAmountExcessive(drinks) {
	return Math.abs(drinks) > 1000000;
}

function withAliases(keys, value) {
	const obj = {}
	for (const key of keys) {
		obj[key] = value;
	}

	return obj;
}

/* vim: set noexpandtab : */
