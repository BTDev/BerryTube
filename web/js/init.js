'what up';
var DEBUG = false;
if(typeof localStorage != "undefined"){
    DEBUG = localStorage.getItem('BT_DEBUG') === "true";
}
function dbg(anything) { if(DEBUG) console.debug(anything); }

// VIDEO OBJECT
function Video() {}
Video.prototype = {
	videoid : null,
	videolength : null,
	videotitle : null,
	videotype : null,
	volat : false,
	meta : null,
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
		meta : this.meta
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
		//console.log(elem);
		out.push(elem.pack());
		elem=elem.next;
	}
	dbg(out);
	return out;
};

var btEvents = (function(){

  var self = {};
  var hooks = {};

  self.on = function(evt,fn,once){
    once = !!once || false;
    hooks[evt] = hooks[evt] || [];
    hooks[evt].push({fn:fn,once:once});
  }

  self.once = function(evt,fn){
    return self.on(evt,fn,true);
  }

  self.emit = function(evt,data){
    hooks[evt] = hooks[evt] || [];
    for(var i=hooks[evt].length -1; i >= 0; i -= 1){
      var hook = hooks[evt][i];
      if(hook.fn){ hook.fn(data); }
      if(hook.once === true){
        hooks[evt].splice(i,1);
      }
    }
  }

  Object.freeze(self);

  return self;

})();

var PLAYER = false;
var LEADER = false;
var ADMIN = false;
var MOD = false;
var NAME = false;
var TIME = new Date();
var TYPE = -1;
var CHATLIST = {};
var TOGGLEABLES = {};
var IGNORELIST = [];
var CONNECTED = 0;
var PLAYLIST = new LinkedList.Circular();
var ACTIVE = new Video();
var PLAYING_VID;
var HB_DELAY = 5000;
var leaderHeartbeat = false;
var PLAYLIST_DRAGFROM=0;
var PLAYLIST_DRAGTO=0;
var PLAYLIST_DRAGSANITY = '';
var LEGACY_PLAYER = false;
var INIT_TIME=0;
var SEEK_FROM=0;
var SEEK_TO=0;
var HISTORY = [];
var FLAIR_OPTS = [];
var HISTORY_POS = 0;
var HISTORY_SIZE = 50;
var LAST_EMIT_STATE=-1;
var WINDOW_FOCUS = false;
var CHAT_NOTIFY = false;
var VIDEO_TYPE = false;
var MY_FLAIR_ID = 0;
var DRINKS = 0;
var LAST_SEND_TIME=false;
var NOTIFY_TITLE = "Chat!";
var NOTIFY = window.NOTIFY || new Audio(CDN_ORIGIN + "/sounds/notify.wav"); // buffers automatically when created
var DRINK = window.DRINK || new Audio(CDN_ORIGIN + "/sounds/drink.wav"); // buffers automatically when created
var ATTENTION = window.ATTENTION || new Audio(CDN_ORIGIN + "/sounds/attention.wav"); // [](/shift6)
var MONITORED_VIDEO = null;
var KEEP_BUFFER = true;
var RCV_HOLDTIME = 1000 * 30;
var FILTERS = false;
var BANLIST = false;
var PLUGINS = [];
var NAMEFLAUNT = false;
var VOLUME = false;
var PLAYERS = {};
var IGNORE_GHOST_MESSAGES = false;
var ADMIN_LOG = [];
var HIGHLIGHT_LIST = [];
var ACTIVE_CHAT = 'main';
var MAIN_NOTIFY = false;
var ADMIN_NOTIFY = false;
var LAST_QUEUE_ATTEMPT = null;
var POLL_TITLE_FORMAT = '';
var POLL_OPTIONS = [];
var DEBUG_DUMPS = [];

(function() {
	// This isn't 100% necessary, but it keeps things a bit tidier by not making storedList global
	var storedList = localStorage.getItem('highlightList');
	if (storedList != null) {
		var storedListArray = storedList.split(';');
		for (var i in storedListArray) {
			if (storedListArray[i].length > 0) {
				HIGHLIGHT_LIST.push(storedListArray[i]);
			}
		}
	}
})();

try {
	const stored = localStorage.getItem('ignoreList');
	if (stored) {
		IGNORELIST = JSON.parse(stored);
	} else {
		localStorage.setItem('ignoreList', JSON.stringify([]));
	}
} catch(e) {
	console.log('invalid stored ignoreList', e);
}

try{
	window.socket = io.connect(SOCKET_ORIGIN, {
		'connect timeout': 4500 + Math.random() * 1000,
		'reconnect': true,
		'reconnection delay': 500 + Math.random() * 1000,
		'reopen delay': 500 + Math.random() * 1000,
		'max reconnection attempts': 10
	});

	window.socket.on('error', function (reason){
		if(reason == "handshake error") {
			window.location = "ban.php";
		} else {
			$(function() {
				var AWSHIT = $("<center><h1>Unable to connect Socket.IO: "+reason+"</h1></center>").prependTo(document.body);
			});
			console.error(reason);
		}
	});
} catch(e) {
	$(function() {
		var debugging = $("<center><h3>"+e+"</h3></center>").prependTo(document.body);
		var AWSHIT = $("<center><h1>Aw shit! Couldn't connect to the server!</h1></center>").prependTo(document.body);
	});
	console.error(e);
}

function addColorTag(entry,elem){
	if("colorTag" in elem.meta){
		var v = false;
		if("colorTagVolat" in elem.meta){ v = elem.meta.colorTagVolat; }
		_setVidColorTag(entry,elem.meta.colorTag,v);
	}
}
function addTitle(entry,elem){
	var title = $("<div/>").appendTo(entry);
	title.text(decodeURI(elem.videotitle).replace(/&amp;/g, '&'));
	title.addClass('title');
}
function addTime(entry,elem){
	var time = $("<div/>").appendTo(entry);
	var seconds = elem.videolength;
	time.text(secToTime(seconds));
	time.addClass('time');
}
function addDelete(entry){
	if(canDeleteVideo() && $('> .delete', entry).length == 0) {
		var delbtn = $("<div/>").prependTo(entry);
		delbtn.text("X");
		delbtn.addClass('delete');
		delbtn.confirmClick(function(){
			doDelete(entry);
		});
		delbtn.mousedown(function(e) {
			e.stopPropagation();
			e.preventDefault();
		});
	}
}
function doDelete(entry){
	if(canDeleteVideo())
	{
		var index = $(entry).index();
        var id = $(entry).data('plobject').videoid;
        var data = { index:index, sanityid:id };
		dbg("delVideo", data);
		socket.emit("delVideo", data);
	}
}
function addRequeue(entry){
	if(controlsPlaylist() && $('> .requeue', entry).length == 0) {
		var qbtn = $("<div/>").prependTo(entry);
		qbtn.text("Q");
		qbtn.addClass('requeue');
		qbtn.click(function(){
			doRequeue(entry);
		});
		qbtn.mousedown(function(e) {
			e.stopPropagation();
			e.preventDefault();
		});
	}
}
function doRequeue(entry){
	if(getVal("sorting") == true) return;
	setVal("sorting",true)
	console.log("Called doRequeue()");
	if(controlsPlaylist())
	{
		var from = $(entry).index();
		var to = ACTIVE.domobj.index();
        var id = $(entry).data('plobject').videoid;

		if(from > to) to++;

		var data = {
			from: from,
			to: to,
            sanityid: id
		}
		dbg(data);
		socket.emit("sortPlaylist",data);
	}
	setVal("sorting",false)
}
function addVolatile(entry){
	if(canToggleVolatile() && $('> .setVolatile', entry).length == 0){
		var qbtn = $("<div/>").prependTo(entry);
		qbtn.text("V");
		qbtn.addClass('setVolatile');
		qbtn.click(function(){
			doVolatile(entry);
		});
	}
}
function doVolatile(entry){
	if(canToggleVolatile()) {
		var pos = $(entry).index();
		var volat = true;
        var id = $(entry).data('plobject').videoid;
		if(entry.hasClass("volatile")){
			volat=false;
		}
		var data = {
			action: "setVolatile",
			info:{
				pos:pos,
				volat:volat
			},
            sanityid: id
		}
		dbg(data);
		socket.emit("fondleVideo",data);
	}
}
function doColorTag(entry,tag,volat){
	if(canColorTag()) {
		if (window.SHITPOST_SKITTLE) {
			tag = window.SHITPOST_SKITTLE;
			delete window.SHITPOST_SKITTLE;
		}
		var pos = $(entry).index();
        var id = $(entry).data('plobject').videoid;
		var data = {
			action: "setColorTag",
			info:{
				pos:pos,
				tag:tag,
				volat:volat
			},
            sanityid: id
		}
		dbg(data);
		socket.emit("fondleVideo",data);
	}
}
function sortUserList(){
	var mylist = $('#chatlist ul');

	var listitems = mylist.children('li.admin').get();
	listitems.sort(function(a, b) {
	   return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
	})
	$.each(listitems, function(idx, itm) { if($(itm).data('nick') != NAME) mylist.append(itm); });

	var listitems = mylist.children('li.user.gilded, li.assistant.gilded').get();
	listitems.sort(function(a, b) {
	   return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
	})
	$.each(listitems, function(idx, itm) { if($(itm).data('nick') != NAME) mylist.append(itm); });

	var listitems = mylist.children('li.user.leader, li.assistant.leader').get();
        listitems.sort(function(a, b) {
           return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
        })
        $.each(listitems, function(idx, itm) { if($(itm).data('nick') != NAME) mylist.append(itm); });

	var listitems = mylist.children('li.user:not(.gilded,.leader), li.assistant:not(.gilded,.leader)').get();
	listitems.sort(function(a, b) {
	   return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
	})
	$.each(listitems, function(idx, itm) { if($(itm).data('nick') != NAME) mylist.append(itm); });

	var listitems = mylist.children('li.anon').get();
	listitems.sort(function(a, b) {
	   return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
	})
	$.each(listitems, function(idx, itm) { if($(itm).data('nick') != NAME) mylist.append(itm); });

	var listitems = mylist.children('li.nobody').get();
	listitems.sort(function(a, b) {
	   return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
	})
	$.each(listitems, function(idx, itm) { if($(itm).data('nick') != NAME) mylist.append(itm); });

	dbg("sorting");
}

