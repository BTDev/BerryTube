// Include the SERVER.settings
var SERVER = {};
SERVER.settings = require('./bt_data/settings.js');
SERVER.ponts = require('./bt_data/ponts.js');
SERVER.dbcon = require('./bt_data/db_info.js');

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
var mysql = null;

process.on('uncaughtException', function (err) {
	console.error("Uncaught exception");
	console.error(err);
	if (err !== 'ECONNRESET') {
		console.log('Ignoring ECONNRESET');
	} else {
		console.log('Not ECONNRESET; exiting...');
		process.exit(1);
	}
});

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
	try{
		eval(chunk);
	} catch(e) {
		console.error(e);
	}
});

// Helper function to get address because sockets can get messed up
function getAddress(socket){
	try{
		return socket.handshake.headers['x-forwarded-for'];
	}
	catch(e) {
		console.log("Couldn't get IP from socket, so return false.");
		return false;
	}
}

/* New DB Init Code Begins Here */
function handleDisconnect(connection) {
	connection.on('error', function(err) {
		console.log('Re-connecting lost connection: ' + err.stack);
		setTimeout(function(){
			dbInit(); // Yes this needs to be here.
		},1000)
	});
}
function dbInit(){
	console.log("Initializing DB Link");
	var config = {
		host: SERVER.dbcon.host,
		port: SERVER.dbcon.post,
		user: SERVER.dbcon.mysql_user,
		password: SERVER.dbcon.mysql_pass
	};
	mysql = _mysql.createConnection(config);
	handleDisconnect(mysql); // Yes this needs to be here.
	mysql.query('use ' + SERVER.dbcon.database);
}
dbInit();
/* New DB Init Code Ends Here */

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
// SERVER.POLL OBJECT
function Poll() {}
Poll.prototype = {
	creator:"",
	obscure:false,
	obscurehelp:[],
	title:"",
	options:[],
	votes:[],
	length:0,
	votedIPS:[]
};
Poll.prototype.newPoll = function(title,ops,obscure,socket,callback){
	p = this;
	ifCanCreatePoll(socket,function(){
		debugLog("can create")
		p.closePoll(socket,function(){
			debugLog("old one closed.")
			socket.get("nick",function (err, nick){
				if(typeof nick == 'undefined' || nick == null) nick = "some guy";
				p.creator = nick;
				p.title = title;
				p.obscure = obscure;

				p.options=[];
				p.votes=[];
				p.length=0;
				p.votedIPS=[];
				for(var i=0;i<ops.length;i++){
					if(ops[i].length > 0){
						var newop = sanitize(ops[i]);
						p.options.push(newop);
						p.votes.push(0);
						p.length++;
						p.obscurehelp.push("?");
					}
				}
				if(p.length == 0){
					return; // :C
				}else{
					p.notify(io.sockets);
					p.getLog(function(log){
						writeToLog("SERVER.POLL OPENED",log, function(err) {
							if(callback)callback();
						});
					});
				}
			})
		});
	},function(){
		debugLog("Bad Create Poll.");
	});
};
Poll.prototype.closePoll = function(socket,callback){
	p = this;
	ifCanClosePoll(socket,function(){
		if(p.length == 0) {
			callback();
			return;
		}

		cl = io.sockets.clients();
		var doneCount = 0;
		// Write current poll to log.
		p.getLog(function(log){
			writeToLog("SERVER.POLL CLOSED",log, function(err) {
				if(err) {
					console.err(err);
					return;
				}
				for(var i=0;i<cl.length;i++){
					(function(i){
						cl[i].set("myvote",-1,function(){
							// Do callback if we're done.
							if(++doneCount >= cl.length){

								io.sockets.emit("clearPoll",{
									votes:p.votes
								});

								p.creator="";
								p.title="";
								p.options=[];
								p.votes=[];
								p.obscurehelp=[];
								p.length=0;
								p.votedIPS=[];

								if(callback)callback();
							}
						});
					})(i);
				}
			});
		});
	},function(){
		debugLog("Bad Close Poll.");
	});
};
Poll.prototype.vote = function(option,socket,callback){
	p = this;
	ifCanVoteOnPoll(socket,function(){
		socket.get("myvote",function(err,myvote){
			if(err) {
				console.err(err);
				return;
			}
			if(typeof myvote == 'undefined' || myvote == null || myvote == -1){
				if(typeof p.options[option] != 'undefined'){
					// So everything is good, EXCEPT, make sure only one vote per IP is recorded.
					var ip = getAddress(socket);
					if(!ip) return false;
					if(p.votedIPS.indexOf(ip) == -1){
						socket.set("myvote",option,function(){
							p.votedIPS.push(ip);
							p.votes[option]++;

							if(p.obscure){
								io.sockets.each(function(sc){
									sc.get('type',function(err,type){
										if(parseInt(type) > 0 || SERVER.LEADER == sc){ // Mod though, so show anyway.
											sc.emit("updatePoll",{
												votes:p.votes
											});
										} else { // So hide em.
											sc.emit("updatePoll",{
												votes:p.obscurehelp
											});
										}
									});
								});
							} else {
								io.sockets.emit("updatePoll",{
									votes:p.votes
								});
							}
							if(callback)callback();
						});
					}
				}
			}
		});
	},function(){
		debugLog("Bad Poll Vote.");
	});
};
Poll.prototype.unVote = function(socket,callback){
	p = this;
	socket.get("myvote",function(err,myvote){
		if(typeof myvote != 'undefined' && myvote != null && myvote != -1){
			if(typeof p.options[myvote] != 'undefined'){
				socket.set("myvote",-1,function(){
					// Okay, all good, now then just make sure they actually had a vote in.
					var ip = getAddress(socket);
					if(!ip) return false;
					if(p.votedIPS.indexOf(ip) != -1){
						p.votedIPS.splice(p.votedIPS.indexOf(ip),1);
						p.votes[myvote]--;
						if(p.obscure){
							io.sockets.each(function(sc){
								sc.get('type',function(err,type){
									if(parseInt(type) > 0 || SERVER.LEADER == sc){ // Mod though, so show anyway.
										sc.emit("updatePoll",{
											votes:p.votes
										});
									} else { // So hide em.
										sc.emit("updatePoll",{
											votes:p.obscurehelp
										});
									}
								});
							});
						} else {
							io.sockets.emit("updatePoll",{
								votes:p.votes
							});
						}
						if(callback)callback();
					}
				});
			}
		}
	});
};
Poll.prototype.notify = function(socket, ghost, callback){ // This function got fucking complicated.
	p = this;
	if(p.length > 0)
	{
		// Check if single socket or group
		if(socket == io.sockets){
			if(p.obscure){ // Secret Poll
				io.sockets.each(function(socket){
					socket.get('type',function(err,type){
						if(parseInt(type) > 0 || SERVER.LEADER == socket){ // Mod though, so show anyway.
							socket.emit("newPoll",{
								creator:p.creator,
								title:p.title,
								options:p.options,
								votes:p.votes,
								obscure:p.obscure,
								ghost:ghost
							});
						} else { // So hide em.
							socket.emit("newPoll",{
								creator:p.creator,
								title:p.title,
								options:p.options,
								votes:p.obscurehelp,
								fuckYou:"Stop trying to cheat",
								obscure:p.obscure,
								ghost:ghost
							});
						}
					});
				});
			} else { // Not obscured, dont worry about it
				socket.emit("newPoll",{
					creator:p.creator,
					title:p.title,
					options:p.options,
					votes:p.votes,
					obscure:p.obscure,
					ghost:ghost
				});
			}
		} else { // Single User
			if(p.obscure){ // Secret Poll
				socket.get('type',function(err,type){
					if(parseInt(type) > 0 || SERVER.LEADER == socket){ // Mod though, so show anyway.
						socket.emit("newPoll",{
							creator:p.creator,
							title:p.title,
							options:p.options,
							votes:p.votes,
							obscure:p.obscure,
							ghost:ghost
						});
					} else { // So hide em.
						socket.emit("newPoll",{
							creator:p.creator,
							title:p.title,
							options:p.options,
							votes:p.obscurehelp,
							fuckYou:"Stop trying to cheat",
							obscure:p.obscure,
							ghost:ghost
						});
					}
				});
			} else {
				socket.emit("newPoll",{
					creator:p.creator,
					title:p.title,
					options:p.options,
					votes:p.votes,
					obscure:p.obscure,
					ghost:ghost
				});
			}
		}
	}
	if(callback)callback();
}
Poll.prototype.getLog = function(callback){
	p = this;
	var ret = p.creator+":";
	ret += p.title+":";
	for(var i=0;i<p.options.length;i++){
		ret+=p.options[i]+"("+p.votes[i]+"):";
	}
	callback(ret);
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
		//debugLog(elem);
		out.push(elem.pack());
		elem=elem.next;
	}
	debugLog(out);
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
SERVER.POLL = new Poll();
SERVER.LOG = fs.createWriteStream(SERVER.settings.core.log_file_name,{flags: 'a'});
SERVER.ELOG = fs.createWriteStream(SERVER.settings.core.error_file_name,{flags: 'a'});
SERVER.DLOG = fs.createWriteStream(SERVER.settings.core.debug_file_name,{flags: 'w'});
SERVER.FAILED_LOGINS=[];
SERVER.RECENTLY_REGISTERED=[];
SERVER.GILDNAME = "*";

