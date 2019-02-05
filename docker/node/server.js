const { PollService } = require("./modules/polls")
const { AuthService } = require("./modules/auth")
const { sanitize, getAddress } = require("./modules/security")
const { DefaultLog, events, levels, consoleLogger, createStreamLogger } = require("./modules/log");
const { getSocketName } = require("./modules/socket");

// Include the SERVER.settings
var SERVER = {};
SERVER.settings = require('./bt_data/settings.js');
SERVER.ponts = require('./bt_data/ponts.js');
SERVER.dbcon = require('./bt_data/db_info.js');
SERVER.nick_blacklist = require('./bt_data/nick_blacklist.js');

var io = require('socket.io').listen(SERVER.settings.core.nodeport);
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
var http = require('http');
var https = require('https');
var et = require('elementtree');
var fs = require('fs');
var _mysql = require('mysql');
var util = require('util');
var crypto = require('crypto');
var url = require('url');
const getDuration = require('get-video-duration');
const isoDuration = require('iso8601-duration');
const fetch = require('node-fetch');
const bcrypt = require('bcrypt');
const isoCountries = require('i18n-iso-countries');
var mysql = null;

process.on("uncaughtException", function (err) {
	console.error(`Uncaught ${err.code}: ${err.message}`);
	console.error(err.stack);

	try {
		const isIgnored = err.code === "ECONNRESET" || err.code === "EPIPE"

		DefaultLog.error(events.EVENT_PROC_UNHANDLED_EXCEPTION,
			"unhandled process exception {code}: {message}. Ignoring: {isIgnored}",
			{ isIgnored, code: err && err.code, message: err && err.message },
			err);

		if (isIgnored)
			return;
	}
	catch (err) { /* the error has already been printed, so just fall out and exit */ }

	process.exit(1);
});

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
	try{
		eval(chunk);
	} catch(e) {
		DefaultLog.error(events.EVENT_REPL, "error invoking repl script: {script}", {script: chunk}, e)
	}
});

/* New DB Init Code Begins Here */
function dbInit(){
	DefaultLog.info(events.EVENT_DB_CONNECTION, "starting database connection to {user}@{host}:{port}", {
		host: SERVER.dbcon.host,
		port: SERVER.dbcon.post,
		user: SERVER.dbcon.mysql_user,
	})

	var config = {
		host: SERVER.dbcon.host,
		port: SERVER.dbcon.post,
		user: SERVER.dbcon.mysql_user,
		password: SERVER.dbcon.mysql_pass
	};

	mysql = _mysql.createConnection(config);

	mysql.on("error", function(err) {
		DefaultLog.error(events.EVENT_DB_CONNECTION, "the database connection threw an error: attempting reconnect", { }, err)
		setTimeout(function(){
			dbInit();
		}, 1000)
	});

	mysql.query(`use ${SERVER.dbcon.database}`);
}

dbInit();

// Add new feature to socket.io, for granular broadcasts and such
// This is probably the best solution to sending packets to all people matching x criteria easily.
// Perhaps implement some way to let superusers see secret info, like IP's, shadownban status etc
io.sockets.each = function(callback){
	var clients = io.sockets.clients();
	for(var i=0;i<clients.length;i++){
		(function(i){
			callback(clients[i]);
		})(i);
	}
}

// SOCKETLIST OBJECT
function SocketList() {}
SocketList.prototype = {
	sockets:[]
};
SocketList.prototype.add = function(socket){
	this.sockets.push(socket);
};
SocketList.prototype.emit = function(eventname,eventdata){
	var splicers = [];
	for(var i=0;i<this.sockets.length;i++){
		if(this.sockets[i].disconnected){
			splicers.push(i);
			continue;
		}
		this.sockets[i].emit(eventname,eventdata);
	}
	for(var i=0;i<splicers.length;i++){
		this.sockets.splice(splicers[i],1);
	}
};
// VIDEO OBJECT
function Video() {}
Video.prototype = {
	videoid : null,
	videolength : null,
	videotitle : null,
	videotype : null,
	volat : false,
	meta : null,
	deleted : false,
	next : null,
	previous : null
};
Video.prototype.pack = function(){
	return {
		videoid : this.videoid,
		videolength : this.videolength,
		videotitle : this.videotitle,
		videotype : this.videotype,
		volat : this.volat,
		meta : this.meta,
		obscure : this.obscure
	}
};

// CREATE THE LINKED LIST DATATYPE
function LinkedList() {}
LinkedList.prototype = {
	length: 0,
	first: null,
	last: null
};
LinkedList.Circular = function() {};
LinkedList.Circular.prototype = new LinkedList();
LinkedList.Circular.prototype.append = function(node) {
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
LinkedList.Circular.prototype.insertAfter = function(node, newNode) {
	newNode.prev = node;
	newNode.next = node.next;
	node.next.prev = newNode;
	node.next = newNode;
	if (newNode.prev == this.last) { this.last = newNode; }
	this.length++;
};
LinkedList.Circular.prototype.insertBefore = function(node, newNode) {
	newNode.prev = node.prev;
	newNode.next = node;
	node.prev.next = newNode;
	node.prev = newNode;
	if (newNode.next == this.first) { this.first = newNode; }
	this.length++;
};
LinkedList.Circular.prototype.remove = function(node) {
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
LinkedList.Circular.prototype.toArray = function(){
	var elem = this.first
	var out = [];
	for(var i=0;i<this.length;i++)
	{
		out.push(elem.pack());
		elem=elem.next;
	}
	return out;
};

/* VAR INIT */
SERVER.PLAYLIST = new LinkedList.Circular();
SERVER.ACTIVE = null;
SERVER.LIVE_MODE = false;
SERVER.AREAS = [];
SERVER.IPLIST = [];
SERVER.STATE=1;
SERVER.LOCKDOWN = false;
SERVER.TIME=0-SERVER.settings.vc.head_time; // referring to time
SERVER._TIME=0; // Previous tick time.
SERVER.LEADER=false;
SERVER.BP_IS_LEADER=true;
SERVER.CHATLIST=[];
SERVER.OUTBUFFER={};
SERVER.SHADOWBANT_IPS={};
SERVER.BANS=[];
SERVER.IP_METADATA={};
SERVER.FILTERS = [];
SERVER.DRINKS=0;
SERVER.FAILED_LOGINS=[];
SERVER.RECENTLY_REGISTERED=[];
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
		const {event, formatted, data, createdAt} = logEvent;

		if (!event.startsWith("EVENT_ADMIN_"))
			return;

		let isBerry = false;
		if (SERVER.LEADER)
			isBerry = (await getSocketName(SERVER.LEADER)) == data.mod;

		const buffer = SERVER.OUTBUFFER["adminLog"] = (SERVER.OUTBUFFER["adminLog"] || []);
		const adminMessage = {
			msg: formatted,
			type: data.type || "site",
			nick: data.mod,
			berry: isBerry,
			timestamp: Math.round(createdAt.getTime() / 1000),
			logEvent
		};

		buffer.push(adminMessage);
		if (buffer.length > SERVER.settings.core.max_saved_buffer)
			buffer.shift();

		forModminSockets(socket => socket.emit("adminLog", adminMessage));
	});

// our composition root
const authService = new AuthService({ isLeader })
const pollService = new PollService({ auth: authService, io })

// all registered services receive certain events, so group them up
const services = [
	pollService,
	authService
]

var MODE_VIDEOCHAT = 0;
var MODE_CHATONLY = 1;