function showLogMenu(on){
	var settWin = $("body").dialogWindow({
		title:"Berrytube Log",
		uid:"logmenu",
		center:true
	});

	var filters = $('<fieldset id="logFilters"/>').appendTo(settWin);
	$('<legend/>').appendTo(filters).text("Search Filters");

	var nickFilter = $('<select id="logNickFilter"/>').appendTo(filters);
	$('<option/>').text('All modmins').appendTo(nickFilter);
	$('<option/>').text('Berry').appendTo(nickFilter);
	$('<option/>').text('Server').appendTo(nickFilter);
	nickFilter.change(function() {
		filterAdminLog();
	});

	var typeFilter = $('<select id="logTypeFilter"/>').appendTo(filters);
	$('<option/>').text('All types').appendTo(typeFilter);
	$('<option/>').text('site').appendTo(typeFilter);
	$('<option/>').text('user').appendTo(typeFilter);
	$('<option/>').text('playlist').appendTo(typeFilter);
	typeFilter.change(function() {
		filterAdminLog();
	});

	var logBuffer = $(`
		<div>
			<table>
				<thead>
					<tr>
						<th>modmin</th>
						<th>time</th>
						<th>event</th>
						<th>message</th>
						<th>type</th>
					</tr>
				</thead>
				<tbody />
			</table>
		</div>`).attr('id','logBuffer')
		.appendTo(settWin);

    for(var i=0; i < ADMIN_LOG.length; ++i){
        addLogMsg(ADMIN_LOG[i], logBuffer);
    }

	settWin.resizable({ handles:'e' });
	settWin.css('min-width', '400px');
	settWin.window.center();
}

function migrateFrom(url) {
	for (const key of Object.keys(localStorage)) {
        if (localStorage.hasOwnProperty(key))
            localStorage.removeItem(key);
    }
	document.cookie = 'bt-migrated=0; path=/; domain=.' + location.hostname + '; max-age=2147483647';
	window.location = url + '/api/migrate_page.html';
}