var MODE_VIDEOCHAT = 0;
var MODE_CHATONLY = 1;

function writeToLog(eventclass,string,callback){
	string = "<"+new Date().toUTCString()+"> "+eventclass+":"+string;
	SERVER.LOG.write(string+"\n");
	if(callback)callback();
}
function debugLog(thing){
	SERVER.DLOG.write(thing+"\n");
}
function _adminLog(data){
	data.timestamp = new Date().toUTCString();
	var channel = "adminLog";
	if(!SERVER.OUTBUFFER[channel]) { SERVER.OUTBUFFER[channel] = [] }
	SERVER.OUTBUFFER[channel].push(data);
	if(SERVER.OUTBUFFER[channel].length > SERVER.settings.core.max_saved_buffer) SERVER.OUTBUFFER[channel].shift();
	forModminSockets(function(sc){
		sc.emit('adminLog', data);
	});
	//io.sockets.in('admin').emit('adminLog', data);
};
function adminLog(socket, data) {
	if(!socket){
		data.nick = "Server";
		_adminLog(data);
	}
	else {
		socket.get('nick', function (err, nick) {
			if(nick == null) nick = "?";
			data.nick = nick;
			data.berry = SERVER.LEADER == socket;
			_adminLog(data);
		});
	}
}
function eLog(string,callback){
	try{
		var stack = new Error().stack;
		string = "<"+new Date().toUTCString()+">:"+string+"\n"+stack;
		SERVER.ELOG.write(string+"\n");
		if(callback)callback();
	} catch(e) {
		console.error("Had an error, but couldn't log it. :C");
		console.error(err);
	}
}
function sanitize(string){
	if(typeof(string) == "undefined"){
		string = "I am a lazy hacker, mock me.";
	} else {
		string = string.replace(/</g,"&lt;");
		string = string.replace(/>/g,"&gt;");
	}
	return string;
}
function initPlaylist(callback){
	var q = 'select * from '+SERVER.dbcon.video_table+' order by position'; debugLog(q);
	mysql.query(q, function(err, result, fields) {
		if (err) {
			//throw err;
			console.error(err);
			return;
		}
		else {
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
		}
		SERVER.ACTIVE = SERVER.PLAYLIST.first;
		if(callback)callback()
		console.log("SERVER.PLAYLIST loaded");
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
	var q = 'delete from misc where name = ?'; debugLog(q);
	mysql.query(q, [data.name], function(err, result, fields) {
		if (err) {
			console.error(err);
		}
		var q = 'insert into misc (name,value) VALUES (?,?)'; debugLog(q);
		mysql.query(q, [data.name, data.value], function(err, result, fields) {
			if (err) {
				console.error(err);
			}
			if(callback) callback();
		});
	});
}
function getMisc(data, callback){
	var val = "";
	var q = 'select * from misc where name = ?';
	mysql.query(q, [data.name], function(err, result, fields) {
		if (err) {
			//throw err;
			console.error(err);
			return;
		}
		if(result.length == 1){
			var row = result[0];
			try {
				val = row.value;
			} catch(e) {
				val = "";
				debugLog("Bad stored misc. Blah. " + data.name);
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
		console.log("Ban List loaded");
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
		console.log("Shadowbant ips Loaded");
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
		console.log("Filters Loaded");
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
			//console.error("SERVER.STATE: "+SERVER.STATE)
			//debugLog(SERVER.TIME);
			if(Math.ceil(SERVER.TIME+1) >= (SERVER.ACTIVE.videolength + SERVER.settings.vc.tail_time))
			{
				debugLog(Math.ceil(SERVER.TIME+1)+" >= "+SERVER.ACTIVE.videolength);
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

			//console.log(SERVER.TIME);
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
	console.log("Timer initialized");
}
function initAreas(){
	var q = 'select * from areas'; debugLog(q);
	mysql.query(q, function(err, result, fields) {
		if (err) {
			//throw err;
			console.error(err);
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
		console.log("Areas Loaded");
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
function sendPlaylist(socket,everyone){
	socket.emit("updatePlaylist",SERVER.PLAYLIST.toArray());
	if(everyone)
		socket.broadcast.emit("updatePlaylist",SERVER.PLAYLIST.toArray());
}
function playNext(){
	debugLog("automatically progressing to next video");
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
		console.log(Old.meta);
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

		//console.log("timeSinceBan",timeSinceBan / 60000," min");
		//console.log("SERVER.BANS[i].duration",SERVER.BANS[i].duration);
		if((now - SERVER.BANS[i].bannedOn) >= d){
			//Ban expired.
			SERVER.BANS.splice(i,1);
			//console.log("removed expired ban");
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
	//console.log(SERVER.BANS);
}
function banUser(o){

	var required = ['ips','nicks','duration']; // nick and ip should be arrays, even if single-element
	o.bannedOn = new Date().getTime();
	for(elem in required)if(!(required[elem] in o))return;

	var existing = isUserBanned(o);
	if(existing){
		console.log("existing");
		augmentBan(existing,o);
	} else {
		console.log("new");
		SERVER.BANS.push(o);
	}
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

	//console.log("Checking bans for");
	//console.log(o);

	prepareBans();
	for(bannedguy in SERVER.BANS){

		// Check all IP's
		for(ip in o.ips){
			if(!SERVER.BANS[bannedguy].ips) SERVER.BANS[bannedguy].ips = [];
			if(SERVER.BANS[bannedguy].ips.indexOf(o.ips[ip]) >= 0){
				augmentBan(SERVER.BANS[bannedguy],o);
				//console.log("Totes bant.");
				return SERVER.BANS[bannedguy];
			}
		}
		// Check all Nicks
		for(nick in o.nicks){
			if(!SERVER.BANS[bannedguy].nicks) SERVER.BANS[bannedguy].nicks = [];
			if(SERVER.BANS[bannedguy].nicks.indexOf(o.nicks[nick]) >= 0){
				augmentBan(SERVER.BANS[bannedguy],o);
				//console.log("Totes bant.");
				return SERVER.BANS[bannedguy];
			}
		}
	}
	//console.log("all good");
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
		console.log("Ban: "+ip);
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
			console.log("Temp Ban: "+ip);
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
		console.log("unbanning: "+ip);
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
							//io.sockets.in('admin').emit('unShadowBan', {'nick': nick});
							debugLog('Sending unshadow ban on nick: ' + nick);
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
						debugLog('Sending shadow ban on nick: ' + nick);
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
	socket.emit("kicked",reason);
	socket.disconnect(); // NOT ALLOWED.
	console.log("Kicked for illegal activity");
}
function kickUser(socket,reason){
	socket.emit("kicked",reason);
	socket.disconnect();
}
function kickUserByNick(socket,nick,reason){
	adminLog(socket, {msg:'Kicked ' + nick, type:"user"});
	getSocketOfNick(nick,function(s){
		kickUser(s, reason);
	},function(){
		cleanUsers();
	});
}
function cleanUsers(){
/*
	var newSERVER.CHATLIST = [];
	cl = io.sockets.clients();
	for(var i=0;i<cl.length;i++){
		(function(i){
			cl[i].get("nick",function(err,nick){
				newSERVER.CHATLIST.push(nick);
			});

			if(i == cl.length-1){
				SERVER.CHATLIST = newSERVER.CHATLIST;
			}
		})(i);
	}
*/
}
var commit = function(){
	var elem = SERVER.PLAYLIST.first;
	for(var i=0;i<SERVER.PLAYLIST.length;i++)
	{
		var q = 'update '+SERVER.dbcon.video_table+' set position = ? where videoid = ?'; debugLog(q);
		mysql.query(q, [i, '' + elem.videoid], function(err, result, fields) {
			if (err) {
			//throw err;
				console.error(err);
				return;
			}
		});
		elem=elem.next;
	}

	for(var i=0;i<SERVER.AREAS.length;i++)
	{
		var q = 'update areas set html = ? where name = ?'; debugLog(q);
		mysql.query(q, [SERVER.AREAS[i].html, SERVER.AREAS[i].name], function(err, result, fields) {
			if (err) {
				//throw err;
				console.error(err);
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

	/*var hardbant = [];
	for(var i in SERVER.SHADOWBANT_IPS){
		hardbant.push({ip:i, temp:SERVER.SHADOWBANT_IPS[i].temp || false});
	}*/
	// Dunno if this will be necessary, but leaving it in case
	upsertMisc({name:'hardbant_ips', value:JSON.stringify(SERVER.BANS)});

	upsertMisc({name:'server_time', value:''+Math.ceil(SERVER.TIME)});
	upsertMisc({name:'server_active_videoid', value:''+SERVER.ACTIVE.videoid});
};

const commitInterval = setInterval(commit,SERVER.settings.core.db_commit_delay);
console.log('commit delay', SERVER.settings.core.db_commit_delay);

process.on('SIGTERM', function(signal){
	console.log('Running commit before exit...');
	clearInterval(commitInterval);
	io.sockets.emit('serverRestart');
	commit();
	setTimeout(function(){
		process.exit(128 + signal);
	}, 1000);
});

function hotPotatoLeader(departing){
	SERVER.LEADER=false;
	var clients = io.sockets.clients();
	var num = clients.length;
	if(num >= 2){
		var check = departing;
		while(check == departing)
		{
			var t = Math.floor((Math.random()*num));
			check = clients[t];
		}
		reassignLeader(check);
	}else{
		debugLog("NO SERVER.LEADER");
	}
}
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
	debugLog("SERVER.LEADER SET");
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
	debugLog("we president now");
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
				if(callback)callback();

			});
		});
	});

}
function _detailChatlist(){
	for(var i=0;i<SERVER.CHATLIST.length;i++) {
		debugLog(SERVER.CHATLIST[i].socket.disconnected);
	}
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
	debugLog("SEND SERVER.CHATLIST");
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
			//console.log(user); //MARK
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

			//console.log(SERVER.CHATLIST[i]); //MARK
			//console.log(user); //MARK
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
	debugLog("SEND JOIN. user: " + user);
	io.sockets.each(function(socket){
		socket.get('type', function(err, type){
			var data={nick:user.nick, type:user.type};
			if(parseInt(type)>=1){
				data.meta = user.meta;
				data.shadowbanned = user.shadowbanned;
				data.tempshadowbanned = user.tempshadowbanned;
			}
			if(user.gold) data.gold=true;
			socket.emit('userJoin',data);

		});
	});
}
function sendUserPart(socket,callback){
	socket.get('nick', function (err, nick) {
		if(nick == null) return false;
		debugLog("SEND PART");
		io.sockets.emit("userPart",{
			nick:nick
		});
	});
}
function getCommand(msg){
	var re = new RegExp("^/([a-zA-Z]*)([-0-9]*)\\s*(.*)","i");
	var parsed = { msg: msg, command: false, multi: 1 };
	if(ret = msg.match(re)){
		//console.log(ret);
		parsed.command = ret[1].toLowerCase();
		parsed.multi = ret[2] || 1;
		parsed.msg = ret[3];
	}
	console.log(parsed);
	return parsed;
}
/*
function cmdCheck(msg,whatfor){
	var re = new RegExp("^(/"+whatfor+"([-0-9]*)([\ ]+|$)|\/"+whatfor+"$)[\ ]*(.*)",'i');
	if(ret = msg.match(re)){
		debugLog(ret)
		if(ret.length >= 5){
			return {
				amt:parseInt(ret[2])||1,
				text:ret[4]
			};
		}
		return false;
	}
	return false;
}
*/
function handleNewVideoChange(){
	writeToLog("VIDEO CHANGE",decodeURI(SERVER.ACTIVE.videotitle));
	resetDrinks();
	resetTime();
	// Is this a livestream? if so, stop ticking.
	if(SERVER.ACTIVE.videolength == 0) {
		//console.log("Switching to live mode");
		SERVER.LIVE_MODE = true;
	} else {
		//console.log("Switching to managed mode");
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
	SERVER.DRINKS = (parseInt(SERVER.DRINKS)|0) + parseInt(amt);
	if(SERVER.DRINKS > 1000000){
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
				console.error(e);
				SERVER.FILTERS.splice(i,1);
				continue;
			}

			if(nick.match(nickCheck)){ //debugLog("matched name");
				if(msg.match(chatCheck)){ //debugLog("matched chat");
					// Perform Action
					actionChain.push({action:d.actionSelector,meta:d.actionMetadata});
				}
				if(d.chatReplace.trim().length > 0){ //debugLog("doing a replace");
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
		console.error(e);
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
	var volatStr = isVolat ? "volatile" : "not volatile";
	adminLog(socket, {msg: "Set "+decodeURIComponent(elem.videotitle)+" to "+volatStr, type: "playlist"});
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

	var q = 'update '+SERVER.dbcon.video_table+' set meta = ? where videoid = ?'; debugLog(q);
	mysql.query(q, [JSON.stringify(elem.meta), '' + elem.videoid], function(err, result, fields) {
		if (err) {
			//throw err;
			console.error(err);
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
		kick:["kick","k"]
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
	debugLog("Sending covert data");
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
	   console.error("No such toggleable!");
	   return;
	}
	if(typeof state == "undefined"){
	   state = !SERVER.settings.toggles[name][0];
	}
	SERVER.settings.toggles[name][0] = state;
	adminLog(socket, {msg: "Setting "+name+" to "+(state ? "on":"off"), type:"site"});
	if(callback)callback({
		name:name,
		state:state
	});
}
function getToggleable(name){
	if(typeof SERVER.settings.toggles[name] == "undefined"){
	   console.error("No such toggleable!");
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
			debugLog(key + " " +data[key]);
		}
	}
	socket.emit("setToggleables",data);
}
function getSocketOfNick(targetnick,truecallback,falsecallback){
	cl = io.sockets.clients();
	for(var i=0;i<cl.length;i++){
		(function(i){
			cl[i].get("nick",function(err,nick){
				if(nick == targetnick){
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
				adminLog(socket, {msg:'Deleted ' + decodeURIComponent(elem.videotitle), type:'playlist'});
				SERVER.PLAYLIST.remove(elem);
				io.sockets.emit('delVideo',{
					position:i,
					sanityid:elem.videoid
				});
				var q = 'delete from '+SERVER.dbcon.video_table+' where videoid = ? limit 1'; debugLog(q)
				var historyQuery = "";
				var historyQueryParams;
				// Don't archive livestreams

				if(elem.videolength > 0) {
					historyQuery = "insert into videos_history (videoid, videotitle, videolength, videotype, date_added, meta) values (?,?,?,?,NOW(),?)";
					historyQueryParams = [
						'' + elem.videoid,
						elem.videotitle,
						elem.videolength,
						elem.videotype,
						JSON.stringify(elem.meta || {})
					];

				}
				mysql.query(q, ['' + elem.videoid], function(err, result, fields) {
					if (err) {
						//throw err;
						console.error(err);
						return;
					}
					if(historyQuery){
						mysql.query(historyQuery, historyQueryParams, function(err, result, fields) {
							if (err) {
								//throw err;
								console.error(err);
								return;
							}
						});
					}
				});
				elem.deleted = true;
				break;
			} catch(e) {
				console.error(e);
				console.error("Error deleting video. Proceeding.");
			}
		}
		try{
			if(typeof elem != "undefined" && elem != null){
				elem=elem.next;
			} else {
				break;
			}
		} catch(e) {
			console.error(e);
			console.log("continuing, probably a race");
			break;
		}
	}
}
function rawAddVideo(d,successCallback,failureCallback){

	// Check for any existing metadata
	var q = 'select meta from videos_history where videoid = ?';
	mysql.query(q, ['' + d.videoid], function(err, result, fields) {
		if (err) { console.error(err);	return;	}
		if(result.length == 1){
			try{
				d.meta = JSON.parse(result[0].meta);
			}catch(e){}
		}
		var q = 'delete from videos_history where videoid = ?';
		mysql.query(q, ['' + d.videoid], function(err, result, fields) {
			if (err) {
				//throw err;
				console.error(err);
				return;
			}
		});
		if(!('meta' in d) || d.meta == null){d.meta = {};}
		if(!('addedon' in d.meta)){d.meta.addedon = new Date().getTime();}
		q = 'insert into '+SERVER.dbcon.video_table+' (position, videoid, videotitle, videolength, videotype, videovia, meta) VALUES (?,?,?,?,?,?,?)'; debugLog(q);
		var qParams = [ d.pos,
						'' + d.videoid,
						d.videotitle,
						d.videolength,
						d.videotype,
						d.who,
						JSON.stringify(d.meta || {})
					  ];
		mysql.query(q, qParams, function(err, result, fields) {
			if (err) {
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
	if(!data.videotype.match(/^[a-z]{1,10}$/)){
		console.log(["Videotype wasn't lowercase alpha or was too long: ", data.videotype, "Queued by: ", meta.nick].join(''));
		failureCallback();
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
		if(successCallback)successCallback();
	},function(err){
		if(failureCallback)failureCallback(err);
	})
}
function addVideoVimeo(socket,data,meta,successCallback,failureCallback){
	var videoid = data.videoid.trim().replace('/', '');
	var publicPath = '/api/v2/video/' + videoid.toString() + ".json";
	var embedCallback = function(){
		console.log("Didn't find video using public api, trying oembed.")
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
	console.log(options.host + "/" + options.path);
	var req = http.request(options, function (res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log(chunk);
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
			console.log(recievedBody);
			console.log("done?");
			adminLog(socket, {msg:"Added vimeo video "+jdata.title, type:"playlist"});
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
				if (successCallback)successCallback();
			}, function (err) {
				if (failureCallback)failureCallback(err);
			});
		});
	});
	req.on('error', function (e) {
		console.log(e);
		if (failureCallback)failureCallback(e);
	});
	req.end();
}

function __addVideoYT(socket,data,meta,successCallback,failureCallback){
	var videoid = data.videoid.trim();
	if(videoid.length==0)
	{
		if(failureCallback)failureCallback();
		return;
	}
	//https://gdata.youtube.com/feeds/api/SERVER.PLAYLISTs/PL013FD740A81D2C04?v=2
	var options = {
		host: 'gdata.youtube.com',
		port: 80,
		method: 'GET',
		path: '/feeds/api/videos/'+videoid.toString()
	};

	//https://www.youtube.com/watch?v=woyqYP8b3Aw

	var recievedBody = "";
	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			recievedBody += chunk;
		});
		res.on('end', function(){ //7zLNB9z_AI4

			var OK = true;
			var restrictReasons = {};


			var formattedTitle = recievedBody.match(/<title.+>(.*?)<\/title>/);
			if(formattedTitle != null){
				formattedTitle = formattedTitle[1];
			}else{
				OK = false;
				restrictReasons.restricted = true;
			}

			var formattedTime = recievedBody.match(/<yt:duration seconds='([0-9]+?)'\/>/);
			if(formattedTime != null){
				formattedTime = formattedTime[1];
			}else{
				OK = false;
				restrictReasons.restricted = true;
			}

			if(!data.force){
				var countryRestriction = recievedBody.match(/<media:restriction type='country' relationship='deny'>([\w ]+)<\/media:restriction>/);
				var countryAllow = recievedBody.match(/<media:restriction type='country' relationship='allow'>([\w ]+)<\/media:restriction>/);
				var noembed = recievedBody.match(/<yt:noembed\/>/);
				if(countryRestriction) {
					var r = countryRestriction[1].split(' ');
					var ignored = SERVER.settings.core.country_restriction_ignored;
					for(var i=0;i<ignored.length;++i){
						var idx = r.indexOf(ignored[i]);
						if(idx > -1) {
							r.splice(idx, 1);
						}
					}
					if(r.length > 0){
						restrictReasons.countries = countryRestriction[1];
						OK = false;
					}
				}
				if(countryAllow) {
					var r = countryAllow[1].split(' ');
					var required = SERVER.settings.core.country_allow_required || ['GB', 'CA', 'US'];
					var restricted = [];
					for(var i=0;i<required.length;++i) {
						if(r.indexOf(required[i]) <= -1) {
							restricted.push(required[i]);
						}
					}
					if(restricted.length > 0){
						restrictReasons.countries = restricted;
						OK = false;
					}
				}
				if(noembed) {
					restrictReasons.noembed = true;
					OK = false;
				}
			}
			for(var hasProperties in restrictReasons) break;
			if(hasProperties) {
				socket.emit("videoRestriction", restrictReasons);
			}

			var pos = SERVER.PLAYLIST.length;

			if(OK){
				adminLog(socket, {msg: "Added youtube video "+formattedTitle, type: "playlist"});
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
					if(successCallback)successCallback();
				},function(err){
					if(failureCallback)failureCallback(err);
				})
			}else{
				if(failureCallback)failureCallback();
			}
		});
	});

	req.on('error', function(e) {
		if(failureCallback)failureCallback(e);
	});

	req.end();
}

function addVideoYT(socket,data,meta,successCallback,failureCallback){
	var videoid = data.videoid.trim();
	if(videoid.length==0)
	{
		if(failureCallback)failureCallback();
		return;
	}
	//https://www.googleapis.com/youtube/v3/videos?id=QIFn0wqZx7Y&key=AIzaSyBBM2fo32Pzrcf0GHO5LnEHxjYd1T1li-Q&part=snippet%2CcontentDetails
	var options = {
		host: 'www.googleapis.com',
		port: 443,
		method: 'GET',
		path: '/youtube/v3/videos?id='+(videoid.toString())+'&key=AIzaSyBBM2fo32Pzrcf0GHO5LnEHxjYd1T1li-Q&part=snippet%2CcontentDetails%2Cstatus'
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
	var req = https.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log("got data");
			recievedBody += chunk;
		});

		res.on('end', function(){ //7zLNB9z_AI4

			try {
				var vidObj = JSON.parse(recievedBody);
			} catch (e) {
				OK = false;
				console.log("bad json response");
				return;
			}


			if(vidObj && vidObj.items && vidObj.items.length > 0){
				vidObj = vidObj.items[0];
			} else {
				OK = false;
				console.log("bad json response");
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

			console.log("vidObj.status.embeddable",vidObj.status.embeddable);

			var OK = true;
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
						OK = false;
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
						OK = false;
					}
				}
				if(!embeddable) {
					restrictReasons.noembed = true;
					OK = false;
				}
			}

			for(var hasProperties in restrictReasons) break;
			if(hasProperties) {
				socket.emit("videoRestriction", restrictReasons);
			}

			var pos = SERVER.PLAYLIST.length;

			if(OK){

				adminLog(socket, {msg: "Added youtube video "+formattedTitle, type: "playlist"});
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
					if(successCallback)successCallback();
				},function(err){
					if(failureCallback)failureCallback(err);
				})
			}else{
				if(failureCallback)failureCallback();
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
				debugLog('Blew up requesting: ' + res.headers.location + " error: " + e);
				if (failureCallback) failureCallback(e);
			});

		// Otherwise no redirect; capture the response as normal
		} else if(res.statusCode == 200) {
			successCallback(res);
		} else {
			if(failureCallback) failureCallback();
		}
	}).on('error', function(e) {
		debugLog('Blew up requesting: ' + options.path + " error: " + e);
		if(failureCallback) failureCallback(e);
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
		path = '/tracks/'+videoid.substring(2)+'.json?client_id=98e8581d9fc8d2dbb59cb5a785201ffd';
	} else {
		path = '/resolve.json?url='+videoid+'&client_id=98e8581d9fc8d2dbb59cb5a785201ffd';
	}
	var options = {
		host: 'api.soundcloud.com',
		port: 80,
		method: 'GET',
		path: path
	};
	debugLog("Calling soundcloud api: " + path);
	var recievedBody = "";
	followRedirect(options, function(res){
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
			debugLog("soundcloud API response: " + recievedBody);
			adminLog(socket, {msg:"Added SoundCloud video "+jdata.title, type:"playlist"});
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
				if (successCallback)successCallback();
			}, function (err) {
				if (failureCallback)failureCallback(err);
			});
		});
	});
}

function addVideoFile(socket,data,meta,successCallback,failureCallback){
	if (!failureCallback){
		failureCallback = function(){};
	}

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
		adminLog(socket, {msg:"Added file video "+videoid, type:"playlist"});
		var volat = data.volat;
		if(meta.type <= 0) volat = true;
		if(volat === undefined) volat = false;
		const parts = videoid.split('/');
		rawAddVideo({
			pos: SERVER.PLAYLIST.length,
			// Don't collide with vimeo
			videoid: videoid,
			videotitle: encodeURI(parts[parts.length-1]),
			videolength: duration,
			videotype: "file",
			who: meta.nick,
			queue: data.queue,
			volat: volat
		}, function () {
			if (successCallback)successCallback();
		}, function (err) {
			if (failureCallback)failureCallback(err);
		});
	}).catch(err => {
		console.log('duration error', err);
		failureCallback(err);
	});
}