function initPlaylist(callback) {
	var sql = `select * from ${SERVER.dbcon.video_table} order by position`;
	mysql.query(sql, function(err, result) {
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
			try{
				o.meta = JSON.parse(row.meta);
				if(typeof o.meta != "object"){
					o.meta = {};
				}
			} catch(e) { o.meta={}; }
			SERVER.PLAYLIST.append(o);
		}

		SERVER.ACTIVE = SERVER.PLAYLIST.first;
		if(callback)
			callback()
	});
}
function initResumePosition(callback){
	getMisc({name: 'server_active_videoid'}, function(old_videoid){
		var elem = SERVER.PLAYLIST.first;
		for(var i=0;i<SERVER.PLAYLIST.length;i++){
			if(elem.videoid == old_videoid){
				SERVER.ACTIVE = elem;
				getMisc({name: 'server_time'}, function(old_time){
					if (+old_time) {
						SERVER.TIME = +old_time + 1;
					}
					if(callback)callback();
				});
				return;
			}
			elem = elem.next;
		}
		if(callback)callback();
	});
}
function upsertMisc(data, callback){
	var sql = `insert into misc (name,value) VALUES (?,?) ON DUPLICATE KEY UPDATE value = ?`;
	mysql.query(sql, [data.name, data.value, data.value], function(err) {
		if (err)
			DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);

		if (callback)
			callback();
	});
}
function getMisc(data, callback){
	var val = "";
	var sql = `select * from misc where name = ?`;
	mysql.query(sql, [data.name], function(err, result, fields) {
		if (err) {
			DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
			return;
		}
		if(result.length == 1){
			var row = result[0];
			try {
				val = row.value;
			} catch(e) {
				val = "";
				DefaultLog.error(events.EVENT_GENERAL,  `Bad stored misc. Blah. ${data.name}`)
			}
		}
		if(callback) callback(val);
	});
}
function initHardbant(callback){
	getMisc({name:'hardbant_ips'}, function(ips){
		if (ips) {
			SERVER.BANS = JSON.parse(ips) || [];
		}
		if(callback)callback();
	});
}
function initShadowbant(callback){
	getMisc({name:'shadowbant_ips'}, function(ips){
		if(ips){
			var shadowbant = JSON.parse(ips) || [];
			for(var i=0;i<shadowbant.length;++i){
				var data = shadowbant[i];
				SERVER.SHADOWBANT_IPS[data.ip] = {temp:data.temp};
				if(data.temp){
					// Server restarted while temp sban was set, go ahead and set a new timer to unsban them.
					(function(ip){
						SERVER.SHADOWBANT_IPS[ip].timer = setTimeout(function(){
								unShadowBanIP(ip);
						},SERVER.settings.core.temp_ban_duration);
					})(data.ip);
				}
			}
		}
		if(callback) callback();
	});
}
function initFilters(callback){
	getMisc({name:'filters'}, function(filters){
		if(filters){
			SERVER.FILTERS = [];
			try {
				SERVER.FILTERS = JSON.parse(filters) || [];
			} catch(e){
				SERVER.FILTERS = [];
			}

		}
		if(callback) callback();
	});
}
function initTimer(){
	SERVER._TIME = new Date().getTime();
	setInterval(function(){
		if(SERVER.ACTIVE != null)
		{
			var d = new Date();
			var curtime = d.getTime();
			if(Math.ceil(SERVER.TIME+1) >= (SERVER.ACTIVE.videolength + SERVER.settings.vc.tail_time))
			{
				playNext();
			}
			else if(SERVER.STATE != 2)
			{
				var mod = (curtime - SERVER._TIME) / 1000;
				if(isTrackingTime()){
					SERVER.TIME += mod;
				} else {
					resetTime();
				}
			}

			SERVER._TIME = curtime;
		}
	},1000);

	setInterval(function(){
		if(isTrackingTime()){
			if( // This should prevent the crazy jumping to end/beginning on video change.
				(SERVER.ACTIVE.videolength - SERVER.TIME > (SERVER.settings.core.heartbeat_interval/1000)) &&
				(SERVER.TIME > (SERVER.settings.core.heartbeat_interval/1000))
			){
				sendStatus("hbVideoDetail",io.sockets);
			}
		}
	},SERVER.settings.core.heartbeat_interval);
}
function initAreas(){
	var sql = 'select * from areas';
	mysql.query(sql, function(err, result) {
		if (err) {
			DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
			return;
		}
		else {
			for (var i in result) {
				var row = result[i];
				var newArea = {
					name:row.name,
					html:row.html
				};
				SERVER.AREAS.push(newArea);
			}
		}
	});
}
function sendAreas(socket){
	socket.emit("setAreas",SERVER.AREAS);
}
function removeBlacklistedHTML(content){
	var blacklist = ['script','frame','style','marquee','blink'];
	for(var i in blacklist){
		var re = RegExp("<(/*[ ]*"+blacklist[i]+"[ ]*)([^>]*)>",'gi');
		content = content.replace(re,"&lt;$1$2&gt;");
	}
	return content;
}
/* Grumble, the regex above makes my syntax highlighter lose its mind. Putting this here to end the madness. */
function setAreas(areaname,content){
	// Just for the 8-year olds
	content = removeBlacklistedHTML(content);
	for (var i in SERVER.AREAS) {
		if(SERVER.AREAS[i].name == areaname){
			SERVER.AREAS[i].html = content;
			sendAreas(io.sockets);
			return;
		}
	}
	var newArea = {
		name:areaname,
		html:content
	}
	SERVER.AREAS.push(newArea);
	sendAreas(io.sockets);
}
function sendStatus(name,target){
	if(SERVER.ACTIVE != null)
	{
		target.emit(name,{
			video:SERVER.ACTIVE.pack(),
			time:SERVER.TIME,
			state:SERVER.STATE
		});
	}
}
function doorStuck(socket) {
	socket.emit("recvNewPlaylist",SERVER.PLAYLIST.toArray());
	socket.emit('doorStuck');
}
function playNext(){
	var Old = SERVER.ACTIVE;
	if(SERVER.ACTIVE.volat){
		var elem = SERVER.PLAYLIST.first;
		for(var i=0;i<SERVER.PLAYLIST.length;i++){
			if(elem == SERVER.ACTIVE){
				SERVER.ACTIVE = SERVER.ACTIVE.next;
				delVideo({index: i});
				break;
			}
			elem = elem.next;
		}
	} else {
		// Check for a volatile color tag
		if("colorTagVolat" in Old.meta){
			var elem = SERVER.PLAYLIST.first;
			for(var i=0;i<SERVER.PLAYLIST.length;i++){
				if(elem == SERVER.ACTIVE){
					setVideoColorTag(i,false,false);
					break;
				}
				elem = elem.next;
			}
		}
		SERVER.ACTIVE = SERVER.ACTIVE.next;
	}
	SERVER.ACTIVE.position = SERVER.ACTIVE.prev.position+1;
	handleNewVideoChange();
	sendStatus("forceVideoChange",io.sockets);
}
function prepareBans(){
	var i = SERVER.BANS.length;
	while(i--){

		if(SERVER.BANS[i].duration == -1) continue;

		//CHECK DURATION AND TIME, REMOVE BAN IF APPROPRIATE
		// Ban duration is in minutes, so multiply all values by 60 seconds, and 1000 millis, for 60000
		var d = SERVER.BANS[i].duration * 60000;
		var now = new Date().getTime();

		if((now - SERVER.BANS[i].bannedOn) >= d){
			//Ban expired.
			SERVER.BANS.splice(i,1);
		}
	}
}
function augmentBan(ban,o){

	if(!getToggleable("spaceaids")){ return; }

	// Merge IPs, Nicks, Take earlier time, take longer duration.
	for(ip in o.ips){
		if(ban.ips.indexOf(o.ips[ip]) < 0){
			ban.ips.push(o.ips[ip]);
		}
	}
	for(nick in o.nicks){
		if(ban.nicks.indexOf(o.nicks[nick]) < 0){
			ban.nicks.push(o.nicks[nick]);
		}
	}

	// Take earlier ban time.
	if(o.bannedOn < ban.bannedOn){ ban.bannedOn = o.bannedOn; }

	// Take all special values direct, otherwise, replace only if longer period.
	if(o.duration <= 0){ ban.duration = o.duration; }
	else if(o.duration > ban.duration){ ban.duration = o.duration; }
}
function banUser(o){

	var required = ['ips','nicks','duration']; // nick and ip should be arrays, even if single-element
	o.bannedOn = new Date().getTime();
	for(elem in required)if(!(required[elem] in o))return;

	var existing = isUserBanned(o);

	if(existing)
		augmentBan(existing,o);
	else
		SERVER.BANS.push(o);

	prepareBans();

	for(i in o.nicks){
		getSocketOfNick(o.nicks[i],function(s){
			kickUser(s, "You have been banned.");
		});
	}

	//sendBanlist(io.sockets.in('admin'));
}
function isUserBanned(o){
	var required = ['ips','nicks'];
	for(elem in required)if(!(required[elem] in o))return;

	prepareBans();
	for(bannedguy in SERVER.BANS){

		// Check all IP's
		for(ip in o.ips){
			if(!SERVER.BANS[bannedguy].ips) SERVER.BANS[bannedguy].ips = [];
			if(SERVER.BANS[bannedguy].ips.indexOf(o.ips[ip]) >= 0){
				augmentBan(SERVER.BANS[bannedguy],o);
				return SERVER.BANS[bannedguy];
			}
		}
		// Check all Nicks
		for(nick in o.nicks){
			if(!SERVER.BANS[bannedguy].nicks) SERVER.BANS[bannedguy].nicks = [];
			if(SERVER.BANS[bannedguy].nicks.indexOf(o.nicks[nick]) >= 0){
				augmentBan(SERVER.BANS[bannedguy],o);
				return SERVER.BANS[bannedguy];
			}
		}
	}

	return false;
}
function sendBanlist(socket){
	prepareBans();
	socket.emit("recvBanlist",SERVER.BANS);
}
function isUserShadowBanned(socket){
	try{
		var ip = getAddress(socket);
		if(!ip) return false;
		if(ip in SERVER.SHADOWBANT_IPS)
			return true;
		return false;
	}catch(e){
		return false;
	}
}
function shadowBanUser(socket,temp){
	try{
		var ip = getAddress(socket);
		if(!ip) return false;
		return shadowBanIP(ip,temp);
	}catch(e){
		return false;
	}
}
function shadowBanIP(ip,temp){
	try{
		if(ip in SERVER.SHADOWBANT_IPS){
			if(SERVER.SHADOWBANT_IPS[ip].timer) {
				clearTimeout(SERVER.SHADOWBANT_IPS[ip].timer);
				SERVER.SHADOWBANT_IPS[ip].timer = null;
			}
		} else {
			SERVER.SHADOWBANT_IPS[ip] = { temp:temp };
		}

		forModminSockets(function(sc){
			sendShadowBanStatus(sc, ip);
		});
		//sendShadowBanStatus(io.sockets.in('admin'), ip);

		if(temp){
			SERVER.SHADOWBANT_IPS[ip].temp = true;
			SERVER.SHADOWBANT_IPS[ip].timer = setTimeout(function(){
				unShadowBanIP(ip);
			},SERVER.settings.core.temp_ban_duration);
		}
	}catch(e){
		return false;
	}
}
function unShadowBanUser(socket){
	try{
		var ip = getAddress(socket);
		if(!ip) return false;
		return unShadowBanIP(ip);
	}catch(e){
		return false;
	}
}
function unShadowBanIP(ip){
	try{
		var sban = SERVER.SHADOWBANT_IPS[ip];
		if(sban)
			if(sban.timer) clearTimeout(sban.timer);
			delete SERVER.SHADOWBANT_IPS[ip];
		for(var i=0;i<SERVER.IPLIST.length;i++){
			if(SERVER.IPLIST[i].ip == ip){
				// This is our guy.
				var theguy = SERVER.IPLIST[i];
				// Backwards so splice doesn't mess the loop up
				for(var j=theguy.sockets.length-1;j>=0;j--){
					if(theguy.sockets[j].disconnected){
						theguy.sockets.splice(j,1);
						continue;
					}
					theguy.sockets[j].get('nick', function(err, nick){
						if(nick){
							forModminSockets(function(sc){
								sc.emit('unShadowBan', {'nick': nick});
							});
						}
					});
				}
			}
		}
		return true;
   }catch(e){
		return false;
	}
}
function sendShadowBanStatus(target, ip){
	for(var i=0;i<SERVER.IPLIST.length;i++){
		if(SERVER.IPLIST[i].ip == ip){
			// This is our guy.
			var theguy = SERVER.IPLIST[i];
			// Backwards so splice doesn't mess the loop up
			for(var j=theguy.sockets.length-1;j>=0;j--){
				if(theguy.sockets[j].disconnected){
					theguy.sockets.splice(j,1);
					continue;
				}
				theguy.sockets[j].get('nick', function(err, nick){
					if(nick){
						target.emit('shadowBan', {'nick': nick, temp: SERVER.SHADOWBANT_IPS[ip].temp});
					}
				});
			}
		}
	}
}
function kickIfUnderLevel(socket,reason,level){
	socket.get('type',function(err,type){
		if(parseInt(type) < level){
			kickUser(socket,reason);
		}
	});
}
function kickForIllegalActivity(socket,reason){
	DefaultLog.info(events.EVENT_ADMIN_KICKED,
		"{nick} got kicked on {type} because {reason} (illegal things)",
		{ nick: getSocketName(socket), type: "user", reason })

	socket.emit("kicked",reason);
	socket.disconnect(); // NOT ALLOWED.
}
function kickUser(socket,reason,meta){
	DefaultLog.info(meta && meta.ghosted ? events.EVENT_GHOSTED : events.EVENT_ADMIN_KICKED,
		"{nick} got kicked on {type} because {reason}",
		{ nick: getSocketName(socket), type: "user", reason })

	socket.emit("kicked",reason);
	socket.disconnect();
}
function kickUserByNick(socket,nick,reason){
	getSocketOfNick(nick, function(s) {
		kickUser(s, reason);
	});
}
var commit = function(){
	var elem = SERVER.PLAYLIST.first;
	for(var i=0;i<SERVER.PLAYLIST.length;i++)
	{
		var sql = `update ${SERVER.dbcon.video_table} set position = ? where videoid = ?`;
		mysql.query(sql, [i, '' + elem.videoid], function(err) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
				return;
			}
		});
		elem=elem.next;
	}

	for(var i=0;i<SERVER.AREAS.length;i++)
	{
		var sql = 'update areas set html = ? where name = ?';
		mysql.query(sql, [SERVER.AREAS[i].html, SERVER.AREAS[i].name], function(err) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
				return;
			}
		});
	}

	upsertMisc({name:'filters', value:JSON.stringify(SERVER.FILTERS)});

	var shadowbant = [];
	for(var i in SERVER.SHADOWBANT_IPS){
		shadowbant.push({ip:i, temp:SERVER.SHADOWBANT_IPS[i].temp || false});
	}

	upsertMisc({name:'shadowbant_ips', value:JSON.stringify(shadowbant)});
	upsertMisc({name:'hardbant_ips', value:JSON.stringify(SERVER.BANS)});
	upsertMisc({name:'server_time', value:''+Math.ceil(SERVER.TIME)});
	upsertMisc({name:'server_active_videoid', value:''+SERVER.ACTIVE.videoid});
};

const commitInterval = setInterval(commit,SERVER.settings.core.db_commit_delay);

process.on('SIGTERM', function(signal){
	clearInterval(commitInterval);
	io.sockets.emit('serverRestart');
	commit();
	setTimeout(function(){
		process.exit(128 + signal);
	}, 3000);
});