function showConfigMenu(on){

	/*
	if($("#settingsGui").length > 0){
		$("#settingsGui").hide("blind",function(){
			$(this).remove();
		})
		return;
	}
	*/
	// Position this beast.
	var settWin = $("body").dialogWindow({
		title:"BerryTube Settings",
		uid:"configmenu",
		center:true,
		scrollable:true
	});

	var cmds = $("<div/>").attr('id','settingsGui').prependTo(settWin)
	var optWrap = $("<ul/>").prependTo(cmds);

	var configOps = $('<fieldset/>').appendTo($('<li/>').appendTo(optWrap));
	$('<legend/>').appendTo(configOps).text("User Options");
	//----------------------------------------
	var row = $('<div/>').appendTo(configOps);
	$('<span/>').text("Sync video:").appendTo(row);
	var syncOnOff = $('<input/>').attr('type','checkbox').appendTo(row);
	if(getStorage('syncAtAll') == 1) syncOnOff.prop('checked', true);
	syncOnOff.change(function(){ //
		if($(this).is(":checked")){
			setStorage('syncAtAll',1);
		} else {
			setStorage('syncAtAll',0);
		}
	});
	//----------------------------------------
	var row = $('<div/>').appendTo(configOps);
	$('<span/>').text("Sync within").appendTo(row);
	var syncAccuracy = $('<input/>').attr('type','text').val(getStorage('syncAccuracy')).addClass("small").appendTo(row);
	syncAccuracy.keyup(function(){ //
		setStorage('syncAccuracy',parseInt(syncAccuracy.val()))
	});
	$('<span/>').text("seconds.").appendTo(row);
	//----------------------------------------
	var row = $('<div/>').appendTo(configOps);
	$('<span/>').text("Enable notify sound:").appendTo(row);
	var notifyMute = $('<input/>').attr('type','checkbox').appendTo(row);
	if(getStorage('notifyMute') == 0) notifyMute.prop('checked', true);
	notifyMute.change(function(){ //
		if($(this).is(":checked")){
			setStorage('notifyMute',0)
		} else {
			setStorage('notifyMute',1)
		}
	});
	//----------------------------------------
	var row = $('<div/>').appendTo(configOps);
	$('<span/>').text("Enable drink sound:").appendTo(row);
	var notifyDrink = $('<input/>').attr('type','checkbox').appendTo(row);
	if(getStorage("drinkNotify") == 1) {	notifyDrink.prop('checked', true); }
	notifyDrink.change(function(){ //
		if($(this).is(":checked")){
			setStorage("drinkNotify",1);
		} else {
			setStorage("drinkNotify",0);
		}
	});
	//----------------------------------------
	var row = $('<div/>').appendTo(configOps);
	$('<span/>').text("Use alternate video player:").appendTo(row);
	var useLegacyPlayer = $('<input/>').attr('type','checkbox').appendTo(row);
	if(getStorage("legacyPlayer") == 1) {useLegacyPlayer.prop('checked', true); }
	useLegacyPlayer.change(function(){ //
		if($(this).is(":checked")){
			setStorage('legacyPlayer',1)
		} else {
			setStorage('legacyPlayer',0)
		}
	});
	//----------------------------------------
	var row = $('<div/>').appendTo(configOps);
	$('<span/>').text("Show timestamps in chat:").appendTo(row);
	var showChatTimestamps = $('<input/>').attr('type','checkbox').appendTo(row);
	if(getStorage("showTimestamps") == 1) {showChatTimestamps.prop('checked', true); }
	showChatTimestamps.change(function(){ //
		if($(this).is(":checked")){
			$('body').addClass('showTimestamps');
			setStorage('showTimestamps',1)
		} else {
			$('body').removeClass('showTimestamps');
			setStorage('showTimestamps',0)
		}
	});
	//----------------------------------------
	var row = $('<div/>').appendTo(configOps);
	$('<span/>').text("Show flair in chat:").appendTo(row);
	var showChatFlair = $('<input/>').attr('type','checkbox').appendTo(row);
	if(getStorage("showChatflair") == 1) {showChatFlair.prop('checked', true); }
	showChatFlair.change(function(){
		if($(this).is(":checked")){
			$('body').removeClass('hideChatFlair');
			setStorage('showChatflair',1)
		} else {
			$('body').addClass('hideChatFlair');
			setStorage('showChatflair',0)
		}
	});
	//----------------------------------------
	var row = $('<div/>').appendTo(configOps);
	$('<span/>').text("Playlist follows active video:").appendTo(row);
	var plFolAcVid = $('<input/>').attr('type','checkbox').appendTo(row);
	if(getStorage("plFolAcVid") == 1) plFolAcVid.prop('checked', true);
	plFolAcVid.change(function(){ //
		if($(this).is(":checked")){
			setStorage('plFolAcVid',1)
		} else {
			setStorage('plFolAcVid',0)
		}
	});
	//----------------------------------------
	var row = $('<div/>').appendTo(configOps);
	$('<span/>').text("Keep").appendTo(row);
	var keepPolls = $('<input/>').attr('type','text').val(getStorage("keeppolls")).addClass("small").appendTo(row);
	keepPolls.keyup(function(){ //
		setStorage('keeppolls',parseInt(keepPolls.val()))
	});
	$('<span/>').text("old polls.").appendTo(row);
	//----------------------------------------
	var row = $('<div/>').appendTo(configOps);
	$('<span/>').text("Select theme:").appendTo(row);
	var themeSelect = $('<select/>').appendTo(row);

	var themes = [];
	var found = false;
	themes.push({name:"Berry Punch",path:""});
	themes.push({name:"Luna",path:"css/colors-woona.css"});
	themes.push({name:"Appleoosa",path:"css/colors-appleoosans.css"});
	themes.push({name:"Holiday",path:"css/colors-holiday.css"});
	for(var i=0;i<themes.length;i++){
		var opt = $("<option/>").appendTo(themeSelect).data("css",themes[i].path).text(themes[i].name);
		if( themes[i].path == getStorage("siteThemePath") ){
			opt.prop('selected',true);
			found = true;
		}
	}
	if(!found && typeof getStorage("siteThemePath") != "undefined"){
		$("<option/>").appendTo(themeSelect).data("css",getStorage("siteThemePath")).text("3rd Party Theme").prop('selected', true);
	}
	themeSelect.change(function(){
		var cssPath = themeSelect.find(":selected").data("css");
		setColorTheme(cssPath);
	});
	//----------------------------------------
	var row = $('<div/>').appendTo(configOps);
	$('<span/>').text("Night mode (for select themes):").appendTo(row);
	var nightMode = $('<input/>').attr('type','checkbox').appendTo(row);
	if(getStorage("nightMode") == 1) nightMode.prop('checked', true);
	nightMode.change(function(){ //
		if($(this).is(":checked")){
			setStorage('nightMode',1);
			$('body').addClass('night');
		} else {
			setStorage('nightMode',0);
			$('body').removeClass('night');
		}
	});
	//----------------------------------------
	var row = $('<div/>').appendTo(configOps);
	var showSqueesBtn = $('<div/>').appendTo(row).addClass('button');
	var showSqueesBtn_label = $('<span/>').appendTo(showSqueesBtn).text("Manage custom squees");
	showSqueesBtn.click(showCustomSqueesWindow);
	//----------------------------------------
	var row = $('<div/>').appendTo(configOps);
	var showSqueesBtn = $('<div/>').appendTo(row).addClass('button');
	var showSqueesBtn_label = $('<span/>').appendTo(showSqueesBtn).text("Manage 3rd-party plugins");
	showSqueesBtn.click(showPluginWindow);
	//----------------------------------------
	var row = $('<div/>').appendTo(configOps);
	var showIgnoreDialogBtn = $('<div/>').appendTo(row).addClass('button');
	var showIgnoreDialogBtn_label = $('<span/>').appendTo(showIgnoreDialogBtn).text("Manage ignored users");
	showIgnoreDialogBtn.click(showIgnoreDialog);
	//----------------------------------------
	/*var migrateOps = $('<fieldset/>').appendTo($('<li/>').appendTo(optWrap));
	$('<legend/>').appendTo(migrateOps).text("Import settings");
	var row = $('<div/>').appendTo(migrateOps);
	$('<span/>').appendTo(migrateOps).html("Click a button to copy (most of)<br />your settings onto the new server:");
	var row = $('<div/>').appendTo(migrateOps);
	var migrateBtn = $('<div/>').appendTo(row).addClass('button');
	var migrateBtn_label = $('<span/>').appendTo(migrateBtn).html("Copy from old <b>" + location.hostname + "</b>");
	migrateBtn.click(() => migrateFrom(OLD_ORIGIN));
	var row = $('<div/>').appendTo(migrateOps);
	var migrateWwwBtn = $('<div/>').appendTo(row).addClass('button');
	var migrateWwwBtn_label = $('<span/>').appendTo(migrateWwwBtn).html("Copy from old <b>www." + location.hostname + "</b>");
	migrateWwwBtn.click(() => migrateFrom(OLD_ORIGIN_WWW));*/
	//----------------------------------------
	if(TYPE >= 1){
		var modOps = $('<fieldset/>').appendTo($('<li/>').appendTo(optWrap));
		$('<legend/>').appendTo(modOps).text("+Options").addClass("mod");

		// Show Hidden
		var row = $('<div/>').appendTo(modOps);
		$('<span/>').text("Show Shadowban Chatter:").appendTo(row);
		var showShadowChatter = $('<input/>').attr('type','checkbox').appendTo(row);
		if(getStorage("sbchatter") == 1) showShadowChatter.prop('checked', true);
		showShadowChatter.change(function(){ //
			if($(this).is(":checked")){
				$('body').addClass('showSBChatter');
				setStorage('sbchatter',1)
			} else {
				$('body').removeClass('showSBChatter');
				setStorage('sbchatter',0)
			}
		});

		if(TYPE >= 2){

			for(var i in TOGGLEABLES){
				(function(i){
					var row = $('<div/>').appendTo(modOps);
					$('<span/>').text("Toggle: "+TOGGLEABLES[i].label).appendTo(row);
					var flutterYays = $('<input/>').attr('type','checkbox').addClass('tgl-'+i).appendTo(row);
					if(TOGGLEABLES[i].state) {
						flutterYays.prop('checked', true);
					}
					flutterYays.click(function(event){
						event.stopPropagation();
						if($(this).is(":checked")){
							socket.emit("setToggleable",{name:i,state:true});
						} else {
							socket.emit("setToggleable",{name:i,state:false});
						}
						return false;
					});
				})(i);
			}

			// Filter window
			var row = $('<div/>').appendTo(modOps);
			var showFilterBtn = $('<div/>').appendTo(row).addClass('button');
			var showFilterBtn_label = $('<span/>').appendTo(showFilterBtn).text("Show Filter Menu");
			showFilterBtn.click(function(){
				showAdminFilterWindow();
			});

			// Ban list
			var row = $('<div/>').appendTo(modOps);
			var showBanlistBtn = $('<div/>').appendTo(row).addClass('button');
			var showBanlistBtn_label = $('<span/>').appendTo(showBanlistBtn).text("Show Ban List");
			showBanlistBtn.click(function(){
				showBanlistWindow();
			});

		}
	}
	//----------------------------------------
	if(TYPE >= 2){
		var adminOps = $('<fieldset/>').appendTo($('<li/>').appendTo(optWrap));
		$('<legend/>').appendTo(adminOps).text("Admin Options").addClass("admin");

		// Filter window
		var row = $('<div/>').appendTo(adminOps);
		var showCssBtn = $('<div/>').appendTo(row).addClass('button');
		var showCssBtn_label = $('<span/>').appendTo(showCssBtn).text("Show CSS Menu");
		showCssBtn.click(function(){
			showCssOverrideWindow();
		});

	}

	settWin.window.center();
}
function showUserActions(who){

	var who = $(who);
	var target = who.data('nick');

	// Position this beast.
	var cmds = $("body").dialogWindow({
		title:"User Menu",
		uid:"usermenu",
		offset:who.offset(),
		toolBox:true
	});

	var name = $('<h1/>').text(target).appendTo(cmds);
	var optWrap = $("<ul/>").attr('id','userOps').appendTo(cmds);

	if(canMoveBerry() && (!LEADER || target != NAME)){
		var option = $('<li/>').text("Give berry").addClass('btn').appendTo(optWrap);
		option.click(function(){
			socket.emit("moveLeader",target);
			cmds.window.close();
		})
	}
	if(LEADER && target == NAME){
		var option = $('<li/>').text("Give server berry").addClass('btn').appendTo(optWrap);
		option.click(function(){
			socket.emit("moveLeader",false);
			cmds.window.close();
		})
	}
	if(canKickUser() && target != NAME){
		var option = $('<li/>').text("Kick user").addClass('btn').appendTo(optWrap);
		option.click(function(){
			socket.emit("kickUser", { nick:target });
			cmds.window.close();
		})
	}
	if(IGNORELIST.indexOf(target) == -1 && target != NAME){
		var option = $('<li/>').text("Ignore user").addClass('btn').appendTo(optWrap);
		option.click(function(){
			IGNORELIST.push(target);
			localStorage.setItem('ignoreList', JSON.stringify(IGNORELIST));
			who.addClass('ignored');
			cmds.window.close();
		})
	}
	if(IGNORELIST.indexOf(target) != -1 && target != NAME){
		var option = $('<li/>').text("Unignore user").addClass('btn').appendTo(optWrap);
		option.click(function(){
			IGNORELIST.splice(IGNORELIST.indexOf(target),1);
			localStorage.setItem('ignoreList', JSON.stringify(IGNORELIST));
			who.removeClass('ignored');
			cmds.window.close();
		})
	}

	if(canShadowBan() && target != NAME){
		var ban = $('<li/>').text("Shadowban").addClass('btn').appendTo(optWrap);
		ban.click(function(){
			socket.emit("shadowBan",{nick:target,sban:true,temp:false});
			cmds.window.close();
		})
	}

	if(canTempShadowBan() && target != NAME){
		var tban = $('<li/>').text("Temp shadowban").addClass('btn').appendTo(optWrap);
		var uban = $('<li/>').text("Unshadowban").addClass('btn').appendTo(optWrap);
		tban.click(function(){
			socket.emit("shadowBan",{nick:target,sban:true,temp:true});
			cmds.window.close();
		})
		uban.click(function(){
			socket.emit("shadowBan",{nick:target,sban:false,temp:false});
			cmds.window.close();
		})
	}

	if (canBan() && target != NAME) {
		var ban = $('<li/>').text("Ban").addClass('btn').appendTo(optWrap);
		ban.click(function() {
			showBanDialog(target);
			cmds.window.close();
		});
	}

	if (TYPE >= 1 && target != NAME && !who.hasClass('anon')) {
		var edit = $('<li/>').text("Edit note").addClass('btn').appendTo(optWrap);
		edit.click(function() {
			showEditNote(target);
			cmds.window.close();
		});
	}

	var aliases = who.data('aliases');
	if (aliases !== undefined) {
		$('<h2/>').text('Recent Aliases').appendTo(cmds);
		var aliasList = $('<ul id="userAliases"/>').appendTo(cmds);
		for (var i in aliases) {
			$('<li/>').text(aliases[i]).appendTo(aliasList);
		}
	}
}
function showEditNote(nick) {
	var parent = $("body").dialogWindow({
		title:"Edit Note",
		uid:"editnote",
		center:true
	});

	var mainOptWrap = $('<div/>').appendTo(parent).addClass('controlWindow');
	$('<p>').appendTo(mainOptWrap).text("Editing note for " + nick + ":").css("width", "300px");
	var input = $('<textarea>').appendTo(mainOptWrap).css("width", "300px").attr('rows', 20).val($('#chatlist li.' + nick).data('note'));
	var buttonDiv = $('<div/>').css("text-align", "center").appendTo(mainOptWrap);
	var cancelBtn = $('<div/>').addClass('button').appendTo(buttonDiv);
	$('<span/>').appendTo(cancelBtn).text("Cancel");
	cancelBtn.click(function(){
		parent.window.close();
	});
	var saveBtn = $('<div/>').addClass('button').appendTo(buttonDiv);
	$('<span/>').appendTo(saveBtn).text("Save");
	saveBtn.click(function(){
		socket.emit('fondleUser', {
			action:'setUserNote',
			info: {
				nick:nick,
				note:input.val()
			}
		});
		parent.window.close();
	});

	parent.window.center();
}
function addUser(data, sortafter){
	whenExists('#chatlist ul',function(chatul){
		var nick = data.nick;
		var type = data.type;
		var shadowbanned = data.shadowbanned;
		var ip = ((TYPE >= 1 && data.meta !== undefined) ? data.meta.ip : false);

		var newusr = $('<li/>').append($('<span/>').addClass('chatlistname').text(nick)).data('nick',nick).show("blind").appendTo(chatul).addClass(nick);
		if (nick == NAME) {
			newusr.addClass("me");
		} else if (IGNORELIST.indexOf(nick) != -1) {
			newusr.addClass("ignored");
		}
		if (shadowbanned) {
			newusr.addClass('sbanned');
		}
		if (data.gold) {
			newusr.addClass('gilded');
		}
		switch(type){
			case -1: newusr.addClass("anon"); break;
			case 0: newusr.addClass("user"); break;
			case 1: newusr.addClass("assistant"); break;
			case 2: newusr.addClass("admin"); break;
		}
		if (type != -2) {
			CHATLIST[nick] = 0;

			// Attach Actions
			newusr.click(function(){
				showUserActions($(this));
			});
			newusr.contextmenu(function(){
				showUserActions($(this));
				return false;
			});
		}
		if (data.meta !== undefined) {
			newusr.attr('ip', data.meta.ip);
			updateUserAliases(data.meta.ip, data.meta.aliases);
			updateUserNote(data.nick, data.meta.note);
		}
		if (sortafter){
			sortUserList();
		}
	});
}
function updateUserAliases(ip, aliases) {
	$('#chatlist li[ip="' + ip + '"]').data('aliases', aliases);
}
function updateUserNote(nick, note) {
	if (note === undefined) {
		note = '';
	}
	var elem = $('#chatlist li.' + nick);
	elem.data('note', note).attr('title', note);
	if (note.length > 0) {
		elem.addClass('note');
	}
	else {
		elem.removeClass('note');
	}
}
function rmUser(nick){
    var o = $('#chatlist ul li.'+nick);
    if(o.length > 0){
        $(o[0]).remove();
        delete CHATLIST[nick];
    };
    sortUserList();
}
function addVideoControls(entry,optionList){
	// Volatile Button
	if(canToggleVolatile()){
		var optBtn = $("<div/>").addClass("button").appendTo($("<li/>").appendTo(optionList));
		$("<span/>").text("Toggle Volatile").appendTo(optBtn);
		optBtn.click(function(){
			doVolatile(entry);
		});
	}
	// Jump to Button
	if(controlsPlaylist() && $(entry).data("plobject") != ACTIVE){
		var optBtn = $("<div/>").addClass("button").appendTo($("<li/>").appendTo(optionList));
		$("<span/>").text("Jump to Video").appendTo(optBtn);
		optBtn.confirmClick(function(){
			doPlaylistJump(entry);
		});
	}
	// Skip Button
	if(controlsPlaylist() && $(entry).data("plobject") == ACTIVE){
		var optBtn = $("<div/>").addClass("button").appendTo($("<li/>").appendTo(optionList));
		$("<span/>").text("Skip Video").appendTo(optBtn);
		optBtn.click(function(){
			videoPlayNext();
		});
	}

	// Open video on [player] button
	if($(entry).data("plobject").videotype == "yt"){
		var optBtn = $("<div/>").addClass("button").appendTo($("<li/>").appendTo(optionList));
		$("<span/>").text("Open on YouTube").appendTo(optBtn);
		optBtn.click(function(){
			var vid = $(entry).data("plobject").videoid;
			window.open('http://youtu.be/'+vid,'_blank');
		});
	}
    else if($(entry).data("plobject").videotype == "vimeo"){
        var optBtn = $("<div/>").addClass("button").appendTo($("<li/>").appendTo(optionList));
        $("<span/>").text("Open on Vimeo").appendTo(optBtn);
        optBtn.click(function(){
            var vid = $(entry).data("plobject").videoid;
            window.open('http://vimeo.com/'+vid,'_blank');
        });
    }
    else if($(entry).data("plobject").videotype == "soundcloud"){
        var optBtn = $("<div/>").addClass("button").appendTo($("<li/>").appendTo(optionList));
        $("<span/>").text("Open on SoundCloud").appendTo(optBtn);
        optBtn.click(function(){
            var vid = $(entry).data("plobject").meta.permalink;
			if (vid) {
				window.open(vid, '_blank');
			}
        });
    }
    else if($(entry).data("plobject").videotype == "dm"){
        var optBtn = $("<div/>").addClass("button").appendTo($("<li/>").appendTo(optionList));
        $("<span/>").text("Open on DailyMotion").appendTo(optBtn);
        optBtn.click(function(){
			var vid = $(entry).data("plobject").videoid.substr(2);
			window.open('http://www.dailymotion.com/video/' + vid, '_blank');
        });
    }

	// Video end notification
	if ($(entry).data('plobject') == ACTIVE) {
		var optBtn = $('<div/>').addClass('button').appendTo($('<li/>').appendTo(optionList));
		$('<span/>').text('Toggle video end notification').appendTo(optBtn);
		optBtn.click(function(){
			if (MONITORED_VIDEO != null) {
				ACTIVE.domobj.removeClass('notify');
				MONITORED_VIDEO = null;
			}
			else {
				ACTIVE.domobj.addClass('notify');
				MONITORED_VIDEO = ACTIVE;
			}
		});
	}

	// Color Tags
	if(canColorTag()){
		$("<hr/>").appendTo($("<li/>").appendTo(optionList));
		var colorGrid = $("<div/>").addClass("colorGrid").appendTo($("<li/>").appendTo(optionList));
		var colors = [
			"#xxxxxx",
			"#AC725E",
			"#D06B64",
			"#F83A22",
			"#FA573C",
			"#FF7537",
			"#FFAD46",
			"#42D692",
			"#16A765",
			"#7BD148",
			"#B3DC6C",
			"#FBE983",
			"#FAD165",
			"#92E1C0",
			"#9FE1E7",
			"#9FC6E7",
			"#4986E7",
			"#9A9CFF",
			"#B99AFF",
			"#CABDBF",
			"#CCA6AC",
			"#F691B2",
			"#CD74E6",
			"#A47AE2"
		];
		for(var i=0;i<colors.length;i++){
			(function(i){
				if(colors[i] == "#xxxxxx"){
					$("<div/>").addClass("volatile swatch kill").appendTo(colorGrid).click(function(){
						doColorTag(entry,false,true);
					});
				} else {
					$("<div/>").addClass("volatile swatch").css("background-color",colors[i]).appendTo(colorGrid).click(function(){
						doColorTag(entry,colors[i],true);
					});
				}
			})(i);
		}
		$("<div/>").css("clear","both").appendTo(colorGrid);

		$("<hr/>").appendTo($("<li/>").appendTo(optionList));
		var colorGrid = $("<div/>").addClass("colorGrid").appendTo($("<li/>").appendTo(optionList));
		for(var i=0;i<colors.length;i++){
			(function(i){
				if(colors[i] == "#xxxxxx"){
					$("<div/>").addClass("swatch kill").appendTo(colorGrid).click(function(){
						doColorTag(entry,false,false);
					});
				} else {
					$("<div/>").addClass("swatch").css("background-color",colors[i]).appendTo(colorGrid).click(function(){
						doColorTag(entry,colors[i],false);
					});
				}
			})(i);
		}
		$("<div/>").css("clear","both").appendTo(colorGrid);
	}
}
function populatePlEntry(entry,elem){
	addTime(entry,elem);
	addTitle(entry,elem);
	//addVolatile(entry);
	addRequeue(entry);
	addDelete(entry);
	addColorTag(entry,elem);
	$('<div/>').addClass("clear").appendTo(entry);
	if(elem.volat){
		entry.addClass("volatile");
	}
	$(entry).bind("contextmenu",function(e){
		var me = $(this);
		var cmds = $("body").dialogWindow({
			title:"Video Options",
			uid:"videomenu",
			offset:{
				top:e.pageY - 5,
				left:e.pageX - 5
			},
			toolBox:true
		});
		var optionList = $("<ul/>").addClass("optionList").appendTo(cmds);
		addVideoControls(me,optionList);
		if(optionList.children().length == 0){
			cmds.window.close();
		}

		return false;
	});
}
function initRCVOverlay(above){
	var overlay = $("<div/>").insertBefore(above).attr('id','rcvOverlay');

	above.data("rcv",[]);

	above.scroll(function(){
		var importantMsgs = $(this).data("rcv");
        for (var i = importantMsgs.length - 1; i >= 0; i--) {
            var val = $(importantMsgs[i]);
			if(val.position().top < 0) {
				var madeAt = val.data("madeAt");
				var current = new Date().getTime();
				var timeToNormal = current-madeAt;
				importantMsgs.splice(i, 1);
				if( timeToNormal < RCV_HOLDTIME ){
                    (function(cpy) {
                        dbg("returning in "+(RCV_HOLDTIME - timeToNormal));
                        cpy.appendTo(overlay).show("blind");
                        var timeoutbutton = $('<div>').addClass('rmTimer').appendTo(cpy.children('.message'));
                        timeoutbutton.timeOut(RCV_HOLDTIME - timeToNormal,function(){
                            cpy.hide("blind",function(){
                                cpy.remove();
                            });
                        })
                    })(val.clone());
				}
			}
		}
	});
	return overlay;
}
function initPlaylistControls(plwrap){
	// Add controls
	$("#playlistAddControls").remove();
	var plcontrolwrap = $('<div id="playlistAddControls"/>').insertBefore(plwrap);
	var openVideoButton = $('<div/>').addClass('slideBtn').text("Import Video").appendTo(plcontrolwrap);
	var videoImportWrap = $('<div/>').addClass('import').insertAfter(openVideoButton);
	openVideoButton.click(function(){
		if(videoImportWrap.is(":hidden")){
			videoImportWrap.show("blind");
		}else{
			videoImportWrap.hide("blind");
		}
	});

	$('<div/>').addClass("note").text("Insert Video URL or ID Below.").appendTo(videoImportWrap);
	var container = $('<div/>').appendTo(videoImportWrap);
	var impwrap = $('<div/>').addClass("impele").appendTo(container);
	var videoImport = $('<input/>').appendTo(impwrap);

	var vqBtn = $('<div/>').addClass("impele").addClass("btn").text("Q").appendTo(container);
	vqBtn.click(function(){
		if(controlsPlaylist()){
			var btn = $(this);
			parseVideoURL($(videoImport).val(),function(id,type,videotitle){
				elem=PLAYLIST.first; var found = false;
				for(var i=0;i<PLAYLIST.length;i++){
					if(elem.videoid == id){
						found = true;
						doRequeue(elem.domobj);
						console.log("found");
						break;
					}
					elem=elem.next;
				}
				if(!found){
					btn.data('revertTxt',"Q");
					btn.text('').addClass("loading");
					LAST_QUEUE_ATTEMPT = {
						queue:true,
						videotype:type,
						videoid:id,
                        videotitle:videotitle,
						volat:false
					};
					socket.emit("addVideo", LAST_QUEUE_ATTEMPT);
				}
			});
		}
	});

	var vvBtn = $('<div id="addVolatButton"/>').addClass("impele").addClass("btn").text("V").appendTo(container);
	vvBtn.click(function(){
		if(controlsPlaylist()){
			var btn = $(this);
			parseVideoURL($(videoImport).val(),function(id,type,videotitle){
				elem=PLAYLIST.first; var found = false;
				for(var i=0;i<PLAYLIST.length;i++){
					if(elem.videoid == id){
						found = true;
						doRequeue(elem.domobj);
						console.log("found");
						break;
					}
					elem=elem.next;
				}
				if(!found){
					btn.data('revertTxt',"V");
					btn.text('').addClass("loading");
					LAST_QUEUE_ATTEMPT = {
						queue:true,
						videotype:type,
						videoid:id,
                        videotitle:videotitle,
						volat:true
					};
					socket.emit("addVideo", LAST_QUEUE_ATTEMPT);
				}
			});
		}
	});

	/*
	var vaddBtn = $('<div/>').addClass("impele").addClass("btn").text("+").appendTo(container);
	vaddBtn.click(function(){
		if(controlsPlaylist()){
			var btn = $(this);
			parseVideoURL($(videoImport).val(),function(id,type,videotitle){
				elem=PLAYLIST.first; var found = false;
				for(var i=0;i<PLAYLIST.length;i++){
					if(elem.videoid == id){
						found = true;
						doRequeue(elem.domobj);
						console.log("found");
						break;
					}
					elem=elem.next;
				}
				if(!found){
					btn.data('revertTxt',"+");
					btn.text('').addClass("loading");
					LAST_QUEUE_ATTEMPT = {
						queue:false,
						videotype:type,
						videoid:id,
                        videotitle:videotitle,
						volat:false
					};
					socket.emit("addVideo", LAST_QUEUE_ATTEMPT);
				}
			});
		}
	});
	*/

	videoImport.keyup(function(e) { if(e.keyCode == 13) { vvBtn.click(); } });
	$('<div/>').addClass("clear").appendTo(container);

	var openPlaylistControls = $('<div/>').addClass('slideBtn').text("Misc Controls").appendTo(plcontrolwrap);
	var playlistControlWrap = $('<div/>').addClass('import').insertAfter(openPlaylistControls);
	openPlaylistControls.click(function(){
		if(playlistControlWrap.is(":hidden")){
			playlistControlWrap.show("blind");
		}else{
			playlistControlWrap.hide("blind");
		}
	});

	var container = $('<div/>').appendTo(playlistControlWrap);
	window.MISC_CONTROL = container;
	var randomizeBtn = $('<div/>').addClass("misc").addClass("btn").text("Randomize List").appendTo(container);
	randomizeBtn.click(function(){
		if(controlsPlaylist()){
			if(confirm("Really Randomize list? This should be done SPARINGLY! Its a decent bit of overhead, and will LAG PEOPLE FOR A LITTLE WHILE."))
				socket.emit("randomizeList");
		}
	});
	$('<div/>').addClass("clear").appendTo(container);
}
function doPlaylistJump(elem){
	if(controlsPlaylist())
	{
		var index = $(elem).index();
        var id = $(elem).data('plobject').videoid;
		socket.emit("forceVideoChange", { index:index, sanityid:id });
	}
}
function newPlaylist(plul){

	$(plul).children().remove();
	var elem = PLAYLIST.first
	for(var i=0;i<PLAYLIST.length;i++)
	{
		var entry = $("<li/>").appendTo(plul);
		entry.data('plobject',elem);
		elem.domobj = entry;

		populatePlEntry(entry,elem);

		elem=elem.next;
	}
	dbg(PLAYLIST.first.videolength);
	recalcStats();
}
function initPlaylist(parent){

	$("#playlist").remove();
	plwrap = $('<div id="playlist"/>').appendTo(parent);
	setVal('sorting', false);

	var x = $('<div/>').addClass('scrollbar').appendTo(plwrap);
	var x = $('<div/>').addClass('track').appendTo(x);
	var x = $('<div/>').addClass('thumb').appendTo(x);
	var x = $('<div/>').addClass('end').appendTo(x);
	var viewPort = $('<div/>').addClass('viewport').appendTo(plwrap);
	var overview = $('<div/>').addClass('overview').appendTo(viewPort);

	plul = $("<ul/>").appendTo(overview).attr('id','plul');
	if(controlsPlaylist()){
		plul.addClass("controlsOn");
	}

	initPlaylistControls(plwrap);
	dbg("asking for permission to make the player");
	socket.emit("myPlaylistIsInited");
	$('<div/>').addClass("clear").appendTo(plwrap);

	var searchArea = $('<div/>').appendTo(plwrap).attr('id','searchbox');
	var videoSearch = $('<input/>').appendTo(searchArea);
	videoSearch.keyup(function(e) {
		if(e.keyCode == 13) {
			clearInterval(getVal("searchTime"));
			videoSearch.submit();
		} else {
			clearInterval(getVal("searchTime"));
			var x = setTimeout(function(){
				videoSearch.submit();
			},1000);
			setVal("searchTime",x);
		}
	});
	videoSearch.submit(function(){
		plSearch($(this).val());
	});

	var stats = $('<div/>').appendTo(plwrap).attr('id','plstats');
	var totalVideos = $('<div/>').appendTo(stats).addClass('totalVideos').text("0");
	var totalLength = $('<div/>').appendTo(stats).addClass('totalLength').text("0");

	totalVideos.click(function(){
		videoSearch.val('');
		if(searchArea.is(":hidden")){
			searchArea.show("blind");
			videoSearch.focus();
		} else {
			searchArea.hide("blind");
			videoSearch.blur();
			plSearch();
		}
	});

	// This looks silly, but it's to avoid double-firing events on reconnect
	$(window).unbind('keydown', keydownEventHandler).keydown(keydownEventHandler);

	newPlaylist(plul);
}