function addVideoDash(socket,data,meta,successCallback,failureCallback){
	if (!failureCallback){
		failureCallback = function(){};
	}

	var videoid = data.videoid.trim();
	if(videoid.length==0)
	{
		failureCallback();
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
			adminLog(socket, {msg:"Added DASH video "+videoid, type:"playlist"});
			var volat = data.volat;
			if(meta.type <= 0) volat = true;
			if(volat === undefined) volat = false;
			const parts = videoid.split('/');
			rawAddVideo({
				pos: SERVER.PLAYLIST.length,
				// Don't collide with vimeo
				videoid: videoid,
				videotitle: encodeURI(data.videotitle || parts[parts.length-1]),
				videolength: duration,
				videotype: "dash",
				who: meta.nick,
				queue: data.queue,
				volat: volat
			}, function () {
				if (successCallback)successCallback();
			}, function (err) {
				if (failureCallback)failureCallback(err);
			});
		}).catch(err => {
			console.log('DASH manifest error', err);
			failureCallback(err);
		});
}

/* Permission Abstractions */
function ifShouldSendVideoData(socket,truecallback,falsecallback){
	socket.get('mode',function(err,type){
		if(
			parseInt(type) == MODE_VIDEOCHAT
		){
			if(truecallback)truecallback();
		}else{
			if(falsecallback)falsecallback();
		}
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
function ifCanVoteOnPoll(socket,truecallback,falsecallback){
	if(truecallback)truecallback();
}
function ifCanCreatePoll(socket,truecallback,falsecallback){
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
function ifCanClosePoll(socket,truecallback,falsecallback){
	ifCanCreatePoll(socket,truecallback,falsecallback);
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
function ifNickFree(nick,truecallback,falsecallback){
	for(var i in SERVER.CHATLIST){
		debugLog(SERVER.CHATLIST[i].nick);
		if(SERVER.CHATLIST[i].nick.toLowerCase() == nick.toLowerCase()){
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
		var ip = getAddress(socket);
		writeToLog("LOGIN FAIL LIMIT", "Too many failed logins for ip: "+ip+" attempted nick: "+data.nick);
		if(falsecallback) falsecallback();
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
		console.log("existing");
		bancheck.duration = existing.duration;
		banUser(bancheck);
		kickUser(socket, "You have been banned.");
	}

	if(
		qnick.match(/^[0-9a-zA-Z_]+$/) != null &&
		qnick.length >= 1  &&
		qnick.length <= 15
	){
		var q = 'select * from users where name = ?'; debugLog(q);
		mysql.query(q, [qnick], function(err, result, fields) {
			if (err) {
				//throw err;
				console.error(err);
				return;
			}
			var ip = getAddress(socket);
			if(!ip){
				if(falsecallback) falsecallback();
				return false;
			}

			// If nobody has already registered the name...
			if(result.length == 0) {
				writeToLog("NAME TAKE",ip+" Claimed Name "+qnick);
				addUserToChat(socket, {nick:qnick,type:-1, meta:{}},truecallback);
			} else if(result.length == 1 && result[0].pass == qpass) {
				// Fix case
				qnick = result[0].name;
				try{
					writeToLog("USER LOGIN",ip+" Logged in As "+qnick);
				}catch(e){}
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
					console.error("Failed to parse user meta: ", e);
					meta = {};
				}
				addUserToChat(socket, {
										nick:qnick,
										type:result[0].type,
										meta:meta
									  },truecallback);
			}else{
				// Don't allow people to spam login attempts
				handleLoginFail(socket);
				debugLog("PW INCORRECT");
				if(falsecallback) falsecallback();
			}
		});
	}else{
		debugLog("ILLEGAL NICK");
		if(falsecallback) falsecallback();
		return;
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
							function(socket){
								debugLog("Ghost busted user: " + data.nick);
								kickUser(socket, "Ghosted");
								successCallback();
							},
							function(){
								successCallback();
							});
}
function getSocketOfNickAndIP(targetnick,targetip,truecallback,falsecallback){
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
						if(nick == targetnick){
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
writeToLog("SERVER ONLINE, BerryTube "+SERVER.settings.core.version);

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
		writeToLog("USER JOIN",ip+" Has Joined. ["+io.sockets.clients().length+"]");
		// Send the SERVER.PLAYLIST, and then the position.
		sendToggleables(socket);
		socket.emit("recvPlaylist",SERVER.PLAYLIST.toArray());
		sendChatList(socket);
		sendDrinks(socket);
		SERVER.POLL.notify(socket, true);
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
				//hotPotatoLeader(socket);
				setBpAsLeader();
			}

			rmUserFromChat(socket);

			SERVER.POLL.unVote(socket,function(){
				socket.get("myvote",function(err,myvote){});
			});

			writeToLog("USER PART:"+ip+" Has Left. ["+(io.sockets.clients().length-1)+"]");
		});
	});

	socket.on("setOverrideCss",function(data){
		ifCanSetOverrideCss(socket,function(){
			adminLog(socket, {msg:"Set CSS override to "+data, type:"site"});
			setOverrideCss(data);
		},function(){
			kickForIllegalActivity(socket,"You cannot set the CSS");
		});
	});
	socket.on("setFilters",function(data){
		ifCanSetFilters(socket,function(){
			adminLog(socket, {msg:'Edited filters', type:"site"});
			SERVER.FILTERS = data;
		},function(){
			kickForIllegalActivity(socket,"You cannot set the Filters");
		});
	});
	socket.on("searchHistory", function(data){
		ifCanSearchHistory(socket, function(){
			var q = "select * from videos_history where videotitle like ? order by date_added desc limit 50";
			mysql.query(q, ['%'+encodeURI(data.search).replace('%', '\\%')+'%'], function(err, result, fields){
				if (err) {
					//throw err;
					console.error(err);
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
		if(!data.videoid.match(/^[a-zA-Z0-9_ \-#]{3,50}$/)){
			console.error('Tried to delete an invalid history id: ' + data.videoid);
			return;
		}
		var q = 'delete from videos_history where videoid = ? limit 1';
		mysql.query(q, [data.videoid], function(err, results, fields){
			if (err) {
				//throw err;
				console.error(err);
				return;
			}
		});
	});
	socket.on("randomizeList",function(data){
		ifCanRandomizeList(socket,function(meta){
			adminLog(socket, {msg:'Randomized playlist', type: "playlist"})
			var newSz = SERVER.PLAYLIST.length;
			var tmp = [];
			var elem = SERVER.PLAYLIST.first;
			for(var i=0;i<newSz;i++){
				tmp.push(elem);
				//debugLog(elem);
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
			setToggleable(socket, tn,ts,function(d){
				sendToggleables(io.sockets);
				//io.sockets.in('admin').emit("setToggleable",d);
			});
		},function(){
			kickForIllegalActivity(socket);
		});
	});
	socket.on('newPoll',function(data){
		ifCanCreatePoll(socket,function(){
			//debugLog("trying to create");
			adminLog(socket, {msg:"Created poll '" + data.title + "'", type:"site"});
			var title = data.title;
			var ops = data.ops;
			var obscure = data.obscure;
			console.log(data);
			SERVER.POLL.newPoll(title,ops,obscure,socket,function(){
				debugLog("Created new poll.");
			});
		},function(){
			debugLog("cannot create")
		});
	});
	socket.on('closePoll',function(data){
		ifCanClosePoll(socket,function(){
			adminLog(socket, {msg: 'Closed poll', type:"site"});
			debugLog("trying to close");
			SERVER.POLL.closePoll(socket,function(){
			debugLog("Closed Poll.");
			});
		},function(){
			debugLog("cannot close")
		});
	});
	socket.on('votePoll',function(data){
		ifCanVoteOnPoll(socket,function(){
			debugLog("trying to vote")
			var op = data.op;
			SERVER.POLL.vote(op,socket,function(){
				socket.get('myvote', function (err, myvote) {
					debugLog("VOTE IS "+myvote+" PLEASE GOD.");
				});
				debugLog("Voted.");
			});
		},function(){
			debugLog("cannot vote")
		});
	});
	socket.on("myPlaylistIsInited",function(data){
		sendStatus("createPlayer",socket);
	});
	socket.on("renewPos",function(data){
		sendStatus("renewPos",socket);
	});
	socket.on("refreshMyVideo",function(data){
		debugLog("Sending Video Refresh");
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
				writeToLog("CHAT",ip+":"+meta.nick+":"+data.msg);
				sendChat(meta.nick,meta.type,data,socket);

			},function(){
				kickForIllegalActivity(socket,"Chat Spam");
			});
		},function(){
			debugLog("Chat Failure");
		});
	});
	socket.on("registerNick", function(data){
		var i = SERVER.RECENTLY_REGISTERED.length;
		var ip = getAddress(socket);
		if(!ip) return false;
		var now = new Date();
		// Backwards to splice on the go
		while(--i >= 0){
			if(now - SERVER.RECENTLY_REGISTERED[i].time > SERVER.settings.core.register_cooldown){
				SERVER.RECENTLY_REGISTERED.splice(i, 1);
			}
			else if(SERVER.RECENTLY_REGISTERED[i].ip == ip) {
				socket.emit("loginError", {message:"You are registering too many usernames, try again later."});
				return;
			}
		}
		if(!data.pass || data.pass.length <= 5){
			socket.emit("loginError", {message:"Invalid password. Must be at least 6 characters long."});
			return;
		}
		if(data.pass!=data.pass2){
			socket.emit("loginError", {message:"Passwords do not match."});
			return;
		}
		if(!data.nick || data.nick.length <= 0 || data.nick.length > 15){
			socket.emit("loginError", {message:"Username must be under 15 characters."});
			return;
		}
		if(!data.nick.match(/^[0-9a-zA-Z_]+$/ig) ){
			socket.emit("loginError", {message:"Username must contain only letters, numbers and underscores."});
			return;
		}
		if(!getToggleable("allowreg")){
			socket.emit("loginError", {message:"Registrations are currently Closed. Sorry for the inconvenience!"});
			return;
		}
		var q = 'select * from users where name like ?'; debugLog(q);
		mysql.query(q, [data.nick], function(err, result, fields) {
			if (err) {
				console.error(err);
				return;
			}
			if(result.length >= 1){
				// Already registered, try logging in using the password we have.
				userLogin(socket, data, function(){
					debugLog("Nick Set = "+data.nick);
				},function(){
					socket.emit("loginError", {message:"Username is already taken!"});
					debugLog("loginError nick already taken.");
				});
			}
			else{
				var pass = crypto.createHash('md5').update(data.pass).digest("hex");
				var q = 'INSERT INTO users (name, pass, type) VALUES (?,?,?)'; debugLog(q);
				mysql.query(q,	[data.nick, pass, 0] , function(err, result, fields){
					if (err) {
						//throw err;
						console.error(err);
						return;
					}
					// Registered, log em in.
					userLogin(socket, data, function(){
						debugLog("Nick Set = "+data.nick);
						SERVER.RECENTLY_REGISTERED.push({ip: ip, time: new Date()});
					},function(){
						debugLog("Error logging in.");
					});
				});
			}

		});
	});
	socket.on("setNick",function(data){
		ghostBustUser(socket, data, function(){
			ifNickFree(data.nick,function(meta){
				userLogin(socket,data,function(){
					debugLog("Nick Set = "+data.nick);
				},function(){
					socket.emit("loginError", {message: "Invalid Login."});
					debugLog("Invalid Login.");
				});
			},function(){
				socket.emit("loginError", {message: "Nick already taken."});
				debugLog("Nick Taken.");
			});
		});
	});
	socket.on("playNext",function(data){
		ifCanControlPlaylist(socket,function(){
			adminLog(socket,{msg:'Skipped Video', type:"playlist"});
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
			adminLog(socket, {msg:'Moved ' + decodeURIComponent(fromelem.videotitle), type:"playlist"});

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

			adminLog(socket, {msg:'Forced video change', type:"playlist"});
			handleNewVideoChange();
			debugLog("Relaying Video Change");
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
	socket.on("addVideo",function(data){
		ifCanControlPlaylist(socket,function(meta){
			console.log(data);
			if(data.videotype == "yt"){
				addVideoYT(socket,data,meta,function(){
					debugLog("Video Added");
				},function(err){
					debugLog(err);
					socket.emit("dupeAdd");
				})
			}
			else if(data.videotype == "vimeo"){
				addVideoVimeo(socket,data,meta,function(){
					debugLog("Video Added");
				},function(err){
					debugLog(err);
					socket.emit("dupeAdd");
				})
			}
			else if(data.videotype == "soundcloud"){
				addVideoSoundCloud(socket,data,meta,function(){
					debugLog("Video Added");
				},function(err){
					debugLog(err);
					socket.emit("dupeAdd");
				});
			}
			else if(data.videotype == "file"){
				addVideoFile(socket,data,meta,function(){
					debugLog("Video Added");
				},function(err){
					debugLog(err);
					socket.emit("dupeAdd");
				});
			}
			else if(data.videotype == "dash") {
				addVideoDash(socket,data,meta,function(){
					debugLog("Video Added");
				},function(err){
					debugLog(err);
					socket.emit("dupeAdd");
				});
			}
			else {
				// Okay, so, it wasn't vimeo and it wasn't youtube, assume it's a livestream and just queue it.
				// This requires a videotitle and a videotype that the client understands.

				adminLog(socket, {msg:'Added livestream ' + data.videotitle, type:"playlist"});
				addLiveVideo(data,meta,function(){
					debugLog("Video Added");
				},function(err){
					debugLog(err);
					socket.emit("dupeAdd");
				})
			}
		},function(){
			kickForIllegalActivity(socket);
		});
	});
	socket.on("importPlaylist",function(data){
		return false;
		ifCanControlPlaylist(socket,function(meta){
			// Prepare your anus.
			var name = meta.nick;
			var plid = data.plid;
			var startIndex=1;
			var maxResults=50;
			var totResults=999;

			var MEDIADONE=[];
			var NEWVIDS = [];
			var MEDIAS = [];
			// first things first. lets find out how long this thing is.
			var options = {
				host: 'gdata.youtube.com',
				port: 80,
				method: 'GET',
				path: '/feeds/api/playlists/'+plid.toString()+'?v=2&max-results=1'
			};
			debugLog(options.path);
			var recievedBody = "";

			var MAINREQ = http.request(options, function(MAINRES) {
				MAINRES.setEncoding('utf8');
				MAINRES.on('data', function (chunk) {
					recievedBody += chunk;
				});
				MAINRES.on('end', function(){ //7zLNB9z_AI4
					totResults = recievedBody.match(/<openSearch:totalResults>(.*?)<\/openSearch:totalResults>/);
					if(totResults != null){
						totResults = parseInt(totResults[1]);
					}else{
						socket.emit("badAdd");
						return;
					}

					// Awesome. now we have the results.
					breakloop = false;
					for(var i=0;i<totResults;i+=maxResults){
						(function(i) { // This will allow each instance to have its own index, regardless of callbacks.
							var recievedBod = "";
							var myStart = (i)+1;
							var options = {
								host: 'gdata.youtube.com',
								port: 80,
								method: 'GET',
								path: '/feeds/api/playlists/'+plid.toString()+'?v=2&max-results='+maxResults+'&start-index='+myStart
							};
							debugLog("("+i+" * "+maxResults+")+1 = "+myStart);
							debugLog("Attempting to get "+myStart+" to "+(myStart+maxResults));
							debugLog(options.host + options.path);

							// Load this SERVER.PLAYLIST chunk.
							var req = http.request(options, function(res) {
								res.setEncoding('utf8');
								res.on('data', function (chunk) {
									recievedBod += chunk; // compile data...
								});
								res.on('end', function(){ //7zLNB9z_AI4
									// Parse the tree.
									var etree = et.parse(recievedBod);
									var YTDETAILS = etree.findall('./entry'); // get all details

									if(YTDETAILS.length > 0){
										for(var i=0; i<YTDETAILS.length;i++){
											var inception = YTDETAILS[i]; // oh god
											for(var j=0; j<inception._children.length; j++){
												var detail = inception._children[j]; // WHY
												if(detail == null) continue;

												if(inception._children[j].tag == "media:group"){
													var deeper = inception._children[j]; // MAKIT STAP
													var NEWVID = new Video();
													var o = new Video();
													o.queue = false;
													debugLog("New vid");
													debugLog(NEWVID);

													for(var k=0; k<deeper._children.length; k++)
													{
														var detail = deeper._children[k];
														if(detail == null) continue;

														if(deeper._children[k].tag == "media:title")
														{
															NEWVID.videotitle = encodeURI(deeper._children[k].text);
														}
														else if(deeper._children[k].tag == "yt:videoid")
														{
															NEWVID.videoid = deeper._children[k].text;
														}
														else if(deeper._children[k].tag == "yt:duration")
														{
															NEWVID.videolength = deeper._children[k].attrib.seconds;
														}

													}

													debugLog(NEWVID);
													MEDIAS[myStart+i-1] = NEWVID;
												}
											}
										}

										// We now have all the media in the video. spruce it up, and add to DB.
										for(var i=0; i<MEDIAS.length;++i)
										{
											//if(typeof MEDIAS[i].videoid === undefined) continue;
											//debugLog("ON ID "+i+" OF "+MEDIAS.length+".");
											// This fucked up thing here lets me pass the current index of the synchronous loop into an asynchronous callback. jesus this shit is complex.
											(function(i) {

												var pos = SERVER.PLAYLIST.length + i;
												var q = 'insert into '+SERVER.dbcon.video_table+' (position, videoid, videotitle, videolength, videovia) VALUES (?,?,?,?,?)'; debugLog(q);
												var qParams = [pos, '' + MEDIAS[i].videoid, MEDIAS[i].videotitle, MEDIAS[i].videolength, name];
												mysql.query(q, qParams, function(err, result, fields) {
													if (err) {
														debugLog(err);
													} else {
														if(SERVER.PLAYLIST.length == 0){
															SERVER.PLAYLIST.append(MEDIAS[i]);
														}else{
															SERVER.PLAYLIST.insertAfter(SERVER.PLAYLIST.last,MEDIAS[i]);
														}

														NEWVIDS[i] = MEDIAS[i].pack();
													}
													// now help clean...
													if(MEDIADONE.indexOf(MEDIAS[i].videoid) == -1)
													{
														MEDIADONE.push(MEDIAS[i].videoid);
													}
													if(MEDIADONE.length == totResults)
													{
														// This should send once for each query, but i cant seem to fidn a way to make it wait properly.
														io.sockets.emit('addPlaylist',{
															videos:NEWVIDS
														});
													}
												});
											})(i);
										}

									}
								});
							});

							//Catch and fire
							req.on('error', function(e) {
								socket.emit("badAdd");
							});

							req.end();
						})(i)
					}
				});
			});

			MAINREQ.on('error', function(e) {
				socket.emit("badAdd");
				debugLog(e);
			});

			MAINREQ.end();
		},function(){

		});
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
			adminLog(socket, {msg:'Gave berry to ' + targetnick, type:"user"});
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
				if (temp) {
					message = "Temporarily shadow banned " + targetNick;
					socket.get('nick', function(err, nick){
						writeToLog("SHADOWBAN TEMP",nick+" sbanned "+targetNick);
					});
				}
				else {
					message = "Shadow banned " + targetNick;
					socket.get('nick', function(err, nick){
						writeToLog("SHADOWBAN PERM",nick+" sbanned "+targetNick);
					});
				}
			}
			else {
				message = "Un-shadow banned " + targetNick;
				socket.get('nick', function(err, nick){
					writeToLog("SHADOWBAN FORGIVE",nick+" un-sbanned "+targetNick);
				});
			}
			adminLog(socket, {msg:message, type:"user"});
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
			getSocketOfNick(targetNick,function(s){
				if(isbanning){
					shadowBanUser(s,temp);
				} else {
					unShadowBanUser(s);
				}
			});
		},function(){
			// Marm: I don't see this function existing anywhere, so I commented it out.
			//banUser(socket); // Nobody plays this game.
			shadowBanUser(socket); // Nobody plays this game.
			kickForIllegalActivity(socket);
		})
	});
	socket.on("setAreas",function(data){
		ifCanSetAreas(socket,function(){
			areaname = data.areaname;
			content = data.content;
			adminLog(socket, {msg:"Edited "+areaname, type:"site"});
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
						var q = "select meta from users where name = ?";
						mysql.query(q, [d.nick], function(err, result, fields) {
							if (err) {
								//throw err;
								console.error(err);
								return;
							}
							if(result.length == 1) {
								var meta = {};
								try {
									if(result[0].meta)
										meta = JSON.parse(result[0].meta) || {};
								} catch(e){
									console.error("Failed to parse user meta: ", e);
									meta = {};
								}
								meta.note = d.note;
								q = "update users set meta = ? where name = ?";
								mysql.query(q, [JSON.stringify(meta), d.nick], function(err, result, fields) {
									if (err) {
										//throw err;
										console.error(err);
										return;
									}
									for(var i=0;i<SERVER.CHATLIST.length;i++) {
										if(SERVER.CHATLIST[i].nick == d.nick){
											SERVER.CHATLIST[i].meta = meta;
											break;
										}
									}
									adminLog(socket, {msg: "Set "+d.nick+"'s note to '"+d.note+"'", type:"user"});
									forModminSockets(function(sc){
										sc.emit('fondleUser', data);
									});
									//io.sockets.in('admin').emit('fondleUser', data);
								});
							}
						});
					}
				},function(){
					kickForIllegalActivity(socket,"You cannot do that");
				});
			}
		}
	});
	if (new Date() < new Date("Wed, 2 Apr 2014 00:00:00 EDT")) { // Don't Register Socket event after April Fools 2014
		socket.on("activateGold",function(){
			if (new Date() < new Date("Wed, 2 Apr 2014 00:00:00 EDT")) { // Even registered, Don't do anything.
				//console.log("wat");
				socket.get("nick",function (err, nick){
					//console.log(nick);
					socket.set("gold",true,function (err, val){
						for(var i=0;i<SERVER.CHATLIST.length;i++) {
							//console.log(SERVER.CHATLIST[i].nick);
							if(SERVER.CHATLIST[i].nick == nick){
								SERVER.CHATLIST[i].gold = true;
								//console.log(SERVER.CHATLIST[i]);
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
	socket.on("crash",function(data){
		//socket.emit(socket);
	});
	socket.on("error",function(err){
		console.error('Socket error:');
		console.error(err);
	});
});
/* vim: set noexpandtab : */