function reassignLeader(socket){
	SERVER.BP_IS_LEADER = false;
	if(SERVER.LEADER)
	{
		SERVER.LEADER.emit("setLeader",false);
	}
	SERVER.LEADER=socket;
	socket.emit("setLeader",true);
	socket.get('nick', function (err, nick) {
		if(nick == null) nick = "anonymous";
		io.sockets.emit("leaderIs",{
			nick:nick
		});
	});
}
function setBpAsLeader(){
	SERVER.BP_IS_LEADER = true;
	if(SERVER.LEADER)
	{
		SERVER.LEADER.emit("setLeader",false);
	}
	SERVER.LEADER=false;
	io.sockets.emit("leaderIs",{
			nick:false
	});
	SERVER.STATE=1;
}
function rmUserFromChat(socket){
	for(var i=0;i<SERVER.CHATLIST.length;i++) {
		if(SERVER.CHATLIST[i].socket.disconnected || SERVER.CHATLIST[i].socket == socket){
			var xsoc = SERVER.CHATLIST[i].socket
			sendUserPart(xsoc);
			SERVER.CHATLIST.splice(i,1);
		}
	}
}
// GIVEAWAYPRIZE
function isGoldUser(name){
	if(name == SERVER.GILDNAME) return true;
	return false;
}
function addUserToChat(socket,data,callback){
	rmUserFromChat(socket);
	var ip = getAddress(socket);
	if(!ip) return false;

	var ipMeta = SERVER.IP_METADATA[ip];
	if(!ipMeta){
		ipMeta = { "aliases": [], ip:ip };
		SERVER.IP_METADATA[ip] = ipMeta;
	}
	ipMeta.timestamp = new Date();
	if(ipMeta.aliases.indexOf(data.nick) == -1){
		ipMeta.aliases.push(data.nick);
	}
	socket.set('nick', data.nick, function () {
		socket.get('gold', function(err, gold){
			socket.emit('setNick',data.nick);
			var user = {
				nick:data.nick,
				socket:socket,
				type:data.type,
				meta:data.meta
			}
			if(gold) {
				user.gold = gold;
				data.gold = gold;
			}
			if(isGoldUser(data.nick)) {
				user.gold = true;
				data.gold = true;
			}
			SERVER.CHATLIST.push(user);
			socket.set('type',data.type,function(){
				socket.emit('setType',data.type);
				if(ip in SERVER.SHADOWBANT_IPS){
					if(SERVER.SHADOWBANT_IPS[ip].temp){
						data.tempshadowbanned = true;
					}
					data.shadowbanned = true;
				}
				data.meta = mergeObjects(ipMeta, data.meta);
				sendUserJoin(data);
				services.forEach(s => s.onSocketAuthenticated(socket, data.type))
				if(callback)callback();

			});
		});
	});

}
function mergeObjects(one, two){
	var result = {};
	for(var item in one) {
		result[item] = one[item];
	}
	for(var item in two) {
		result[item] = two[item];
	}
	return result;
}
function sendChatList(socket, type){
	var out = [];
	if(type >= 1){
		for(var i=0;i<SERVER.CHATLIST.length;i++) {
			var ip = getAddress(SERVER.CHATLIST[i].socket);
			if(!ip) continue;

			// Merge user meta and ip meta into a single object for broadcasting.
			var meta = mergeObjects(SERVER.IP_METADATA[ip], SERVER.CHATLIST[i].meta);
			var user = {
				nick:SERVER.CHATLIST[i].nick,
				type:SERVER.CHATLIST[i].type,
				meta:meta
			};
			// APRIL FOOLS
			if(SERVER.CHATLIST[i].gold){
				user.gold = SERVER.CHATLIST[i].gold;
			}
			if(isGoldUser(SERVER.CHATLIST[i].nick)){
				user.gold = SERVER.CHATLIST[i].gold;
			}
			if(ip in SERVER.SHADOWBANT_IPS){
				if(SERVER.SHADOWBANT_IPS[ip].temp){
					user.tempshadowbanned = true;
				}
				user.shadowbanned = true;
			}
			out.push(user);
		}
	} else {
		for(var i=0;i<SERVER.CHATLIST.length;i++) {
			var user = {
				nick:SERVER.CHATLIST[i].nick,
				type:SERVER.CHATLIST[i].type
			};
			// APRIL FOOLS
			if(SERVER.CHATLIST[i].gold){
				user.gold = SERVER.CHATLIST[i].gold;
			}
			if(isGoldUser(SERVER.CHATLIST[i].nick)){
				user.gold = SERVER.CHATLIST[i].gold;
			}

			out.push(user);
		}
	}
	socket.emit("newChatList",out);
	if(SERVER.LEADER){
		SERVER.LEADER.get('nick', function (err, nick) {
			if(nick == null) nick = "anonymous";
			io.sockets.emit("leaderIs",{nick:nick});
		});
	}
}
function sendUserJoin(user){
	io.sockets.each(function(socket){
		socket.get('type', function(err, type){
			var data={nick:user.nick, type:user.type};
			if(parseInt(type)>=1){
				data.meta = user.meta;
				data.shadowbanned = user.shadowbanned;
				data.tempshadowbanned = user.tempshadowbanned;
			}
			if(user.gold)
				data.gold = true;

			socket.emit('userJoin',data);
		});
	});
}
function sendUserPart(socket,callback){
	socket.get('nick', function (err, nick) {
		if(nick == null) return false;
		io.sockets.emit("userPart",{
			nick:nick
		});
	});
}
function getCommand(msg){
	var re = new RegExp("^/([a-zA-Z]*)([-0-9]*)\\s*(.*)","i");
	var parsed = { msg: msg, command: false, multi: 1 };
	if(ret = msg.match(re)){
		parsed.command = ret[1].toLowerCase();
		parsed.multi = ret[2] || 1;
		parsed.msg = ret[3];
	}

	return parsed;
}
function handleNewVideoChange() {
	DefaultLog.info(events.EVENT_VIDEO_CHANGE,
		"changed video to {videoTitle}",
		{ videoTitle: decodeURI(SERVER.ACTIVE.videotitle) });

	resetDrinks();
	resetTime();
	// Is this a livestream? if so, stop ticking.
	if(SERVER.ACTIVE.videolength == 0) {
		SERVER.LIVE_MODE = true;
	} else {
		SERVER.STATE=1; // Play.
		SERVER.LIVE_MODE = false;
	}
}
function sendConnectedUsers(mod){
	if(typeof mod == "undefined" || mod == null) mod = 0;
	io.sockets.emit("numConnected",{
		num:(io.sockets.clients().length + mod)
	});
}
function sendDrinks(socket){
	socket.emit("drinkCount",{
		drinks:SERVER.DRINKS
	});
}
function resetDrinks(){
	SERVER.DRINKS=0;
	sendDrinks(io.sockets);
}
function resetTime(){
	SERVER.TIME=(0-SERVER.settings.vc.head_time);
}
function addDrink(amt,socket,callback){
	SERVER.DRINKS = (parseInt(SERVER.DRINKS)||0) + parseInt(amt);
	if(Math.abs(SERVER.DRINKS) > 1000000){
		SERVER.DRINKS = "lol go fuck yourself";
		kickUser(socket,"Berry Punch is mad at you");
	}
	if(callback)callback();
}
function randomPoni(){
	return SERVER.ponts[Math.floor(Math.random()*SERVER.ponts.length)];
}
function sendFilters(socket){
	socket.emit("recvFilters",SERVER.FILTERS);
}
function applyFilters(nick,msg,socket){
	var actionChain = [];
	try{
		for(var i=0;i<SERVER.FILTERS.length;i++){
			var d = SERVER.FILTERS[i];
			// Enabled?
			if(d.enable == false){
				continue;
			}

			// Sanity Check, kill rule on failure.
			try{
				var nickCheck = new RegExp(d.nickMatch,d.nickParam);
				var chatCheck = new RegExp(d.chatMatch,d.chatParam);
			} catch(e) {
				DefaultLog.error(events.EVENT_ADMIN_APPLY_FILTERS, "could not apply filter {filterId} to chat message", { filterId: i }, e)
				SERVER.FILTERS.splice(i, 1);
				continue;
			}

			if(nick.match(nickCheck)){
				if(msg.match(chatCheck)){
					// Perform Action
					actionChain.push({action:d.actionSelector,meta:d.actionMetadata});
				}
				if(d.chatReplace.trim().length > 0){
					msg = msg.replace(chatCheck,d.chatReplace);
				}
			}
		}
		for(var i=0;i<actionChain.length;i++){
			if(actionChain[i].action == "none") continue;
			if(actionChain[i].action == "kick"){
				kickIfUnderLevel(socket,actionChain[i].meta,1);
				continue;
			}
			if(actionChain[i].action == "hush"){
				msg = msg.toLowerCase();
				continue;
			}
		}
		return msg;
	} catch(e) {
		// The filters are fucked, somehow.
		DefaultLog.error(events.EVENT_ADMIN_APPLY_FILTERS, "could not apply filters to chat message", { }, e);
	}
	return msg;
}
function applyPluginFilters(msg,socket){
	if(getToggleable("bestponi")){
		//handle best pony.
		var re = new RegExp('^[a-zA-Z ]+is bes([st]) pon([tiye])(.*)','i');
		msg = msg.replace(re,randomPoni()+' is bes$1 pon$2$3');
	}

	if(getToggleable("wobniar")){
		//handle backwards text.
		var words = msg.split(" ");
		for(var i=0;i<words.length;i++){
			words[i] = words[i].split("").reverse().join("");
		}
		msg = words.join(" ");
	}

	return msg;
}
function forModminSockets(callback){
	io.sockets.each(function(sc){
		sc.get('type',function(err,type){
			if(parseInt(type) > 0){ // Mod though, so show anyway.
				callback(sc)
			}
		});
	});
}
function setVideoVolatile(socket,pos,isVolat){
	var elem = SERVER.PLAYLIST.first;
	for(var i=0;i<pos;i++){
		elem=elem.next;
	}
	elem.volat = isVolat;

	DefaultLog.info(events.EVENT_ADMIN_SET_VOLATILE,
		"{mod} set {title} to {status} on {type}",
		{ mod: getSocketName(socket), type: "playlist", title: decodeURIComponent(elem.videotitle), status: isVolat ? "volatile" : "not volatile" });

	io.sockets.emit("setVidVolatile",{
		pos:pos,
		volat:isVolat
	});
}
function setVideoColorTag(pos,tag,volat){
	var elem = SERVER.PLAYLIST.first;
	for(var i=0;i<pos;i++){
		elem=elem.next;
	}
	_setVideoColorTag(elem,pos,tag,volat);
}
function _setVideoColorTag(elem,pos,tag,volat){

	if(tag == false){
		delete elem.meta.colorTag;
	} else {
		elem.meta.colorTag = tag;
	}

	if(volat != true){
		delete elem.meta.colorTagVolat;
	} else {
		elem.meta.colorTagVolat = volat;
	}

	var sql = 'update '+SERVER.dbcon.video_table+' set meta = ? where videoid = ?';
	mysql.query(sql, [JSON.stringify(elem.meta), '' + elem.videoid], function(err) {
		if (err) {
			DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
			return;
		}
	});
	io.sockets.emit("setVidColorTag",{
		pos:pos,
		tag:tag,
		volat:volat
	});
}

/* ================= */
function emitChat(socket,data,ghost){
	if(socket)socket.emit("chatMsg",{msg:data,ghost:ghost});
}
function sendChat(nick,type,incoming,socket){
	// before we do anything else, lets check how long since the last time he spoke.
	handleSpamChecks({
		nick:nick, // Who is talking
		type:type, // Userlevel
		incoming:incoming, // msg,metadata
		socket:socket,
		callback: _sendChat
	});
}
function _sendChat(nick,type,incoming,socket){
	//Sanitize.
	var msg = sanitize(incoming.msg);
	if(typeof(msg) == "undefined"){
		msg = "I'm a lazy hacker";
	}
	var metadata = incoming.metadata;

	var data = false;
	var timestamp = new Date().toUTCString();

	var target = io.sockets;
	var sendToAdmins = false;
	var channel = metadata.channel || 'main';

	if(channel != 'main'){
		// Someone trying to send a message to a channel they're not in?!
		// Also, let server send messages to admin chat.
		if(type < 2 && io.sockets.manager.roomClients[socket.id]['/'+channel] !== true){
			return;
		}
		target=null;
		sendToAdmins = true;
	}

	if(isUserShadowBanned(socket)) { // handle major shadowbans
		sendToAdmins = true;
		target = socket;
	}

	if(getToggleable("mutegray")){ // Mute grays?
		if(type < 0){
			target = socket;
			emitChat(target,{
				nick:"server",
				emote:"server",
				metadata:metadata,
				msg:"Unregistered users are not currently allowed to chat. Sorry!",
				timestamp: timestamp
			},false);
			target = null;
			metadata.graymute = true;
			sendToAdmins = true;
		}
	}

	// Apply any filters.
	msg = applyFilters(nick,msg,socket);

	// Set default data.
	var sendMessage = true;
	var parsed = getCommand(msg);
	data = {
		emote:false,
		nick:nick,
		type:type,
		msg:applyPluginFilters(parsed.msg,socket),
		metadata:metadata,
		multi:parsed.multi,
		timestamp: timestamp
	}

	// slash-command map.
	var action_map = {
		act:["me"],
		sweetiebot:["sb"],
		rcv:["rcv","shout","yell","announcement","rvc"],
		request:["r","request","requests","req"],
		spoiler:["spoiler","sp","spoilers"],
		drink:["drink","d"],
		kick:["kick","k"],
		shitpost:["shitpost"]
	}

	// Handle Actions
	if(action_map.act.indexOf(parsed.command) >= 0){data.emote = "act";}
	if(action_map.request.indexOf(parsed.command) >= 0){data.emote = "request";}
	if(action_map.sweetiebot.indexOf(parsed.command) >= 0){data.emote = "sweetiebot";}
	if(action_map.spoiler.indexOf(parsed.command) >= 0){data.emote = "spoiler";}
	if(action_map.rcv.indexOf(parsed.command) >= 0){
		ifCanAnnounce(socket,function(){
			data.emote = "rcv";
			data.msg = parsed.msg; // Specifically not using the fun bits here.
		});
	}
	if(action_map.drink.indexOf(parsed.command) >= 0){
		ifCanCallDrinks(socket,function(){
			data.emote = "drink";
			if(channel == "main") {
				addDrink(parsed.multi,socket,function(){
					sendDrinks(io.sockets);
				});
			}
		});
	}
	if(action_map.kick.indexOf(parsed.command) >= 0){
		ifCanKickUser(socket,function(){
			const parts = parsed.msg.split(' ');
			if (parts[0]) {
				kickUserByNick(socket, parts[0], parts.slice(1).join(' ') || undefined);
			}
		},function(){
			kickForIllegalActivity(socket);
		});
		return;
	}
	if(action_map.shitpost.indexOf(parsed.command) >= 0){
		ifCanShitpost(socket,function(){
			const parts = parsed.msg.split(' ');
			if (parts[0]) {
				DefaultLog.info(events.EVENT_ADMIN_SHATPOST,
					"{mod} shatpost {title} on {type}",
					{ mod: nick,  type: "site", title: parts[0] });

				io.sockets.emit('shitpost', {
					msg: parsed.msg
				});
			}
		},function(){
			kickForIllegalActivity(socket);
		});
		return;
	}

	var bufferMessage = false; if(data) bufferMessage = true;
	bufferMessage = (!isUserShadowBanned(socket)) && bufferMessage;
	bufferMessage = (!metadata.graymute) && bufferMessage;

	if(sendMessage){

		if(isUserShadowBanned(socket)){
			io.sockets.each(function(sc){
				if(getAddress(sc) == getAddress(socket)){
					emitChat(sc,data,false);
				}
			});
		} else {
			if(target)emitChat(target,data,false);
		}

		if(sendToAdmins){
			forModminSockets(function(sc){
				emitChat(sc,data,false);
			});
		}
		//if(sendToAdmins)emitChat(io.sockets.in('admin'),data,false);

		if(bufferMessage){
			if(!SERVER.OUTBUFFER[channel]) { SERVER.OUTBUFFER[channel] = [] }
				SERVER.OUTBUFFER[channel].push(data);
			if(SERVER.OUTBUFFER[channel].length > SERVER.settings.core.max_saved_buffer)
				SERVER.OUTBUFFER[channel].shift();
		}
	}

	//
}
function handleSpamChecks(x){
	x.socket.get("lastmsg",function(err,lasttime){
		x.socket.get("chathp",function(err,hp){
			if(typeof lasttime == "undefined" || lasttime == null){	lasttime = new Date().getTime() - SERVER.settings.core.spamhp; }
			if(typeof hp == "undefined" || hp == null){ hp = SERVER.settings.core.spamhp; }
			var nowtime = new Date().getTime();
			var dTime = nowtime - lasttime;
			var dHp = dTime - SERVER.settings.core.spamcompare
			hp = Math.min(hp + dHp,SERVER.settings.core.spamhp); // apply damage/healing.
			if(hp < 0){
				kickIfUnderLevel(x.socket,"Spamming",1);
			} else {
				x.callback(x.nick,x.type,x.incoming,x.socket);
				x.socket.set("chathp",hp);
				x.socket.set("lastmsg",nowtime);
			}
		});
	});
}