function keydownEventHandler(event) {
	if (event.keyCode == 27) {
		// Esc
		// async in case the dialog is doing stuff on keydown
        setTimeout(() => {
            const wins = $(document.body).data('windows');
            if ( !wins || wins.length === 0 ){
                // MalTweaks header/motd/footer
                $('.floatinner:visible').last().next('.mtclose').click();
                return;
            }

            wins[wins.length-1].close();
        }, 0);
	}
	else if (event.keyCode == 70 && event.ctrlKey && !event.shiftKey && !event.altKey) {
		// Ctrl+F
		$('.totalVideos').click();
		event.preventDefault();
		return false;
	}
	else if (event.keyCode == 33 && event.altKey) {
		// Left arrow
		cycleChatTab(true);
		return false;
	}
	else if (event.keyCode == 34 && event.altKey) {
		// Right arrow
		cycleChatTab(false);
		return false;
	}
	else {
		return true;
	}
}

function initFlairOpts(){
	var i = 0;
	for(var i=0;i<7;i++){
		FLAIR_OPTS.push($('<div/>').addClass("drinkflair").addClass("flair_"+i).data('flair_id',i));
	}
	// Manual title settings
	i = 0;
	FLAIR_OPTS[i++].attr('title','No Booze :C');
	FLAIR_OPTS[i++].attr('title','Wine');
	FLAIR_OPTS[i++].attr('title','Cocktail');
	FLAIR_OPTS[i++].attr('title','Cider');
	FLAIR_OPTS[i++].attr('title','Liquor');
	FLAIR_OPTS[i++].attr('title','Liquor');
	FLAIR_OPTS[i++].attr('title','Beer');
}
function initChatControls(parent){
	$("#chatControls").remove()

	var chatControls = $('<div/>').attr('id','chatControls').appendTo(parent);
	var _loginAs = $('<div/>').addClass('loginAs').text("Logged in as:").appendTo(chatControls);
	var loginAs = $('<span/>').addClass('nick').text("anonymous").appendTo(_loginAs);
	loginAs.click(function(){
		if(TYPE > 1){
			if($(this).hasClass("flaunt")){
				NAMEFLAUNT = false;
				$(this).removeClass("flaunt",100)
			} else {
				NAMEFLAUNT = true;
				$(this).addClass("level_"+TYPE)
				$(this).addClass("flaunt",100)
			}
		}
	});

	initFlairOpts();
	var flairMenuWrap = $('<div/>').attr('id','flairMenu').appendTo(chatControls);
	flairMenuWrap.click(function(){
		flairMenuWrap.superSelect({
			options:FLAIR_OPTS,
			callback:function(selected){
				dbg(selected);
				var newId = $(selected).data('flair_id');
				if(typeof newId == "undefined"){
					newId = 0;
				}
				MY_FLAIR_ID = parseInt(newId);
				setStorage('myFlairID', MY_FLAIR_ID) // TODO - This used to expire after a day, wat do?
				flairMenuWrap.removeClass().addClass('flair_'+MY_FLAIR_ID);
			}
		});
	});
	var flairArrow = $('<div/>').attr('id','flairArrow').appendTo(chatControls);
	flairArrow.click(function(){
		flairMenuWrap.click();
	});

	var settingsMenu = $('<div/>').addClass('settings').appendTo(chatControls).text("Settings");
	settingsMenu.click(function(){
		showConfigMenu(settingsMenu);
	});
}
function initChat(parent){
	$("#chatpane").remove()
	var chatpane = $('<div id="chatpane"/>').appendTo(parent);

	var chattabs = $('<div id="chattabs"/>').appendTo(chatpane);
	var maintab = $('<div id="maintab"/>').addClass('tab active').text('#Main').click(function() { showChat('main'); }).appendTo(chattabs);
	var admintab = $('<div id="admintab"/>').addClass('tab').text('#OPS').click(function() { showChat('admin'); }).appendTo(chattabs);

	var chatbuffer = $('<div id="chatbuffer"/>').addClass('chatbuffer').css('display', 'block').appendTo(chatpane);
	var sbstare = $('<marquee/>').html('[](/sbstare)').appendTo(chatbuffer);

	var adminbuffer = $('<div id="adminbuffer"/>').addClass('chatbuffer').css('display', 'none').appendTo(chatpane);

	var userCountWrap = $('<div id="connectedCountWrapper"/>').appendTo(chatpane);
	var userCount = $('<span id="connectedCount"/>').appendTo(userCountWrap);
	userCountWrap.append("Connected Users:").append(userCount);
	userCountWrap.attr("title","Kick rocks<br />I'm loading.");
	$(userCountWrap).tooltip({
		content: function() {
			var numAdmins = $("#chatlist .admin").length;
			var numMods = $("#chatlist .assistant").length;
			var numUsers = $("#chatlist .user").length;
			var numAnons = $("#chatlist .anon").length;
			var numNobodies = CONNECTED - numAdmins - numMods - numUsers - numAnons;
			return "Admins: " + numAdmins + "<br />" +
				"Assistants: " + numMods + "<br />" +
				"Users: " + numUsers + "<br />" +
				"Anons: " + numAnons + "<br />" +
				"Lurkers: " + numNobodies;
		}
	});
	userCountWrap.click(function(){
		toggleChatMode();
	});

	var chatlist = $('<div id="chatlist"/>').appendTo(chatpane);
	var chatlistul = $('<ul/>').appendTo(chatlist);

	var chatinput = $('<div id="chatinput"/>').addClass("right").appendTo(chatpane);
	var setNick = $('<div/>').text("Enter a Nickname:").addClass("setNick").appendTo(chatpane);
	var tt = setInterval(function(){
		if(canChat()){
			setNick.remove();
			chatinput.removeClass("right");
			chatinputbar.attr('aria-label', 'message');
			clearInterval(tt);
		}
	},500)
	var chatinputbar = $('<input/>').attr('maxlength','400').attr('aria-label', 'nickname').appendTo(chatinput);
	chatinputbar.keyup(function(e) {
		if(e.keyCode == 13) {chatinputbar.submit(); }
	});
	chatinputbar.keydown(function(objEvent) {
		if (objEvent.keyCode == 9) {  //tab pressed
			objEvent.preventDefault(); // stops its action
			tabComplete($(this));
		}else{
			$(this).data('tabcycle',false);
			$(this).data('tabindex',0);

			if (objEvent.keyCode == 38) { //pressed up.
			if(HISTORY_POS < HISTORY.length){
				HISTORY_POS++;
				$(this).val(HISTORY[HISTORY_POS])
			}
			} else if (objEvent.keyCode == 40) { //pressed down.
				if(HISTORY_POS > 0){
					HISTORY_POS--;
					$(this).val(HISTORY[HISTORY_POS])
				}
			} else {
				HISTORY_POS = 0;
				HISTORY[HISTORY_POS] = $(this).val();
			}

		}
	})

	chatinputbar.submit(function(){
		if(canChat()){
			var msg = $(this).val();
			sendChatMsg(msg,$(this));
		}else{
			var data = {nick:$(this).val(), pass:false};
			$('#headbar').data('loginData', data);
			socket.emit("setNick", data);
			$(this).val("");
		}
	});

	// Because FUCK YOUR EYEBALLS
	var adminRainbow = $('<div id="adminRainbow"/>').html('<span style="color: #EE4144;">A</span><span style="color: #F37033;">D</span><span style="color: #FDF6AF;">M</span><span style="color: #62BC4D;">O</span><span style="color: #1E98D3;">P</span><span style="color: #672F89;">S</span>').appendTo(chatinput);
	adminRainbow.css('display', 'none');

	$('<div/>').addClass("clear").appendTo(chatpane);
	initPolls(chatpane);
	initChatControls(chatpane)
}
function initChatList(data){
	$("#chatlist ul").children().remove();
	CHATLIST = {};
	var count = $(data).length;
	$(data).each(function(key,value){
		addUser(value, false);
		if (!--count) sortUserList();
	});
}
function initLogoutForm(headbar){
    var logoutForm = $('<form/>').attr('method','post').appendTo(headbar);
    var layoutTable = $('<table/>').appendTo(logoutForm);

    var row = $('<tr/>').appendTo(layoutTable);
    $('<span/>').text('Logged in as '+ORIGNAME).appendTo($('<td/>').appendTo(row));
    $('<input/>').attr('name','logout').attr('type','hidden').appendTo($('<td/>').appendTo(row));

	var passwdbtn = $('<div/>').addClass("submit").css('width', '120px').text("Change password").appendTo($('<td/>').appendTo(row));
	passwdbtn.click(function(){
		showPasswordChangeDialog();
	});

    var logoutbtn = $('<div/>').addClass("submit").text("Logout").appendTo($('<td/>').appendTo(row));
    logoutbtn.click(function(){
        if(typeof localStorage != 'undefined') {
            localStorage.removeItem('nick');
            localStorage.removeItem('pass');
        }
        logoutForm.submit();
    });
}
function initLoginForm(headbar){
    var loginWrap = $('<div/>').appendTo(headbar);
    var regWrap = $('<div/>').hide().appendTo(headbar);

    /*=============================================*/

    var loginForm = $('<form/>').attr('method','post').appendTo(loginWrap);
    var layoutTable = $('<table/>').appendTo(loginForm);
    var row = $('<tr/>').appendTo(layoutTable);
    $('<label/>').attr('for', 'loginname').text('Username').appendTo($('<td/>').appendTo(row));
    var userBar = $('<input/>').attr('id','loginname').attr('name','loginname').attr('type','text').attr('autocomplete','username').appendTo($('<td/>').appendTo(row));
    var showregbtn = $('<div/>').addClass("submit").text("Register").appendTo($('<td/>').appendTo(row));

    var row = $('<tr/>').appendTo(layoutTable);
    $('<label/>').attr('for', 'loginpass').text('Password').appendTo($('<td/>').appendTo(row));
    var loginBar = $('<input/>').attr('id','loginpass').attr('name','loginpass').attr('type','password').attr('autocomplete','current-password').appendTo($('<td/>').appendTo(row));
    var loginbtn = $('<div/>').addClass("submit").text("Login").appendTo($('<td/>').appendTo(row));

    showregbtn.click(function(){
        loginWrap.hide("blind",function(){
            regWrap.show("blind");
        });
    });
    loginForm.submit(function(){
        //Handle login. Return false to prevent postback
        $('#headbar .loginError').html('');
        var nick = this["loginname"].value;
        var pass = this["loginpass"].value;
        var data = {nick:nick, pass:pass};
        headbar.data('loginData', data);
        socket.emit('setNick', data);
        return false;
    });
    loginbtn.click(function(){loginForm.submit()});
    userBar.keyup(function(e) { if(e.keyCode == 13) { loginForm.submit(); } });
    loginBar.keyup(function(e) { if(e.keyCode == 13) { loginForm.submit(); } });

    /*=============================================*/

    var regForm = $('<form/>').attr('method','post').appendTo(regWrap);
    var layoutTable = $('<table/>').appendTo(regForm);
    var row = $('<tr/>').appendTo(layoutTable);
    $('<span/>').text('Desired Username').appendTo($('<td/>').appendTo(row));
    var newUserBar = $('<input/>').attr('name','regname').attr('type','text').attr('autocomplete','username').appendTo($('<td/>').appendTo(row));
    var showloginbtn = $('<div/>').addClass("submit").text("Login").appendTo($('<td/>').appendTo(row));

    var row = $('<tr/>').appendTo(layoutTable);
    $('<span/>').text('Password').appendTo($('<td/>').appendTo(row));
    var passBar = $('<input/>').attr('name','regpass').attr('type','password').attr('autocomplete','new-password').appendTo($('<td/>').appendTo(row));
    $('<div/>').text("").appendTo($('<td/>').appendTo(row));

    var row = $('<tr/>').appendTo(layoutTable);
    $('<span/>').text('Confirm Password').appendTo($('<td/>').appendTo(row));
    var pass2Bar = $('<input/>').attr('name','regpass2').attr('type','password').attr('autocomplete','new-password').appendTo($('<td/>').appendTo(row));
    var regbtn = $('<div/>').addClass("submit").text("Register").appendTo($('<td/>').appendTo(row));

    showloginbtn.click(function(){
        regWrap.hide("blind",function(){
            loginWrap.show("blind");
        });
    });

    regForm.submit(function(){
        //Handle register. Return false to prevent postback
        $('#headbar .loginError').html('');
        var nick = this["regname"].value;
        var pass = this["regpass"].value;
        var pass2 = this["regpass2"].value;
        var data = {nick:nick, pass:pass, pass2:pass2};
        headbar.data('loginData', data);
        socket.emit('registerNick', data);
        return false;
    });

    $('<label><input type="checkbox" checked="checked" class="rememberMe" />Remember Me</label>').appendTo(headbar);
    $('<div/>').addClass('loginError').appendTo(headbar);

    regbtn.click(function(){regForm.submit()});
    newUserBar.keyup(function(e) { if(e.keyCode == 13) { regForm.submit() } });
    passBar.keyup(function(e) { if(e.keyCode == 13) { regForm.submit() } });
    pass2Bar.keyup(function(e) { if(e.keyCode == 13) { regForm.submit() } });
    // Autologin.
    if(typeof localStorage != 'undefined'){
        var nick = localStorage.getItem('nick');
        var pass = localStorage.getItem('pass');
        if(nick && pass){
            var data = {nick:nick, pass:pass};
            headbar.data('loginData', data);
            socket.emit('setNick', data);
        }
    }
}
function initDrinkCounter(under){
	var drink = $('<div/>').attr('id',"drinkWrap").hide().insertAfter(under);
	var counter = $('<span>Current video has <span id="drinkCounter">0</span> drinks.</span>');
	var v = $('<div/>').attr('id','v').appendTo(drink);
	counter.appendTo(drink);
}
function addPollOpt(to,amt){
	for(var i=0;i<amt;i++)
		$('<input/>').attr('type','text').addClass("option").appendTo($('<div/>').addClass("optionWrap").appendTo(to));
}
function initPolls(under){
	$("#pollpane").remove()
	var chatpane = $('<div id="pollpane"/>').insertAfter(under);

	// Poll Controls
	var pollControl = $('<div/>').attr('id','pollControl').insertBefore(chatpane);
	var btns = $('<table/>').appendTo(pollControl).addClass("mainbtns");
	var row = $('<tr/>').appendTo(btns);
	var newPollBtn = $('<div/>').addClass("btn").text("New Poll").appendTo($('<td/>').appendTo(row));
	var endPollBtn = $('<div/>').addClass("btn").text("Close Active Poll").appendTo($('<td/>').appendTo(row));
	var canvas = $('<div/>').addClass("options").appendTo(pollControl);

	$("<div/>").addClass("clear").insertAfter(btns);

	newPollBtn.click(function(){
		if(canvas.is(":hidden")){
			canvas.show("blind");
			newPollBtn.text("Cancel");
		}else{
			canvas.hide("blind");
			newPollBtn.text("New Poll");
		}
	});

	endPollBtn.click(function(){
		if(canClosePoll()){
			socket.emit("closePoll");
		}
	});

	var table = $('<table/>').appendTo(canvas);

	// Title Row
	var row = $('<tr/>').appendTo(table);
	var td = $('<td/>').appendTo(row);
	$('<label/>').text('Poll Title').appendTo(td);

	var td = $('<td/>').appendTo(row);
	var x = $('<div/>').appendTo(td).addClass("optionWrap");
	newPollTitle = $('<input/>').attr('type','text').appendTo(x);

	var td = $('<td/>').appendTo(row);
	newPollObscure = $('<input/>').addClass("cb").attr('type','checkbox').attr("title","Obscure votes until poll closes.").prop('checked', true).appendTo(td);

	// Options Row Container
	var row = $('<tr/>').appendTo(table);
	var td = $('<td/>').appendTo(row);
	$('<label/>').text('Poll Options').appendTo(td);

	var td = $('<td/>').appendTo(row);
	var optionContainer = $('<div/>').addClass("optionContainer").appendTo(td);

	// New Option Row
	var row = $('<tr/>').appendTo(table);
	$('<td/>').appendTo(row);
	var td = $('<td/>').appendTo(row);
	var newOptionBtn = $('<div/>').addClass("btn").text("New Option").appendTo(td);
	var td = $('<td/>').appendTo(row);
	var newOptionManyBtn = $('<div/>').addClass("btn").text("+5").appendTo(td);

	// Submit Row
	var row = $('<tr/>').appendTo(table);
	$('<td/>').appendTo(row);
	var td = $('<td/>').appendTo(row);
	var createPollBtn = $('<div/>').addClass("btn").text("Create Poll").appendTo(td);

	// Ranked Row
	var row = $('<tr/>').appendTo(table);
	$('<td/>').appendTo(row);
	var td = $('<td/>').appendTo(row);
	var createRankedPollBtn = $('<div/>').addClass("btn").text("Create Ranked Poll").appendTo(td);

	// Runoff row
	var row = $('<tr/>').appendTo(table);
	$('<td/>').appendTo(row);
	var td = $('<td/>').appendTo(row);
	var createRunoffBtn = $('<div/>').addClass('btn').text('Create Runoff').appendTo(td);

	var td = $('<td/>').appendTo(row);
	var x = $('<div/>').appendTo(td).addClass('optionWrap').css('width', '30px');
	var runoffThreshold = $('<input/>').attr('type', 'text').attr('title', 'Vote threshold for the runoff.').appendTo(x);

	// Init
	addPollOpt(optionContainer,5);
	newOptionBtn.click(function(){
		addPollOpt(optionContainer,1);
	});
	newOptionManyBtn.click(function(){
		addPollOpt(optionContainer,5);
	})
	
	createPollBtn.click(() => doCreatePoll("normal"));
	
	createRankedPollBtn.click(() => doCreatePoll("ranked"))

	createRunoffBtn.click(function() {
		if (canCreatePoll()) {
			var threshold = parseInt(runoffThreshold.val());
			if (isNaN(threshold)) {
				return;
			}

			var ops = [];
			$('.poll.active tr').each(function(index, elem) {
				var $elem = $(elem);
				var count = parseInt($elem.find('.btn').text());
				if (!isNaN(count) && count >= threshold) {
					ops.push($elem.find('.label').text());
				}
			});

			if (ops.length > 0) {
				socket.emit('newPoll', {
					title:newPollTitle.val(),
					obscure:newPollObscure.is(":checked"),
					ops:ops
				});
				newPollTitle.val('');
				runoffThreshold.val('');
				canvas.find('.option').parent().remove();
				addPollOpt(optionContainer, 2);
				newPollObscure.prop('checked', true);
				newPollBtn.click();
			}
		}
	});

	$('<div/>').css("clear",'both').appendTo(pollControl);

	function doCreatePoll(pollType) {
		if (!canCreatePoll())
			return
		
		const ops = canvas.find(".option")
		const data = []

		for (var i = 0; i < ops.length; i++)
			data.push($(ops[i]).val());

		socket.emit("newPoll", {
			title: $(newPollTitle).val(),
			obscure: newPollObscure.is(":checked"),
			ops: data,
			pollType
		});

		newPollTitle.val('');
		runoffThreshold.val('');
		ops.parent().remove();
		addPollOpt(optionContainer,5);
		newPollObscure.prop('checked', true);
		newPollBtn.click();
	}
}
function initAreas(){
	var hw = $("<div/>").addClass("wrapper").insertAfter($("#countdown-timers"));
	var header = $("<div/>").attr('id','dyn_header').addClass('dynarea').appendTo(hw);
	var motd = $("<div/>").attr('id','dyn_motd').addClass('dynarea').insertAfter($("#pollpane"));
	var footer = $("<div/>").attr('id','dyn_footer').addClass('dynarea').appendTo($("#main"));

	var now = new Date();
	if (now >= new Date("Tue, 1 Apr 2014 00:00:00 EDT") && now < new Date("Wed, 2 Apr 2014 00:00:00 EDT")) {
		function getAdUrl(vertical) {
			if (vertical) {
				var ads = ['url(../images/tornado.png)', 'url(../images/ahf.png)', 'url(../images/syob.png)', 'url(../images/whiskey.png)'];
				return ads[Math.floor(Math.random() * ads.length)];
			}
			else {
				var ads = ['url(../images/tornado-horiz.png)', 'url(../images/ahf-horiz.png)', 'url(../images/syob-horiz.png)', 'url(../images/whiskey-horiz.png)'];
				return ads[Math.floor(Math.random() * ads.length)];
			}
		}

		$('<div id="goldButton"><div>Don\'t like the ads? Click here for your free trial subscription to BerryTube Gold!</div></div>')
			.click(function() {
				socket.emit('activateGold');
				$('body').addClass('noAds');
			})
			.insertBefore(footer);
		$('<div class="ad"/>').css({'position':'fixed', 'left':'0px', 'top':'50%', 'width':'160px', 'height':'600px',
			'margin-top':'-300px', 'z-index':'10000', 'background-image':getAdUrl(true)}).appendTo('body');
		$('<div class="ad"/>').css({'position':'fixed', 'bottom':'0px', 'left':'50%', 'width':'600px', 'height':'160px',
			'margin-left':'-300px', 'z-index':'10000', 'background-image':getAdUrl(false)}).appendTo('body');
		$('<div class="ad"/>').css({'position':'fixed', 'right':'0px', 'top':'50%', 'width':'160px', 'height':'600px',
			'margin-top':'-300px', 'z-index':'10000', 'background-image':getAdUrl(true)}).appendTo('body');

		$('<link rel="stylesheet" type="text/css" href="http://toast.berrytube.tv/evil.css">').appendTo('head');
	}
}
function initMailbox() {
	$('body').append(
		$('<div id="mailDiv"/>').append(
			$('<div id="mailboxDiv"/>').css('display', 'none').append(
				$('<div id="mailMessageDiv"/>'),
				$('<div/>').css('text-align', 'center').append(
					$('<button/>').addClass('btn').text('Clear').click(function() {
						$('#mailMessageDiv').children().remove();
						$('#mailButtonDiv').removeClass('new');
						toggleMailDiv();
					}))),
			$('<div id="mailButtonDiv"/>').html('<img src="' + CDN_ORIGIN + '/images/envelope.png" alt="mail"></img>').click(toggleMailDiv)));
}
$(function(){
	dbg("page loaded, firing onload scripts")
	$("body").keypress(function(event) {
		if(event.keyCode == 27){ event.preventDefault(); } // Stop escape killing connection in firefox.
	});

	setTimeout(function(){
		if (MY_COUNTRY && window.cookieconsent) {
			let cookiepopupShown = false;
			window.cookieconsent.hasTransition = false;
			window.cookieconsent.initialise({
			    palette: {
					popup: {
						background: "#64386b",
						text: "#ffcdfd"
					},
					button: {
						background: "#f8a8ff",
						text: "#3f0045"
					}
				},
				theme: "classic",
				position: "bottom-left",
				law: {
					countryCode: MY_COUNTRY
				},
				cookie: {
					secure: true
				},
				content: {
					message: 'Like every other website on the planet, we use cookies.',
					link: 'Would you like to know more?',
					href: 'https://cookiesandyou.com'
				},
				elements: {
					messagelink:
						'<span id="cookieconsent:desc" class="cc-message">' +
							'<img id="cookieconsent-image">' +
							'{{message}} ' +
							'<a tabindex="0" class="cc-link" href="{{href}}" target="_blank" rel="noreferrer noopener">{{link}}</a>' +
						'</span>'
				}
			}, function(popup){
				if (!cookiepopupShown && popup.options.enabled || popup.options.revokable) {
					cookiepopupShown = true;
					$('<link>', {
						rel: 'stylesheet',
						href: 'https://cdnjs.cloudflare.com/ajax/libs/cookieconsent2/3.1.0/cookieconsent.min.css',
						integrity: 'sha256-ebN46PPB/s45oUcqLn2SCrgOtYgVJaFiLZ26qVSqI8M=',
						crossorigin: 'anonymous'
					}).appendTo(document.head);
					$('#cookieconsent-image').attr('src', CDN_ORIGIN + '/images/cookies/' + Math.floor(Math.random()*5) + '.png');
				}
			});
		}
	}, 1000);

    whenExists('#headbar', function(){
        initLoginForm($('#headbar'));
    });

	//initPlaylist($("#leftpane"));
	initChat($("#rightpane"));
	var p = $("#videobg");
	if(p.length>0){
		initDrinkCounter(p);
	} else {
		initDrinkCounter($("#videowrap"));
	}
	initAreas();
	initRCVOverlay($("#chatbuffer"));
	initMailbox();

	// Defaults.
	if(getStorage('syncAtAll') == null){setStorage('syncAtAll',1);}
	if(getStorage('syncAccuracy') == null){setStorage('syncAccuracy',2);}
	if(getStorage('notifyMute') == null){setStorage('notifyMute',0);}
	if(getStorage('drinkNotify') == null){setStorage('drinkNotify',0);}
	if(getStorage('legacyPlayer') == null){setStorage('legacyPlayer',0);}
	if(getStorage('showTimestamps') == null){setStorage('showTimestamps',0);}
	if(getStorage('showChatflair') == null){setStorage('showChatflair',1);}
	if(getStorage('plFolAcVid') == null){setStorage('plFolAcVid',1);}
	if(getStorage('keeppolls') == null){setStorage('keeppolls',5);}
	if(getStorage('sbchatter') == null){setStorage('sbchatter',0);}
	if(getStorage('nightMode') == null){setStorage('nightMode',0);}

	// Reactions
	if(getStorage('showTimestamps') == 1){ $('body').addClass('showTimestamps'); }
	if(getStorage('sbchatter') == 1){ $('body').addClass('showSBChatter'); }
	if(getStorage('showChatflair') == 0){ $('body').addClass('hideChatFlair'); }
	if(getStorage('nightMode') == 1){ $('body').addClass('night'); }

	var t = getStorage('myFlairID');
	if(t != null) {
		MY_FLAIR_ID = t;
		$("#flairMenu").addClass("flair_"+MY_FLAIR_ID);
	}

	$(window).focus(function() {
		WINDOW_FOCUS = true;
		windowFocused();
	})
    .blur(function() {
        WINDOW_FOCUS = false;
		windowBlurred();
    });
	$("body").click(function(){
		WINDOW_FOCUS = true;
		windowFocused()
	});

	document.addEventListener('visibilitychange', function(){
		if(document.hidden){
			windowHidden();
		} else {
			windowShown();
		}
	}, false);

	$(".chatbuffer")
		.mouseenter(function() { KEEP_BUFFER = false; })
		.mouseleave(function() { KEEP_BUFFER = true; scrollBuffersToBottom(); });

	setVal("INIT_FINISHED", true)

	//Init plugin manager stuff
	for (var i in scriptNodes) {
		var node = scriptNodes[i];

		var selector = '';
		if (node.js.length > 0) {
			// Use the first js file as the selector, if there is one
			selector = 'script[src="' + node.js[0] + '"]';
		}
		else if (node.css.length > 0) {
			// If there are no js files, use the first css file
			selector = 'link[href="' + node.css[0] + '"]';
		}

		if (selector == '') {
			// If there were no js or css files, or if the selector returns a match, skip this
			// entry - it's either a bad node or they user has it installed as a user script
			console.log('Bad node ' + node.title + ', ignoring.');
			continue;
		}

		var exists = $(selector).length > 0;

		var enabled = getStorage(node.setting);
		if (enabled == null || (enabled != 'true' && enabled != 'false')) {
			enabled = false;
			setStorage(node.setting, false);
		}
		else {
			enabled = (enabled == 'true') && !exists;
		}

		node.exists = exists;
		node.enabled = enabled;
		node.loaded = false;

		if (enabled) {
			loadPlugin(node);
		}
	}
});