/* ================= */
function setOverrideCss(path){
	upsertMisc({name:"overrideCss", value:path}, function(){
			io.sockets.emit("overrideCss",path);
	});
}
function sendCovertData(socket, type){
	sendChatList(socket, type);
	sendToggleables(socket);
	for(var i in SERVER.OUTBUFFER['admin'])	{
		emitChat(socket,SERVER.OUTBUFFER['admin'][i],true);
	}
	for(var i in SERVER.OUTBUFFER['adminLog'])	{
		var data = SERVER.OUTBUFFER['adminLog'][i];
		data.ghost = true;
		socket.emit('adminLog', data);
	}
}
function setToggleable(socket, name,state,callback){
	if(typeof SERVER.settings.toggles[name] == "undefined"){
		callback(`Toggleable ${name} not found`);
	   	return;
	}
	if (typeof state == "undefined") {
	   state = !SERVER.settings.toggles[name][0];
	}

	SERVER.settings.toggles[name][0] = state;

	if (callback)
		callback(null, {
			name: name,
			state: state
		});
}
function getToggleable(name) {
	if(typeof SERVER.settings.toggles[name] == "undefined") {
		DefaultLog.error(events.EVENT_GENERAL, "No such toggleable {name} found", { name })
		return false;
	}

	return SERVER.settings.toggles[name][0];
}
function sendToggleables(socket){
	var data = {};
	for(var key in SERVER.settings.toggles) {
		if(SERVER.settings.toggles.hasOwnProperty(key)) {
			data[key] = {};
			data[key].label = SERVER.settings.toggles[key][1];
			data[key].state = SERVER.settings.toggles[key][0];
		}
	}
	socket.emit("setToggleables",data);
}
function getSocketOfNick(targetnick,truecallback,falsecallback){
	targetnick = targetnick && targetnick.toLowerCase();
	cl = io.sockets.clients();
	for(var i=0;i<cl.length;i++){
		(function(i){
			cl[i].get("nick",function(err,nick){
				if(nick && nick.toLowerCase() == targetnick){
					if(truecallback)truecallback(cl[i]);
				}
			});
			if(i == cl.length-1){
				if(falsecallback)falsecallback();
			}
		})(i);
	}
}

function delVideo(data, socket){
	elem = SERVER.PLAYLIST.first;
	for(var i=0;i<SERVER.PLAYLIST.length;i++)
	{
		if(i == data.index)
		{
			if(data.sanityid && elem.videoid != data.sanityid) return doorStuck(socket);

			if(elem.deleted) break;
			if(elem == SERVER.ACTIVE) playNext();

			try{
				SERVER.PLAYLIST.remove(elem);
				io.sockets.emit('delVideo',{
					position:i,
					sanityid:elem.videoid
				});
				var q = 'delete from '+SERVER.dbcon.video_table+' where videoid = ? limit 1';
				var historyQuery = "";
				var historyQueryParams;

				const isLivestream = elem.videolength <= 0
				const shouldArchive = !isLivestream

				if (shouldArchive) {
					historyQuery = "insert into videos_history (videoid, videotitle, videolength, videotype, date_added, meta) values (?,?,?,?,NOW(),?)";
					historyQueryParams = [
						'' + elem.videoid,
						elem.videotitle,
						elem.videolength,
						elem.videotype,
						JSON.stringify(elem.meta || {})
					];
				}

				mysql.query(q, ['' + elem.videoid], function(err) {
					if (err) {
						DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql: q }, err);
						return;
					}
					if(historyQuery){
						mysql.query(historyQuery, historyQueryParams, function(err) {
							if (err) {
								DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql: historyQuery }, err);
								return;
							}
						});
					}
				});

				elem.deleted = true;

				DefaultLog.info(events.EVENT_ADMIN_DELETED_VIDEO,
					"{mod} deleted {title} on {type}",
					{ mod: getSocketName(socket), type: "playlist", title: decodeURIComponent(elem.videotitle) });

				break;
			} catch(e) {
				DefaultLog.error(events.EVENT_ADMIN_DELETED_VIDEO,
					"{mod} could not delete {title} on {type}",
					{ mod: getSocketName(socket),  type: "playlist", title: decodeURIComponent(elem.videotitle) }, e);
			}
		}
		try{
			if(typeof elem != "undefined" && elem != null){
				elem=elem.next;
			} else {
				break;
			}
		} catch(e) {
			DefaultLog.error(events.EVENT_ADMIN_DELETED_VIDEO,
				"{mod} could not delete {index} on {type}",
				{ mod: getSocketName(socket), type: "playlist", index: data.index}, e);

			break;
		}
	}
}
function rawAddVideo(d,successCallback,failureCallback){

	// Check for any existing metadata
	var sql = 'select meta from videos_history where videoid = ?';
	mysql.query(sql, ['' + d.videoid], function(err, result) {
		if (err) {
			DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
			return;
		}

		if(result.length == 1){
			try{
				d.meta = JSON.parse(result[0].meta);
			}catch(e){}
		}
		var sql = 'delete from videos_history where videoid = ?';
		mysql.query(sql, ['' + d.videoid], function(err) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
				return;
			}
		});
		if(!('meta' in d) || d.meta == null){d.meta = {};}
		if(!('addedon' in d.meta)){d.meta.addedon = new Date().getTime();}
		sql = `insert into ${SERVER.dbcon.video_table} (position, videoid, videotitle, videolength, videotype, videovia, meta) VALUES (?,?,?,?,?,?,?)`;
		var qParams = [ d.pos,
						'' + d.videoid,
						d.videotitle,
						d.videolength,
						d.videotype,
						d.who,
						JSON.stringify(d.meta || {})
					  ];
		mysql.query(sql, qParams, function(err) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
				if(failureCallback)failureCallback(err);
			}else{

				var o = new Video();
				o.videoid = d.videoid;
				o.videolength = parseInt(d.videolength);
				o.videotype = d.videotype;
				o.volat = d.volat;
				o.meta = d.meta || {};
				if(d.videolength > SERVER.settings.core.auto_volatile){
					o.volat = true;
				}
				o.videotitle = d.videotitle;

				if(d.queue) // If we're queueing the video, instead of simply adding it...
				{
					if(SERVER.PLAYLIST.length == 0){
						SERVER.PLAYLIST.append(o);
					}else{
						SERVER.PLAYLIST.insertAfter(SERVER.ACTIVE,o);
					}

					io.sockets.emit('addVideo',{
						queue:true,
						video:o.pack(),
						sanityid:SERVER.ACTIVE.videoid
					});
				}else{
					if(SERVER.PLAYLIST.length == 0){
						SERVER.PLAYLIST.append(o);
					}else{
						SERVER.PLAYLIST.insertAfter(SERVER.PLAYLIST.last,o);
					}

					io.sockets.emit('addVideo',{
						queue:false,
						video:o.pack(),
						sanityid:SERVER.ACTIVE.videoid
					});
				}

				if(successCallback)successCallback();
			}
		});

	});

}


function addLiveVideo(data,meta,successCallback,failureCallback){
	data.videotitle = data.videotitle.replace(/[^0-9a-zA-Z_ \-~:]/g, "");
	if (!data.videotype.match(/^[a-z]{1,10}$/)) {
		failureCallback(new Error(`Videotype wasn't lowercase alpha or was too long: ${data.videotype}`));
		return;
	}

	var pos = SERVER.PLAYLIST.length;
	var videoid = data.videoid.trim();
	var volat = true;
	rawAddVideo({
		pos:pos,
		videoid:videoid,
		videotitle:data.videotitle,
		videolength:0,
		videotype:data.videotype,
		who:meta.nick,
		queue:data.queue,
		volat:volat
	},function(){
		if(successCallback)successCallback({ title: data.videotitle });
	},function(err){
		if(failureCallback)failureCallback(err);
	})
}
function addVideoVimeo(socket,data,meta,successCallback,failureCallback){
	var videoid = data.videoid.trim().replace('/', '');
	var publicPath = '/api/v2/video/' + videoid.toString() + ".json";
	var embedCallback = function(){
		var embedPath = '/api/oembed.json?url=http%3A//vimeo.com/' + videoid.toString();
		_addVideoVimeo(socket,data,meta,embedPath,successCallback,failureCallback);
	};
	_addVideoVimeo(socket,data,meta,publicPath,successCallback,embedCallback);
}
function _addVideoVimeo(socket,data,meta,path,successCallback,failureCallback) {
	var pos = SERVER.PLAYLIST.length;
	var volat = data.volat;
	var jdata;
	if(meta.type <= 0) volat = true;
	if(volat === undefined) volat = false;

	var options = {
		host: 'vimeo.com',
		port: 80,
		method: 'GET',
		path: path
	};
	var recievedBody = "";
	var req = http.request(options, function (res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			recievedBody += chunk;
		});
		res.on('end', function () {
			try {
				jdata = JSON.parse(recievedBody);
				if(util.isArray(jdata)) jdata = jdata[0];
			}
			catch (err) {
				//json parse failure because the failure message from vimeo is a string. ex: 61966249 not found.
				if (failureCallback)failureCallback(err);
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
				if (successCallback)successCallback({ title: jdata.title });
			}, function (err) {
				if (failureCallback)failureCallback(err);
			});
		});
	});
	req.on('error', function (e) {
		if (failureCallback)
			failureCallback(e);
	});
	req.end();
}

function resolveRestrictCountries(restrictReasons) {
	if (restrictReasons.countries) {
		if (!Array.isArray(restrictReasons.countries)) {
			restrictReasons.countries = restrictReasons.countries.split(/\s+/);
		}
		restrictReasons.countryNames = restrictReasons.countries.map(code => isoCountries.getName(code, 'en'));
	}
}

function addVideoYT(socket,data,meta,successCallback,failureCallback){
	var videoid = data.videoid.trim();
	if(videoid.length==0)
	{
		if (failureCallback)
			failureCallback("no title specified");
		return;
	}
	//https://www.googleapis.com/youtube/v3/videos?id=QIFn0wqZx7Y&key=AIzaSyBBM2fo32Pzrcf0GHO5LnEHxjYd1T1li-Q&part=snippet%2CcontentDetails
	var options = {
		host: 'www.googleapis.com',
		port: 443,
		method: 'GET',
		path: '/youtube/v3/videos?id='+encodeURIComponent(videoid.toString())+'&key=AIzaSyBBM2fo32Pzrcf0GHO5LnEHxjYd1T1li-Q&part=snippet%2CcontentDetails%2Cstatus'
	};

	var parseDuration = function(duration){
		var matches = duration.match(/[0-9]+[DHMS]/g);
		var seconds = 0;
		matches.forEach(function (part) {
			var unit = part.charAt(part.length-1);
			var amount = parseInt(part.slice(0,-1));
			switch (unit) {
				case 'D':
					seconds += amount*60*60*12;
					break;
				case 'H':
					seconds += amount*60*60;
					break;
				case 'M':
					seconds += amount*60;
					break;
				case 'S':
					seconds += amount;
					break;
				default:
					// noop
			}
		});

		return seconds;
	}

	var recievedBody = "";
	var maybeError = null

	var req = https.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			recievedBody += chunk;
		});

		res.on('end', function(){ //7zLNB9z_AI4
			try {
				var vidObj = JSON.parse(recievedBody);
			} catch (e) {
				maybeError = e;
				return;
			}

			if(vidObj && vidObj.items && vidObj.items.length > 0){
				vidObj = vidObj.items[0];
			} else {
				maybeError = "bad json response";
				return;
			}

			var formattedTitle = "Cades fucked it up";
			var formattedTime = "fucked";
			var restricted = [];
			var embeddable = true;

			if(
				vidObj &&
				vidObj.snippet &&
				vidObj.snippet.title
			) formattedTitle = vidObj.snippet.title;

			if(
				vidObj &&
				vidObj.contentDetails &&
				vidObj.contentDetails.duration
			) formattedTime = parseDuration(vidObj.contentDetails.duration);

			if(
				vidObj &&
				vidObj.status
			) embeddable = !!vidObj.status.embeddable;

			var restrictReasons = {};

			if(!data.force &&
				vidObj.contentDetails.regionRestriction &&
				(vidObj.contentDetails.regionRestriction.allowed || vidObj.contentDetails.regionRestriction.blocked)){
				// Country restrctions
				var countryRestriction = vidObj.contentDetails.regionRestriction.blocked;
				var countryAllow = vidObj.contentDetails.regionRestriction.allowed;

				if(countryRestriction) {
					var ignored = SERVER.settings.core.country_restriction_ignored;
					for(var i=0;i<ignored.length;++i){
						var idx = countryRestriction.indexOf(ignored[i]);
						if(idx > -1) {
							countryRestriction.splice(idx, 1);
						}
					}
					if(countryRestriction.length > 0){
						restrictReasons.countries = countryRestriction[1];
						maybeError = "video has country restrictions"
					}
				}
				if(countryAllow) {
					var required = SERVER.settings.core.country_allow_required || ['GB', 'CA', 'US'];
					for(var i=0;i<required.length;++i) {
						if(countryAllow.indexOf(required[i]) <= -1) {
							restricted.push(required[i]);
						}
					}
					if(restricted.length > 0){
						restrictReasons.countries = restricted;
						maybeError = "video has country restrictions"
					}
				}
				if(!embeddable) {
					restrictReasons.noembed = true;
					maybeError = "video cannot be embedded"
				}
			}

			for(var hasProperties in restrictReasons) break;
			if(hasProperties) {
				resolveRestrictCountries(restrictReasons);
				socket.emit("videoRestriction", restrictReasons);
			}

			var pos = SERVER.PLAYLIST.length;

			if (!maybeError) {
				var volat = data.volat;
				if(meta.type <= 0) volat = true;
				if(volat === undefined) volat = false;

				rawAddVideo({
					pos:pos,
					videoid:videoid,
					videotitle:encodeURI(formattedTitle),
					videolength:formattedTime,
					videotype:"yt",
					who:meta.nick,
					queue:data.queue,
					volat:volat
				},function(){
					if(successCallback)successCallback({ title: formattedTitle });
				},function(err){
					if(failureCallback)
						failureCallback(err);
				})
			}else{
				if (failureCallback)
					failureCallback(maybeError);
			}
		});
	});

	req.on('error', function(e) {
		if(failureCallback)failureCallback(e);
	});

	req.end();
}

function followRedirect(options, successCallback,failureCallback){
	http.get(options, function (res) {
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
			http.get(options, successCallback)
			.on('error', function(e){
				if (failureCallback)
					failureCallback(e);
			});

		// Otherwise no redirect; capture the response as normal
		} else if(res.statusCode == 200) {
			successCallback(res);
		} else {
			if(failureCallback)
				failureCallback();
		}
	}).on('error', function(e) {
		if (failureCallback)
			failureCallback(e);
	});
}

function addVideoSoundCloud(socket,data,meta,successCallback,failureCallback){
	var videoid = data.videoid.trim();
	var path;
	if(videoid.length==0)
	{
		if(failureCallback)failureCallback();
		return;
	}
	//http://api.soundcloud.com/resolve.json?url=
	// &client_id=98e8581d9fc8d2dbb59cb5a785201ffd
	if(videoid.substring(0,2) == "SC") {
		path = '/tracks/'+encodeURIComponent(videoid.substring(2))+'.json?client_id=98e8581d9fc8d2dbb59cb5a785201ffd';
	} else {
		path = '/resolve.json?url='+encodeURIComponent(videoid)+'&client_id=98e8581d9fc8d2dbb59cb5a785201ffd';
	}
	var options = {
		host: 'api.soundcloud.com',
		port: 80,
		method: 'GET',
		path: path
	};
	var recievedBody = "";
	followRedirect(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			recievedBody += chunk;
		});
		res.on('end', function(){
			try {
				jdata = JSON.parse(recievedBody);
			}
			catch (err) {
				if (failureCallback)failureCallback(err);
				return;
			}

			var volat = data.volat;
			if(meta.type <= 0) volat = true;
			if(volat === undefined) volat = false;
			rawAddVideo({
				pos: SERVER.PLAYLIST.length,
				// Don't collide with vimeo
				videoid: 'SC'+jdata.id,
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
				if (successCallback)successCallback({ title: jdata.user.username + " - " + jdata.title });
			}, function (err) {
				if (failureCallback)failureCallback(err);
			});
		});
	}, failureCallback);
}

function addVideoFile(socket,data,meta,successCallback,failureCallback){
	var videoid = data.videoid.trim();
	if(videoid.length==0)
	{
		failureCallback();
		return;
	}
	getDuration(videoid).then(duration => {
		duration = Math.ceil(duration || 0);
		if (duration <= 0) {
			failureCallback('no duration');
			return;
		}

		var volat = data.volat;
		if(meta.type <= 0) volat = true;
		if(volat === undefined) volat = false;
		const parts = videoid.split('/');
		rawAddVideo({
			pos: SERVER.PLAYLIST.length,
			videoid: videoid,
			videotitle: parts[parts.length-1],
			videolength: duration,
			videotype: "file",
			who: meta.nick,
			queue: data.queue,
			volat: volat
		}, function () {
			if (successCallback)successCallback({ title: parts[parts.length-1] });
		}, function (err) {
			if (failureCallback)failureCallback(err);
		});
	}).catch(err => {
		failureCallback(err);
	});
}

function addVideoDash(socket,data,meta,successCallback,failureCallback){
	var videoid = data.videoid.trim();
	if (videoid.length == 0)
	{
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
			if(meta.type <= 0) volat = true;
			if(volat === undefined) volat = false;
			const parts = videoid.split('/');
			const videoTitle = data.videotitle ? encodeURI(data.videotitle) : parts[parts.length-1];
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
				if (successCallback)successCallback({ title: videoTitle });
			}, function (err) {
				if (failureCallback)failureCallback(err);
			});
		}).catch(err => {
			failureCallback(err);
		});
}

async function twitchApi(path, params={}) {
    if (Array.isArray(path)) {
        path = path.join('/');
    }
    params = Object.keys(params)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
		.join('&');

	const response = await fetch('https://api.twitch.tv/kraken/' + path + (params ? ('?' + params) : ''), {
        headers: {
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Client-ID': '16m5lm4sc21blhrrpyorpy4tco0pa9'
        }
    })

	if (!response.ok) {
		const data = await response.json()
		throw new Error(`${data.error}: ${data.message}`)
	}

	return response.json();
}

function addVideoTwitch(socket,data,meta,successCallback,failureCallback){
	var volat = data.volat;
	if(meta.type <= 0) volat = true;
	if(volat === undefined) volat = false;

	const parts = data.videoid.trim().split('/');
	if (parts[0] === 'videos') {
		twitchApi(['videos', parts[1]]).then(response => {
			let videoid = response._id;
			if (videoid[0] === 'v') {
				videoid = videoid.substr(1);
			}

			rawAddVideo({
				pos: SERVER.PLAYLIST.length,
				videoid: 'videos/' + videoid,
				videotitle: encodeURI(response.title),
				videolength: Math.ceil(response.length),
				videotype: "twitch",
				who: meta.nick,
				queue: data.queue,
				volat: volat
			}, function () {
				if (successCallback)successCallback({ title: response.title });
			}, function (err) {
				if (failureCallback)failureCallback(err);
			});
		}).catch(error => {
			if (failureCallback) failureCallback(error);
		});
	} else {
		twitchApi(['search', 'channels'], {query: parts[0], limit: 1}).then(response => {
			response = response && response.channels && response.channels[0];
			if (!response) {
				if (failureCallback)failureCallback('no such channel');
				return;
			}

			rawAddVideo({
				pos: SERVER.PLAYLIST.length,
				videoid: response.name,
				videotitle: encodeURI(response.display_name),
				videolength: 0,
				videotype: "twitch",
				who: meta.nick,
				queue: data.queue,
				volat: volat
			}, function () {
				if (successCallback)successCallback({ title: response.display_name });
			}, function (err) {
				if (failureCallback)failureCallback(err);
			});
		}).catch(error => {
			if (failureCallback) failureCallback(error);
		});
	}
}

function addVideoTwitchClip(socket,data,meta,successCallback,failureCallback){
	var volat = data.volat;
	if(meta.type <= 0) volat = true;
	if(volat === undefined) volat = false;

	twitchApi(['clips', data.videoid]).then(response => {
		rawAddVideo({
			pos: SERVER.PLAYLIST.length,
			videoid: response.slug,
			videotitle: encodeURI(response.title),
			videolength: Math.ceil(response.duration),
			videotype: "twitchclip",
			who: meta.nick,
			queue: data.queue,
			volat: volat
		}, function () {
			if (successCallback)successCallback({ title: response.title });
		}, function (err) {
			if (failureCallback)failureCallback(err);
		});
	}).catch(error => {
		if (failureCallback) failureCallback(error);
	});
}

function ifCanSetFilters(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(
			parseInt(type) >= 2
		){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifCanGild(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(
			parseInt(type) >= 2
		){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifCanGetFilters(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(
			parseInt(type) >= 2
		){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifCanSearchHistory(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(
			parseInt(type) >= 1
		){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifCanAnnounce(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		socket.get('nick',function(err,nick){
			if(
				isLeader(socket) ||
				parseInt(type) > 0
			){
				if(truecallback)truecallback({nick:nick});
			}else{
				if(falsecallback)falsecallback({nick:nick});
			}
		});
	});
}
function ifCanControlVideo(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(
			isLeader(socket)
		){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifCanControlPlaylist(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		socket.get('nick',function(err,nick){
			if(
				isLeader(socket) ||
				parseInt(type) > 0
			){
				if(truecallback)truecallback({nick:nick,type:parseInt(type)});
			}else{
				if(falsecallback)falsecallback({nick:nick,type:parseInt(type)});
			}
		});
	});
}
function ifCanDeleteVideo(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		socket.get('nick',function(err,nick){
			if(
				parseInt(type) > 0
			){
				if(truecallback)truecallback({nick:nick,type:parseInt(type)});
			}else{
				if(falsecallback)falsecallback({nick:nick,type:parseInt(type)});
			}
		});
	});
}
function ifCanRandomizeList(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		socket.get('nick',function(err,nick){
			if(
				parseInt(type) > 0
			){
				if(truecallback)truecallback({nick:nick,type:parseInt(type)});
			}else{
				if(falsecallback)falsecallback({nick:nick,type:parseInt(type)});
			}
		});
	});
}
function ifCanSetVideoVolatile(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		socket.get('nick',function(err,nick){
			if(
				parseInt(type) > 0
			){
				if(truecallback)truecallback({nick:nick,type:parseInt(type)});
			}else{
				if(falsecallback)falsecallback({nick:nick,type:parseInt(type)});
			}
		});
	});
}
function ifCanSetUserNote(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		socket.get('nick',function(err,nick){
			if(
				parseInt(type) > 0
			){
				if(truecallback)truecallback({nick:nick,type:parseInt(type)});
			}else{
				if(falsecallback)falsecallback({nick:nick,type:parseInt(type)});
			}
		});
	});
}
function ifCanChat(socket,truecallback,falsecallback){
	socket.get('nick', function (err, nick){
		socket.get('type',function(err,type){
			if(nick == null)
			{
				if(falsecallback)falsecallback();
			}
			else
			{
				var meta = {
					nick:nick,
					type:type
				};
				if(truecallback)truecallback(meta);
			}
		});
	});
}
function ifChatMsgIsOk(socket,data,truecallback,falsecallback){
	if("msg" in data){
		if(data.msg.length > SERVER.settings.core.max_chat_size){
			if(falsecallback)falsecallback();
		} else {
			truecallback();
		}
	} else {
		if(falsecallback)falsecallback();
	}
}

function ifCanCallDrinks(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(
			isLeader(socket) ||
			parseInt(type) > 0
		){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifCanMoveBerry(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(
			parseInt(type) > 0
		){
			if(truecallback)truecallback(true);
		}else if(
			isLeader(socket)
		){
			if(truecallback)truecallback(false);
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifCanShadowBan(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(parseInt(type) >= 2){
			if(truecallback)truecallback(false);
		} else if(parseInt(type) >= 2){
			if(truecallback)truecallback(true);
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifCanBan(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(parseInt(type) >= 2){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifCanSetOverrideCss(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(
			parseInt(type) >= 2
		){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifCanForceRefresh(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(parseInt(type) >= 2){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifCanDebugDump(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(parseInt(type) >= 2){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifNickFree(nick,truecallback,falsecallback){
	nick = nick && nick.toLowerCase();
	for(var i in SERVER.CHATLIST){
		if(SERVER.CHATLIST[i].nick.toLowerCase() == nick){
			if(falsecallback)falsecallback();
			return;
		}
	}
	truecallback();
}
function ifCanKickUser(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(
			parseInt(type) > 1
		){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifCanShitpost(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(
			parseInt(type) >= 2
		){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifCanSetAreas(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(
			parseInt(type) >= 2
		){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function ifCanSetToggleables(socket,truecallback,falsecallback){
	socket.get('type',function(err,type){
		if(
			parseInt(type) >= 2
		){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
	});
}
function userLogin(socket,data,truecallback,falsecallback){
	if(!ifCanLogin(socket)) {
		if(falsecallback)
			falsecallback("Too many failed logins for user");

		socket.emit("loginError", {message:"Too many failed login attempts. Try again later."});
		return;
	}
	var qnick = data.nick;
	var qpass = data.pass ? crypto.createHash('md5').update(data.pass).digest("hex") : null;
	if(typeof(qnick) == "undefined"){ return; }

	// do a cursory bancheck
	var bancheck = { ips:[getAddress(socket)], nicks:[qnick] };
	var existing = isUserBanned(bancheck);
	if(existing){
		bancheck.duration = existing.duration;
		banUser(bancheck);
		kickUser(socket, "You have been banned.");
	}

	if(
		qnick.match(/^[0-9a-zA-Z_]+$/) != null &&
		qnick.length >= 1  &&
		qnick.length <= 15
	){
		var sql = 'select * from users where name = ?';
		mysql.query(sql, [qnick], function(err, result, fields) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
				return;
			}
			var ip = getAddress(socket);
			if(!ip){
				if(falsecallback) falsecallback("No ip address for user");
				return false;
			}

			// If nobody has already registered the name...
			if(result.length == 0) {
				if (SERVER.nick_blacklist.has(qnick.toLowerCase())) {
					handleLoginFail(socket);
					if(falsecallback) falsecallback("Username blacklisted");
					return;
				}
				addUserToChat(socket, {nick:qnick,type:-1, meta:{}},truecallback);
			} else if(result.length == 1) {
				// Fix case
				qnick = result[0].name;
				function onPasswordValid(){
					if(result[0].type >= 1){
						// Send admin-only detals.
						socket.join('admin');
						sendToggleables(io.sockets);
						sendCovertData(socket, result[0].type);
					}
					var meta = {};
					try {
						if(result[0].meta)
							meta = JSON.parse(result[0].meta) || {};
					} catch(e){
						DefaultLog.error(events.EVENT_GENERAL, "Failed to parse user meta for {nick}", { nick: name }, e)
						meta = {};
					}

					addUserToChat(socket, { nick: qnick, type: result[0].type, meta: meta }, truecallback);
				}
				if (result[0].pass == qpass) {
					bcrypt.hash(data.pass, SERVER.settings.core.bcrypt_rounds, function(err, hash){
						if (err) {
							DefaultLog.error(events.EVENT_GENERAL, "Failed to bcrypt for {nick}'s password", { nick: name }, e)
							return;
						}

						var sql = 'UPDATE users SET pass = ? WHERE name = ?';
						mysql.query(sql, [hash, qnick], function(err){
							if (err) {
								DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
								return;
							}
						});
					});
					onPasswordValid();
				} else if (data.pass) {
					bcrypt.compare(data.pass, result[0].pass, function(err, matched){
						if (err) {
							DefaultLog.error(events.EVENT_GENERAL, "Failed to compare {nick}'s password", { nick: name }, e)
							return;
						}

						if (matched) {
							onPasswordValid();
						} else {
							// Don't allow people to spam login attempts
							handleLoginFail(socket);
							if (falsecallback)
								falsecallback("invalid password");
						}
					});
				} else {
					// Don't allow people to spam login attempts
					handleLoginFail(socket);
					if (falsecallback)
						falsecallback("no password provided");
				}
			} else {
				// Don't allow people to spam login attempts
				handleLoginFail(socket);
				if (falsecallback)
					falsecallback("multiple users found for the same nick!?");
			}
		});
	} else {
		if (falsecallback)
			falsecallback("illegal nick");
	}
}
function ifCanLogin(socket){
	var ip = getAddress(socket);
	if(!ip) return false;
	var now = new Date();
	var i = SERVER.FAILED_LOGINS.length;
	// Backwards so we can splice on the go
	while(--i >= 0) {
		if(now - SERVER.FAILED_LOGINS[i].time > SERVER.settings.core.login_fail_duration){
			SERVER.FAILED_LOGINS.splice(i, 1);
		}
		else if(SERVER.FAILED_LOGINS[i].ip == ip) {
			fail = SERVER.FAILED_LOGINS[i];
			if(fail.count > SERVER.settings.core.max_failed_logins) {
				return false;
			}
			return true;
		}
	}
	return true;
}
function handleLoginFail(socket){
	var ip = getAddress(socket);
	if(!ip) return false;
	var fail;
	for(var i = 0; i < SERVER.FAILED_LOGINS.length; ++i) {
		if(SERVER.FAILED_LOGINS[i].ip == ip) {
			fail = SERVER.FAILED_LOGINS[i];
			fail.count++;
			fail.time = new Date();
		}
	}
	if(!fail){
		fail = {
			count: 1,
			ip: ip,
			time: new Date()
		};
		SERVER.FAILED_LOGINS.push(fail);
	}
}
function isLeader(socket){
	return (SERVER.LEADER==socket);
}
function isTrackingTime(){
	if(SERVER.LIVE_MODE)
		return false;
	return true;
}
function ghostBustUser(socket, data, successCallback){
	if(!data.ghostBust) {
		successCallback();
		return;
	}
	var ip = getAddress(socket);
	if(!ip) {
		successCallback();
		return;
	}
	getSocketOfNickAndIP(data.nick, ip,
		function(socket) {
			kickUser(socket, "Ghosted", { ghosted: true });
			successCallback();
		},
		function() {
			successCallback();
		});
}
function getSocketOfNickAndIP(targetnick,targetip,truecallback,falsecallback){
	targetnick = targetnick && targetnick.toLowerCase();
	var found = false;
	for(var i=0;i<SERVER.IPLIST.length;i++){
		if(SERVER.IPLIST[i].ip == targetip){
			var theguy = SERVER.IPLIST[i];
			var left = theguy.sockets.length;
			for(var j=theguy.sockets.length-1;j>=0;j--){
				if(theguy.sockets[j].disconnected){
					theguy.sockets.splice(j,1);
					continue;
				}
				(function(j){
					theguy.sockets[j].get("nick",function(err,nick){
						left--;
						if(nick && nick.toLowerCase() == targetnick){
							found = true;
							if(truecallback)truecallback(theguy.sockets[j]);
						}
						else if(left == 0 && found == false){
							if(falsecallback)falsecallback();
						}
					});
				})(j);
			}
		}
	}
}

function numConnectionsByIP(socket,over,overcallback,elsecallback){
	var ip = getAddress(socket);
	if(!ip){
		if(overcallback) overcallback();
		return false;
	}
	var concount = 1;
	var theguy = false;
	for(var i=0;i<SERVER.IPLIST.length;i++){
		if(SERVER.IPLIST[i].ip == ip){
			// This is our guy.
			theguy = SERVER.IPLIST[i];
			// Backwards so splice doesn't mess the loop up
			for(var j=theguy.sockets.length-1;j>=0;j--){
				if(theguy.sockets[j].disconnected){
					theguy.sockets.splice(j,1);
					continue;
				}
				concount++;
			}
		}
	}
	if(concount>over){
		if(overcallback)overcallback();
	} else {
		if(theguy){
			theguy.sockets.push(socket);
		} else {
			SERVER.IPLIST.push({
				ip:ip,
				sockets:[socket]
			});
		}
		if(elsecallback)elsecallback();
	}
}
/* RUN ONCE INIT */
initPlaylist(function(){
	initResumePosition(function(){
		initTimer();
	});
});
initShadowbant();
initHardbant();
initFilters();
initAreas();
DefaultLog.info(events.EVENT_SERVER_STATUS, "server version {version} started up", { version: SERVER.settings.core.version });

io.configure(function (){
  io.set('authorization', function (handshakeData, callback) {

	if(isUserBanned({
		ips:[handshakeData.address.address],
		nicks:[]
	})){
		callback("BAN", false); // error first callback style
	}

	// OK
	callback(null, true); // error first callback style
  });
});

io.sockets.on('connection', function (socket) {
	// Check for any Autokick reasons
	// too many connections per IP?
	numConnectionsByIP(socket,SERVER.settings.core.max_connections_per_ip,function(){
		socket.disconnect();
	},function(){
		socket.set('mode',MODE_VIDEOCHAT);
		sendConnectedUsers();
		var ip = getAddress(socket);
		if(!ip) return false;
		DefaultLog.info(events.EVENT_SOCKET, "socket joined from ip {ip}, total users: {userCount}", { ip, userCount: io.sockets.clients().length });
		// Send the SERVER.PLAYLIST, and then the position.
		sendToggleables(socket);
		socket.emit("recvPlaylist",SERVER.PLAYLIST.toArray());
		sendChatList(socket);
		sendDrinks(socket);
		sendAreas(socket);
		for(var i in SERVER.OUTBUFFER['main'])	{
			emitChat(socket,SERVER.OUTBUFFER['main'][i],true);
		}

		// If we dont have a leader, then assign one.
		if(!SERVER.LEADER && !SERVER.BP_IS_LEADER) {
			reassignLeader(socket);
		}

		socket.on('disconnect', function () {
			sendConnectedUsers(-1);
			if(isLeader(socket))
			{
				setBpAsLeader();
			}

			rmUserFromChat(socket);
			DefaultLog.info(events.EVENT_USER_LEFT, "user left from ip {ip}, total users: {userCount}", { ip, userCount: io.sockets.clients().length - 1 });
		});
	});

	socket.on("setOverrideCss",function(data){
		ifCanSetOverrideCss(socket,function(){
			DefaultLog.info(events.EVENT_ADMIN_SET_CSS,
				"{mod} set css override to {css} on {type}",
				{ mod: getSocketName(socket), type: "site", css: data });

			setOverrideCss(data);
		},function(){
			kickForIllegalActivity(socket,"You cannot set the CSS");
		});
	});
	socket.on("setFilters",function(data){
		ifCanSetFilters(socket,function(){
			DefaultLog.info(events.EVENT_ADMIN_EDITED_FILTERS,
				"{mod} edited filters on {type}",
				{ mod: getSocketName(socket), type: "site" })

			SERVER.FILTERS = data;
		},function(){
			kickForIllegalActivity(socket,"You cannot set the Filters");
		});
	});
	socket.on("searchHistory", function(data){
		ifCanSearchHistory(socket, function(){
			var sql = "select * from videos_history where videotitle like ? order by date_added desc limit 50";
			mysql.query(sql, ['%'+encodeURI(data.search).replace('%', '\\%')+'%'], function(err, result, fields){
				if (err) {
					DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
					return;
				}
				for(var i=0;i<result.length;++i) {
					var o = result[i];
					try {
						o.meta = JSON.parse(o.meta);
						if(typeof o.meta != "object"){
							o.meta = {};
						}
					} catch(e) { o.meta={}; }
				}
				socket.emit('searchHistoryResults', result);
			});
		}, function(){
			socket.emit('searchHistoryResults', []);
		});
	});
	socket.on("delVideoHistory", function(data){
		const logData = { mod: getSocketName(socket), type: "playlist", id: data.videoid};

		if(!data.videoid.match(/^[a-zA-Z0-9_ \-#]{3,50}$/)){
			DefaultLog.error(events.EVENT_ADMIN_CLEARED_HISTORY, "{mod} could not delete history for invalid id {id} on {type}", logData);
			return;
		}

		var sql = 'delete from videos_history where videoid = ? limit 1';
		mysql.query(sql, [data.videoid], function(err) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
				DefaultLog.error(events.EVENT_ADMIN_CLEARED_HISTORY, "{mod} could not delete history for invalid id {id} on {type}", logData, err)
			} else {
				DefaultLog.info(events.EVENT_ADMIN_CLEARED_HISTORY, "{mod} deleted history for id {id} on {type}", logData, err)
			}
		});
	});
	socket.on("randomizeList",function(data){
		ifCanRandomizeList(socket,function(meta){
			DefaultLog.info(events.EVENT_ADMIN_RANDOMIZED_PLAYLIST,
				"{mod} randomized playlist on {type}",
				{ mod: getSocketName(socket), type: "playlist" }
			)

			var newSz = SERVER.PLAYLIST.length;
			var tmp = [];
			var elem = SERVER.PLAYLIST.first;
			for(var i=0;i<newSz;i++){
				tmp.push(elem);

				elem = elem.next;
			}
			for(var i=0;i<newSz;i++){
				var x = Math.floor(Math.random() * tmp.length);
				var newGuy = tmp[x];
				tmp.splice(x,1);
				SERVER.PLAYLIST.remove(newGuy);
				SERVER.PLAYLIST.append(newGuy);
			}
			io.sockets.emit("recvNewPlaylist",SERVER.PLAYLIST.toArray());
		},function(){
			//kickForIllegalActivity(socket,"You cannot randomize the SERVER.PLAYLIST.");
		});
	});
	socket.on('getFilters',function(){
		ifCanGetFilters(socket,function(){
			sendFilters(socket);
		},function(){
			kickForIllegalActivity(socket);
		});
	});
	socket.on('chatOnly',function(){
		socket.set('mode',MODE_CHATONLY);
	});
	socket.on('setToggleable',function(data){
		ifCanSetToggleables(socket,function(){
			tn = data.name;
			ts = data.state;
			setToggleable(socket, tn, ts, function(err) {
				const logData = { mod: getSocketName(socket), type: "site", name: tn, state: ts ? "on" : "off" };

				if (err) {
					DefaultLog.error(events.EVENT_ADMIN_SET_TOGGLEABLE, "{mod} could not set {name} to {state} on {type}", logData);
					return
				}

				DefaultLog.info(events.EVENT_ADMIN_SET_TOGGLEABLE, "{mod} set {name} to {state} on {type}", logData);
				sendToggleables(io.sockets);
			});
		},function(){
			kickForIllegalActivity(socket);
		});
	});

	services.forEach(s => s.onSocketConnected(socket))

	socket.on("myPlaylistIsInited",function(data){
		sendStatus("createPlayer",socket);
	});
	socket.on("renewPos",function(data){
		sendStatus("renewPos",socket);
	});
	socket.on("refreshMyVideo",function(data){
		sendStatus("forceVideoChange",socket);
	});
	socket.on("refreshMyPlaylist", function(){
		socket.emit("recvNewPlaylist",SERVER.PLAYLIST.toArray());
	});
	socket.on("chat",function(data){
		ifCanChat(socket,function(meta){ // Permissions check
			ifChatMsgIsOk(socket,data,function(){ // check length, et al

				var ip = getAddress(socket);
				if(!ip) return false;
				DefaultLog.info(events.EVENT_CHAT, "user {nick} on ip {ip} sent message {message}", { ip, nick: meta.nick, message: data.msg });
				sendChat(meta.nick,meta.type,data,socket);

			},function(){
				kickForIllegalActivity(socket,"Chat Spam");
			});
		},function(){
			DefaultLog.info(events.EVENT_CHAT, "user from ip {ip} could not send message {message}", { ip, message: data.msg });
		});
	});
	socket.on("registerNick", function(data){
		const logData = { ip: getAddress(socket), nick: data.nick };

		var i = SERVER.RECENTLY_REGISTERED.length;
		var ip = getAddress(socket);
		if(!ip) return false;
		var now = new Date();
		// Backwards to splice on the go
		const isLocalIp = ip == "172.20.0.1"
		if (!isLocalIp) {
			while(--i >= 0) {
				if(now - SERVER.RECENTLY_REGISTERED[i].time > SERVER.settings.core.register_cooldown){
					SERVER.RECENTLY_REGISTERED.splice(i, 1);
				}
				else if(SERVER.RECENTLY_REGISTERED[i].ip == ip) {
					onRegisterError("You are registering too many usernames, try again later.");
					return;
				}
			}
		}
		if(!data.pass || data.pass.length <= 5){
			onRegisterError("Invalid password. Must be at least 6 characters long.");
			return;
		}
		if(data.pass!=data.pass2){
			onRegisterError("Passwords do not match.");
			return;
		}
		if(!data.nick || data.nick.length <= 0 || data.nick.length > 15){
			onRegisterError("Username must be under 15 characters.");
			return;
		}
		if(!data.nick.match(/^[0-9a-zA-Z_]+$/ig) ){
			onRegisterError("Username must contain only letters, numbers and underscores.");
			return;
		}
		if(!getToggleable("allowreg")){
			onRegisterError("Registrations are currently Closed. Sorry for the inconvenience!");
			return;
		}
		if (SERVER.nick_blacklist.has(data.nick.toLowerCase())) {
			onRegisterError("Username not available.");
			return;
		}

		var sql = 'select * from users where name like ?';
		mysql.query(sql, [data.nick], function(err, result, fields) {
			if (err) {
				DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql: q }, err);
				return;
			}

			if(result.length >= 1){
				// Already registered, try logging in using the password we have.
				userLogin(socket, data,
					function(){
						DefaultLog.info(events.EVENT_LOGIN, "{nick} logged in on ip {ip}", logData);
					},
					function(err) {
						socket.emit("loginError", {message:"Username is already taken!"});
						DefaultLog.error(events.EVENT_LOGIN, "{nick} could not log from ip {ip}", logData, err);
					});
			}
			else {
				bcrypt.hash(data.pass, SERVER.settings.core.bcrypt_rounds, function(err, hash){
					if (err) {
						DefaultLog.error(events.EVENT_REGISTER, "{nick} could not register from ip {ip}", logData, err);
						DefaultLog.error(events.EVENT_GENERAL, "Failed to bcrypt for {nick}'s password", { nick: data.nick }, err)
						return;
					}
					var sql = 'INSERT INTO users (name, pass, type) VALUES (?,?,?)';
					mysql.query(sql, [data.nick, hash, 0] , function(err, result, fields){
						if (err) {
							DefaultLog.error(events.EVENT_REGISTER, "{nick} could not register from ip {ip}", logData, err);
							DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
							return;
						}

						// Registered, log em in.
						userLogin(socket, data,
							function() {
								DefaultLog.info(events.EVENT_REGISTER, "{nick} registered from ip {ip}", logData);
								DefaultLog.info(events.EVENT_LOGIN, "newly registered {nick} logged in on ip {ip}", logData);
								SERVER.RECENTLY_REGISTERED.push({ip: ip, time: new Date()});
							},
							function(err) {
								DefaultLog.error(events.EVENT_LOGIN, "newly registered {nick} could not log from ip {ip}", logData, err);
							});
					});
				});
			}
		});

		function onRegisterError(err) {
			DefaultLog.error(events.EVENT_REGISTER, "{nick} could not register from ip {ip}", logData, err);
			socket.emit("loginError", { message: err });
		}
	});
	socket.on("changePassword",function(data){
		socket.get('nick', function(err, nick){
			if (err || !nick) {
				DefaultLog.error(events.EVENT_GENERAL, "Failed to get nick from socket on ip {ip}", { ip: getAddress(socket) })
				return;
			}

			const logData = { ip: getAddress(socket), nick };
			if (!data.pass || data.pass.length <= 5) {
				const err = "Invalid password. Must be at least 6 characters long.";
				DefaultLog.error(events.EVENT_USER_CHANGED_PASSWORD, "{nick} could not change password from ip {ip}", logData, err);
				socket.emit("loginError", {message: err});
				return;
			}

			bcrypt.hash(data.pass, SERVER.settings.core.bcrypt_rounds, function(err, hash) {
				if (err) {
					DefaultLog.error(events.EVENT_GENERAL, "Failed to bcrypt for {nick}'s password", { nick }, e);
					DefaultLog.error(events.EVENT_USER_CHANGED_PASSWORD, "{nick} could not change password from ip {ip}", logData, err);
					return;
				}

				const sql = "UPDATE users SET pass = ? WHERE name = ?";
				mysql.query(sql, [hash, nick], function(err){
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
	});
	socket.on("setNick",function(data){
		ghostBustUser(socket, data, function() {
			const logData = { ip: getAddress(socket), nick: data.nick };
			ifNickFree(data.nick,function(meta) {
				userLogin(socket,data,
					function() {
						DefaultLog.info(events.EVENT_LOGIN, "{nick} logged in on ip {ip}", logData);
					},
					function(err) {
						socket.emit("loginError", {message: "Invalid Login."});
						DefaultLog.error(events.EVENT_LOGIN, "{nick} could not log from ip {ip}", logData, err);
					});
			}, function(){
				DefaultLog.error(events.EVENT_LOGIN, "{nick} could not log from ip {ip} because it is already taken", logData, "Nick already taken");
				socket.emit("loginError", {message: "Nick already taken."});
			});
		});
	});
	socket.on("playNext",function(data){
		ifCanControlPlaylist(socket,function(){
			DefaultLog.info(events.EVENT_ADMIN_SKIPPED_VIDEO,
				"{mod} skipped video on {type}",
				{ mod: getSocketName(socket), type: "playlist"})

			playNext();
		},function(){
			kickForIllegalActivity(socket);
		});
	});
	socket.on("sortPlaylist",function(data){
		ifCanControlPlaylist(socket,function(){
			if(data.from == data.to) return; //wat.
			if(data.from < 0 || data.to < 0) return; //wat.
			var elem = SERVER.PLAYLIST.first;
			var fromelem,toelem;
			for(var i=0;i<SERVER.PLAYLIST.length;i++)
			{
				if(i == data.from)
				{
					fromelem = elem;
					break;
				}
				elem=elem.next;
			}
			if(data.sanityid && elem.videoid != data.sanityid) return doorStuck(socket);
			elem = SERVER.PLAYLIST.first;
			for(var i=0;i<SERVER.PLAYLIST.length;i++)
			{
				if(i == data.to)
				{
					toelem = elem;
					break;
				}
				elem=elem.next;
			}
			SERVER.PLAYLIST.remove(fromelem);
			if(data.to > data.from)
				SERVER.PLAYLIST.insertAfter(toelem,fromelem);
			else
				SERVER.PLAYLIST.insertBefore(toelem,fromelem);

			io.sockets.emit("sortPlaylist",data);

			DefaultLog.info(events.EVENT_ADMIN_MOVED_VIDEO,
				"{mod} moved {title} on {type}",
				{ mod: getSocketName(socket), title: decodeURIComponent(fromelem.videotitle), type: "playlist"})
		},function(){
			kickForIllegalActivity(socket);
		});
	});
	socket.on("forceVideoChange",function(data){
		ifCanControlPlaylist(socket,function(){
			var elem = SERVER.PLAYLIST.first;
			var delme = -1;
			if(SERVER.ACTIVE.volat){
				for(var i=0;i<SERVER.PLAYLIST.length;i++){
					if(elem == SERVER.ACTIVE){
						delme = i;
						break;
					}
					elem=elem.next;
				}
			}

			if("colorTagVolat" in SERVER.ACTIVE.meta){
				var elem = SERVER.PLAYLIST.first;
				for(var i=0;i<SERVER.PLAYLIST.length;i++){
					if(elem == SERVER.ACTIVE){
						setVideoColorTag(i,false,false);
						break;
					}
					elem = elem.next;
				}
			}

			elem = SERVER.PLAYLIST.first;
			for(var i=0;i<SERVER.PLAYLIST.length;i++)
			{
				if(i == data.index)
				{
					if(data.sanityid && elem.videoid != data.sanityid) return doorStuck(socket);
					SERVER.ACTIVE = elem;
					SERVER.ACTIVE.position = i;
					break;
				}
				elem=elem.next;
			}

			DefaultLog.info(events.EVENT_ADMIN_FORCED_VIDEO_CHANGE,
				"{mod} forced video change on {type}",
				{ mod: getSocketName(socket), type: "playlist" })

			handleNewVideoChange();
			sendStatus("forceVideoChange",io.sockets);

			if(delme > -1){
				delVideo({index:delme});
			}

		},function(){
			kickForIllegalActivity(socket);
		});
	});
	socket.on("delVideo",function(data){
		ifCanDeleteVideo(socket,function(){
			delVideo(data, socket);
		},function(){
			kickForIllegalActivity(socket,"You cannot delete videos.");
		});
	});
	socket.on("addVideo", function (data) {
			ifCanControlPlaylist(socket, function (meta) {
			const logData = { mod: getSocketName(socket), type: "playlist", title: data.videotitle, provider: data.videotype };

			if (data.videotype == "yt")
				addVideoYT(socket, data, meta, onVideoAddSuccess, onVideoAddError);
			else if (data.videotype == "vimeo")
				addVideoVimeo(socket, data, meta, onVideoAddSuccess, onVideoAddError)
			else if (data.videotype == "soundcloud")
				addVideoSoundCloud(socket, data, meta, onVideoAddSuccess, onVideoAddError);
			else if (data.videotype == "file")
				addVideoFile(socket, data, meta, onVideoAddSuccess, onVideoAddError);
			else if (data.videotype == "dash")
				addVideoDash(socket, data, meta, onVideoAddSuccess, onVideoAddError);
			else if (data.videotype == "twitch")
				addVideoTwitch(socket, data, meta, onVideoAddSuccess, onVideoAddError);
			else if (data.videotype == "twitchclip")
				addVideoTwitchClip(socket, data, meta, onVideoAddSuccess, onVideoAddError);
			else {
				// Okay, so, it wasn't vimeo and it wasn't youtube, assume it's a livestream and just queue it.
				// This requires a videotitle and a videotype that the client understands.
				data.videotype = "livestream";
				addLiveVideo(data, meta, onVideoAddSuccess, onVideoAddError)
			}

			function onVideoAddSuccess(details) {
				logData.title = details.title;
				DefaultLog.info(
					events.EVENT_ADMIN_ADDED_VIDEO,
					"{mod} added {provider} video {title} on {type}",
					logData);
			}

			function onVideoAddError(error) {
				DefaultLog.error(
					events.EVENT_ADMIN_ADDED_VIDEO,
					"{mod} could not add {provider} video {title} on {type}",
					logData,
					error);

				socket.emit("dupeAdd");
			}
		}, function () {
			kickForIllegalActivity(socket);
		});
	});
	socket.on("importPlaylist",function(data){
		// old implementation can be found in source control
		return false;
	});
	socket.on("forceStateChange",function(data){
		ifCanControlVideo(socket,function(){
			SERVER.STATE = data.state;
			sendStatus("hbVideoDetail",io.sockets);
		},function(){
			kickForIllegalActivity(socket);
		});
	});
	socket.on("videoSeek",function(data){
		ifCanControlVideo(socket,function(){
			SERVER.TIME = data;
			sendStatus("hbVideoDetail",io.sockets);
		},function(){
			kickForIllegalActivity(socket);
		});
	});
	socket.on("moveLeader",function(data){
		ifCanMoveBerry(socket,function(freeMove){
			var targetnick = data || "Server";

			DefaultLog.info(events.EVENT_ADMIN_SET_BERRY,
				"{mod} gave berry to {nick} on {type}",
				{ mod: getSocketName(socket), type: "playlist", nick: targetnick });

			if(targetnick == "Server"){
				setBpAsLeader();
			} else if(freeMove) {
				cl = io.sockets.clients();
				for(var i=0;i<cl.length;i++){
					(function(i){
						cl[i].get("nick",function(err,nick){
							if(nick == targetnick){
								reassignLeader(cl[i]);
							}
						});
					})(i);
				}
			}
		},function(){
			kickForIllegalActivity(socket,"You cannot move leader");
		})
	});
	socket.on("kickUser",function(data){
		ifCanKickUser(socket,function(){
			kickUserByNick(socket, data.nick, data.reason);
		},function(){
			kickForIllegalActivity(socket);
		})
	});
	socket.on("shadowBan",function(data){
		ifCanShadowBan(socket,function(forcetemp){
			var targetNick = data.nick;
			var isbanning = data.sban;
			var temp = data.temp;
			if(forcetemp){temp = forcetemp;}
			var message = "";
			if (isbanning) {
				message = temp
					? `Shadow banned ${targetNick}`
					: `Temporarily shadow banned ${targetNick}`

				DefaultLog.info(temp ? events.EVENT_ADMIN_SHADOWBAN_TEMP : events.EVENT_ADMIN_SHADOWBAN_PERMANENT,
					"{mod} banned user {nick} on {type}",
					{ mod: getSocketName(socket), nick: targetNick, type: "site" });
			}
			else {
				message = `Un-shadow banned ${targetNick}`;

				DefaultLog.info(events.EVENT_ADMIN_SHADOWBAN_FORGIVEN,
					"{mod} unbanned {nick} on {type}",
					{ mod: getSocketName(socket), nick: targetNick, type: "site" });
			}

			socket.get('nick', function(err, nick){
				if(isbanning) {
					var banEmotes = ['[](/ihavenomouthandimustscream)'
									,'[](/bant)'
									,'[](/mmmbananas)'
									,'[](/celbanned)'
									,'[](/seriouslybanned)'
									,'[](/konahappy)'
									,'[](/ppshutup)'
									,'[](/bpstfu)'
									,'[](/eatadick)'
									,'[](/suggestionbox)'
									,'[](/rargtfo)'
									,'[](/fuckyoudobby)'
									,'[](/cleese)'
									,'[](/wingflipoff)'
									,'[](/pokemonkilledmyparents)'
									,'[](/fuckyourshit)'];
					message = banEmotes[Math.floor(Math.random()*banEmotes.length)] + ' ' + message;
				}
				message = '/me ' + message;
				_sendChat(nick, 3, {msg: message, metadata: {channel: 'admin'}}, socket);
			});
			getSocketOfNick(targetNick, function(targetSocket) {
				const logData = { mod: getSocketName(socket), ip: getAddress(targetSocket), type: "site" };

				if (isbanning){
					DefaultLog.info(temp ? events.EVENT_ADMIN_SHADOWBAN_TEMP : events.EVENT_ADMIN_SHADOWBAN_PERMANENT,
						"{mod} banned ip {ip} on {type}",
						logData);

					shadowBanUser(targetSocket, temp);
				} else {
					DefaultLog.info(events.EVENT_ADMIN_SHADOWBAN_FORGIVEN,
						"{mod} unbanned ip {ip} on {type}",
						logData);

					unShadowBanUser(targetSocket);
				}
			});
		}, function(){
			shadowBanUser(socket); // Nobody plays this game.
			kickForIllegalActivity(socket);
		})
	});
	socket.on("setAreas",function(data){
		ifCanSetAreas(socket,function(){
			areaname = data.areaname;
			content = data.content;

			DefaultLog.info(events.EVENT_ADMIN_EDITED_AREA,
				"{mod} edited {area} on {type}",
				{ mod: getSocketName(socket), type: "site", area: areaname });

			setAreas(areaname,content);
		},function(){
			kickForIllegalActivity(socket);
		})
	});
	socket.on("fondleVideo",function(data){
		// New abstraction for messing with video details
		var elem = SERVER.PLAYLIST.first;
		for(var i=0;i<data.info.pos;i++){
			 elem=elem.next;
		}
		if(data.sanityid && elem.videoid != data.sanityid) return doorStuck(socket);

		if("action" in data){
			if(data.action == "setVolatile"){ data = data.info; // Drop action name.
				ifCanSetVideoVolatile(socket,function(){
					pos = data.pos;
					isVolat = data.volat;
					setVideoVolatile(socket,pos,isVolat)
				},function(){
					kickForIllegalActivity(socket,"You cannot toggle video volatility");
				});
			}
			if(data.action == "setColorTag"){ data = data.info; // Drop action name.
				ifCanSetVideoVolatile(socket,function(){
					pos = ("pos" in data ? data.pos : 0);
					tag = ("tag" in data ? data.tag : false);
					volat = ("volat" in data ? data.volat : false);
				   setVideoColorTag(pos,tag,volat)
				},function(){
					kickForIllegalActivity(socket,"You cannot modify color tags");
				});
			}
		}
	});
	socket.on("fondleUser", function(data){
		if("action" in data){
			if(data.action == "setUserNote"){ var d = data.info; // Drop action name.
				ifCanSetUserNote(socket,function(){
					// She wants the d.nick :3
					if(d.nick.match(/^[0-9a-zA-Z_]+$/) != null &&
					   d.nick.length >= 1  &&
					   d.nick.length <= 20
					){
						var sql = "select meta from users where name = ?";
						mysql.query(sql, [d.nick], function(err, result, fields) {
							if (err) {
								DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
								return;
							}
							if(result.length == 1) {
								var meta = {};
								try {
									if(result[0].meta)
										meta = JSON.parse(result[0].meta) || {};
								} catch(e){
									DefaultLog.error(events.EVENT_GENERAL, "Failed to parse user meta for {nick}", { nick: d.nick }, e)
									meta = {};
								}
								meta.note = d.note;
								sql = "update users set meta = ? where name = ?";
								mysql.query(sql, [JSON.stringify(meta), d.nick], function(err, result, fields) {
									if (err) {
										DefaultLog.error(events.EVENT_DB_QUERY, "query \"{sql}\" failed", { sql }, err);
										return;
									}
									for(var i=0;i<SERVER.CHATLIST.length;i++) {
										if(SERVER.CHATLIST[i].nick == d.nick){
											SERVER.CHATLIST[i].meta = meta;
											break;
										}
									}

									DefaultLog.info(events.EVENT_ADMIN_SET_NOTE,
										"{mod} set {nick}'s note to '{note}' on {type}",
										{ mod: getSocketName(socket), type: "user", area: areaname, nick: d.nick, note: d.note});

									forModminSockets(function(sc){
										sc.emit('fondleUser', data);
									});
								});
							}
						});
					}
				}, function() {
					kickForIllegalActivity(socket,"You cannot do that");
				});
			}
		}
	});
	if (new Date() < new Date("Wed, 2 Apr 2014 00:00:00 EDT")) { // Don't Register Socket event after April Fools 2014
		socket.on("activateGold",function(){
			if (new Date() < new Date("Wed, 2 Apr 2014 00:00:00 EDT")) { // Even registered, Don't do anything.
				socket.get("nick",function (err, nick){
					socket.set("gold",true,function (err, val){
						for(var i=0;i<SERVER.CHATLIST.length;i++) {
							if(SERVER.CHATLIST[i].nick == nick){
								SERVER.CHATLIST[i].gold = true;
								break;
							}
						}
						io.sockets.emit("midasTouch",{nick:nick});
					});
				});
			}
		});
	}

	socket.on("getBanlist",function(data){
		ifCanBan(socket,function(){
			sendBanlist(socket);
		},function(){
			kickForIllegalActivity(socket);
		})
	});
	socket.on("ban",function(data){
		ifCanBan(socket,function(){
			banUser(data);
		},function(){
			kickForIllegalActivity(socket);
		})
	});
	socket.on("gild",function(data){
		ifCanGild(socket,function(){
			SERVER.GILDNAME = data;
		},function(){
			kickForIllegalActivity(socket);
		})
	});
	socket.on("forceRefreshAll",function(data){
		ifCanForceRefresh(socket,function(){
			if (!data) {
				data = {};
			}
			if (!data.delay) {
				data.delay = true;
			}
			io.sockets.emit('forceRefresh', data);
		},function(){
			kickForIllegalActivity(socket);
		});
	});
	socket.on("debugDump",function(data){
		ifCanDebugDump(socket,function(){
			io.sockets.each(function(sc){
				sc.get('nick',function(err,nick){
					socket.emit('debugDump', {
						type: 'socket',
						nick: nick,
						ip: getAddress(sc),
						headers: sc.handshake && sc.handshake.headers
					});
				});
			});
		},function(){
			kickForIllegalActivity(socket);
		});
	});
	socket.on("crash",function(data){
		//socket.emit(socket);
	});
	socket.on("error",function(err){
		DefaultLog.error(
			events.EVENT_SOCKET,
			"caught error on socket with ip {ip} and name {nick}",
			{ ip: getAddress(socket), nick: getSocketName(socket) });
	});
});
/* vim: set noexpandtab : */
