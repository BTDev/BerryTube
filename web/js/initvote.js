'what up';

const autoCloseTimes = [
	[0, "Don't Close Automatically"],
	[30, "Close in 30 seconds"],
	[60, "Close in 1 minute"],
	[60 * 2, "Close in 2 minutes"],
	[60 * 5, "Close in 5 minutes"],
	[60 * 10, "Close in 10 minutes"]
];

var DEBUG = false;
if (typeof localStorage != "undefined") {
	DEBUG = localStorage.getItem('BT_DEBUG') === "true";
}
function dbg(...things) { if (DEBUG) { console.debug(...things); } }
function setDebugMode(mode) {
	DEBUG = !!mode;
	localStorage.setItem("BT_DEBUG", mode ? "true" : "false");
}

// VIDEO OBJECT
function Video() { }
Video.prototype = {
	videoid: null,
	videolength: null,
	videotitle: null,
	videotype: null,
	volat: false,
	meta: null,
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
		meta: this.meta
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
		//console.log(elem);
		out.push(elem.pack());
		elem = elem.next;
	}
	dbg(out);
	return out;
};

var btEvents = (function () {

	var self = {};
	var hooks = {};

	self.on = function (evt, fn, once) {
		once = !!once || false;
		hooks[evt] = hooks[evt] || [];
		hooks[evt].push({ fn: fn, once: once });
	};

	self.once = function (evt, fn) {
		return self.on(evt, fn, true);
	};

	self.emit = function (evt, data) {
		hooks[evt] = hooks[evt] || [];
		for (var i = hooks[evt].length - 1; i >= 0; i -= 1) {
			var hook = hooks[evt][i];
			if (hook.fn) { hook.fn(data); }
			if (hook.once === true) {
				hooks[evt].splice(i, 1);
			}
		}
	};

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
var PLAYLIST_DRAGFROM = 0;
var PLAYLIST_DRAGTO = 0;
var PLAYLIST_DRAGSANITY = '';
var LEGACY_PLAYER = false;
var INIT_TIME = 0;
var SEEK_FROM = 0;
var SEEK_TO = 0;
var HISTORY = [];
var FLAIR_OPTS = [];
var HISTORY_POS = 0;
var HISTORY_SIZE = 50;
var LAST_EMIT_STATE = -1;
var WINDOW_FOCUS = false;
var CHAT_NOTIFY = false;
var VIDEO_TYPE = false;
var MY_FLAIR_ID = 0;
var DRINKS = 0;
var LAST_SEND_TIME = false;
var NOTIFY_TITLE = "Chat!";
var NOTIFY = window.NOTIFY || new Audio(CDN_ORIGIN + "/sounds/notify.wav"); // buffers automatically when created
var DRINK = window.DRINK || new Audio(CDN_ORIGIN + "/sounds/drink.wav"); // buffers automatically when created
var ATTENTION = window.ATTENTION || new Audio(CDN_ORIGIN + "/sounds/attention.wav"); // [](/shift6)
var MONITORED_VIDEO = null;
var KEEP_BUFFER = true;
var RCV_HOLDTIME = 1000 * 30;
var FILTERS = false;
var BANLIST = false;
var PARTYROOMLIST = false;
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

(function () {
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
} catch (e) {
	console.log('invalid stored ignoreList', e);
}

try {
	window.socket = io.connect(SOCKET_ORIGIN, {
		'connect timeout': 4500 + Math.random() * 1000,
		'reconnect': true,
		'reconnection delay': 500 + Math.random() * 1000,
		'reopen delay': 500 + Math.random() * 1000,
		'max reconnection attempts': 10,
        'transports': ['websocket']
	});

	window.socket.on('error', function (reason) {
		if (reason == "handshake error") {
			window.location = "ban.php";
		} else {
			$(function () {
				var AWSHIT = $("<center><h1>Unable to connect Socket.IO: " + reason + "</h1></center>").prependTo(document.body);
			});
			console.error(reason);
		}
	});
} catch (e) {
	$(function () {
		var debugging = $("<center><h3>" + e + "</h3></center>").prependTo(document.body);
		var AWSHIT = $("<center><h1>Aw shit! Couldn't connect to the server!</h1></center>").prependTo(document.body);
	});
	console.error(e);
}

function addPollOpt(to, optionCount) {
	for (let i = 0; i < optionCount; i++) {
		$("<div>")
			.addClass("optionWrap")
			.append(
				$("<input />")
					.attr("type", "text")
					.addClass("option"))
			.append(
				$("<label />")
					.addClass("optionWrap__two-thirds")
					.append($("<span />").addClass("optionWrap__two-thirds-text"))
					.append($("<input />")
						.attr("type", "checkbox")
						.attr("tabindex", "-1")
						.addClass("optionWrap__two-thirds-checkbox")
						.change(function () {
							const parent = getClosest(this, ".optionWrap__two-thirds");
							parent.classList.toggle("is-checked", this.checked);
						})))
			.appendTo(to);
	}
}
function initPolls(under) {
	$("#pollpane").remove();
	var chatpane = $('<div id="pollpane"/>').insertAfter(under);

	// Poll Controls
	var pollControl = $('<div/>').attr('id', 'pollControl').insertBefore(chatpane);
	var btns = $('<table/>').appendTo(pollControl).addClass("mainbtns");
	var row = $('<tr/>').appendTo(btns);
	var newPollBtn = $('<div/>').addClass("btn").text("New Poll").appendTo($('<td/>').appendTo(row));
	var endPollBtn = $('<div/>').addClass("btn").text("Close Active Poll").appendTo($('<td/>').appendTo(row));
	var canvas = $('<div/>').addClass("options").appendTo(pollControl);

	$("<div/>").addClass("clear").insertAfter(btns);

	newPollBtn.click(function () {
		if (canvas.is(":hidden")) {
			canvas.show("blind");
			newPollBtn.text("Cancel");
		} else {
			canvas.hide("blind");
			newPollBtn.text("New Poll");
		}
	});

	endPollBtn.click(function () {
		if (canClosePoll()) {
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
	newPollTitle = $('<input/>').attr('type', 'text').appendTo(x);

	var td = $('<td/>').appendTo(row);
	newPollObscure = $('<input/>').addClass("cb").attr('type', 'checkbox').attr("title", "Obscure votes until poll closes.").prop('checked', true).appendTo(td);

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

	// Automatic Close Row
	const automaticClose = $("<select />")
		.addClass("c-poll-select__select")
		.append(autoCloseTimes
			.map(([time, title]) => $(`<option />`)
				.attr("selected", time === 0)
				.text(title)
				.attr("value", time)))
		.appendTo(td);

	$("<tr />")
		.addClass("c-poll-select")
		.append($("<td />"))
		.append($("<td />").append(automaticClose))
		.appendTo(table);

	// Submit Row
	var row = $('<tr/>').appendTo(table);
	$('<td/>').appendTo(row);
	td = $('<td/>').addClass("c-split-btn-row").appendTo(row);

	const createPollBtn = $('<div/>')
		.addClass("btn")
		.addClass("c-split-btn-row__button")
		.text("Normal Poll")
		.appendTo(td);

	// Ranked Row
	var createRankedPollBtn = $('<div/>')
		.addClass("btn")
		.addClass("c-split-btn-row__button")
		.text("Ranked Poll")
		.appendTo(td);

	// Runoff row
	var row = $('<tr/>').appendTo(table);
	$('<td/>').appendTo(row);
	var td = $('<td/>').appendTo(row);
	var createRunoffBtn = $('<div/>').addClass('btn').text('Create Runoff').appendTo(td);

	var td = $('<td/>').appendTo(row);
	var x = $('<div/>').appendTo(td).addClass('optionWrap').css('width', '30px');
	var runoffThreshold = $('<input/>').attr('type', 'text').attr('title', 'Vote threshold for the runoff.').appendTo(x);

	// Init
	addPollOpt(optionContainer, 5);
	newOptionBtn.click(function () {
		addPollOpt(optionContainer, 1);
	});
	newOptionManyBtn.click(function () {
		addPollOpt(optionContainer, 5);
	});

	createPollBtn.click(() => createPoll("normal"));

	createRankedPollBtn.click(() => createPoll("ranked"));

	createRunoffBtn.click(function () {
		if (canCreatePoll()) {
			var threshold = parseInt(runoffThreshold.val());
			if (isNaN(threshold)) {
				return;
			}

			var ops = [];
			$('.poll.active tr').each(function (index, elem) {
				var $elem = $(elem);
				var count = parseInt($elem.find('.btn').text());
				if (!isNaN(count) && count >= threshold) {
					const label = POLL_OPTIONS[index];
					const isTwoThirds = label.endsWith(' (⅔ required)');
					const text = isTwoThirds ? label.substr(0, label.length - ' (⅔ required)'.length) : label;
					ops.push({ text, isTwoThirds });
				}
			});

			if (ops.length > 0) {
				socket.emit('newPoll', {
					title: newPollTitle.val(),
					obscure: newPollObscure.is(":checked"),
					ops: ops,
					closePollInSeconds: parseInt(automaticClose.val()),
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

	$('<div/>').css("clear", 'both').appendTo(pollControl);

	function createPoll(pollType = "normal") {
		if (!canCreatePoll()) { return; }

		const options = getOptions();
		if (!options.length) {
			return;
		}

		socket.emit("newPoll", {
			title: $(newPollTitle).val(),
			obscure: newPollObscure.is(":checked"),
			ops: options,
			pollType,
			closePollInSeconds: parseInt(automaticClose.val())
		});

		newPollTitle.val("");
		runoffThreshold.val("");
		canvas.find(".option").parent().remove();
		addPollOpt(optionContainer, 5);
		newPollObscure.prop('checked', true);
		newPollBtn.click();
		automaticClose.val(0);
	}

	function getOptions() {
		const opWraps = canvas[0].querySelectorAll(".optionWrap");
		const ret = [];

		for (const opWrap of opWraps) {
			const textInput = opWrap.querySelector(".option");
			if (!textInput) { continue; }

			const text = textInput.value;
			if (!text.trim().length) { continue; }

			const isTwoThirds = opWrap.querySelector(".optionWrap__two-thirds-checkbox").checked;
			ret.push({ text, isTwoThirds });
		}

		return ret;
	}
}
$(function () {
	dbg("page loaded, firing onload scripts");
	$("body").keypress(function (event) {
		if (event.keyCode == 27) { event.preventDefault(); } // Stop escape killing connection in firefox.
	});

	setTimeout(function () {
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
				position: "bottom-right",
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
			}, function (popup) {
				if (!cookiepopupShown && popup.options.enabled || popup.options.revokable) {
					cookiepopupShown = true;
					$('<link>', {
						rel: 'stylesheet',
						href: 'https://cdnjs.cloudflare.com/ajax/libs/cookieconsent2/3.1.0/cookieconsent.min.css',
						integrity: 'sha256-ebN46PPB/s45oUcqLn2SCrgOtYgVJaFiLZ26qVSqI8M=',
						crossorigin: 'anonymous'
					}).appendTo(document.head);
					$('#cookieconsent-image').attr('src', CDN_ORIGIN + '/images/cookies/' + Math.floor(Math.random() * 5) + '.png');
				}
			});
		}
	}, 1000);

	initPolls($("#rightpane"));

	// Defaults.
	if (getStorage('syncAtAll') == null) { setStorage('syncAtAll', 1); }
	if (getStorage('syncAccuracy') == null) { setStorage('syncAccuracy', 2); }
	if (getStorage('notifyMute') == null) { setStorage('notifyMute', 0); }
	if (getStorage("storeAllSquees") === null) { setStorage("storeAllSquees", 1); }
	if (getStorage('drinkNotify') == null) { setStorage('drinkNotify', 0); }
	if (getStorage('legacyPlayer') == null) { setStorage('legacyPlayer', 0); }
	if (getStorage('showTimestamps') == null) { setStorage('showTimestamps', 0); }
	if (getStorage('showChatflair') == null) { setStorage('showChatflair', 1); }
	if (getStorage('plFolAcVid') == null) { setStorage('plFolAcVid', 1); }
	if (getStorage('keeppolls') == null) { setStorage('keeppolls', 5); }
	if (getStorage('sbchatter') == null) { setStorage('sbchatter', 0); }
	if (getStorage('nightMode') == null) { setStorage('nightMode', 1); }

	// Reactions
	if (getStorage('showTimestamps') == 1) { $('body').addClass('showTimestamps'); }
	if (getStorage('sbchatter') == 1) { $('body').addClass('showSBChatter'); }
	if (getStorage('showChatflair') == 0) { $('body').addClass('hideChatFlair'); }
	if (getStorage('nightMode') == 1) { $('body').addClass('night'); }

	var t = getStorage('myFlairID');
	if (t != null) {
		MY_FLAIR_ID = parseInt(t, 10);
		$("#flairMenu").addClass("flair_" + MY_FLAIR_ID);
	}

	$(window).focus(function () {
		WINDOW_FOCUS = true;
		windowFocused();
	})
		.blur(function () {
			WINDOW_FOCUS = false;
			windowBlurred();
		});
	$("body").click(function () {
		WINDOW_FOCUS = true;
		windowFocused();
	});

	document.addEventListener('visibilitychange', function () {
		if (document.hidden) {
			windowHidden();
		} else {
			windowShown();
		}
	}, false);

	$(".chatbuffer")
		.mouseenter(function () { KEEP_BUFFER = false; })
		.mouseleave(function () { KEEP_BUFFER = true; scrollBuffersToBottom(); });

	// make emotes copyable as [](/emote)
	function collectCopy(node) {
		if (node.nodeType === Node.ELEMENT_NODE && node.getAttribute('emote_id')) {
			const emote = Bem.emotes[parseInt(node.getAttribute('emote_id'), 10)];
			const title = node.textContent ? `*${node.textContent}*` : '';
			return `[${title}](/${emote.names[0]})`;
		} else if (node.nodeType === Node.TEXT_NODE) {
			return node.textContent;
		} else if (!(node.classList.contains('chatbuffer') && node.classList.contains('inactive'))) {
			return Array.from(node.childNodes).map(collectCopy).join(' ');
		}
	}
	$('body').on('copy', event => {
		try {
			// if the selection is entirely outside the chat buffers, don't customize
			if (Array.from(document.querySelectorAll('.chatbuffer')).every(buffer => !document.getSelection().containsNode(buffer, true))) {
				return;
			}

			const text = Array.from(document.getSelection().getRangeAt(0).cloneContents().childNodes).map(collectCopy).join(' ');
			event.originalEvent.clipboardData.setData('text/plain', text);
			return false;
		} catch (err) {
			console.error('Error customizing copy operation', err);
		}
	});

	setVal("INIT_FINISHED", true);

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

function getClosest(elem, selector) {
	for (; elem && elem !== document; elem = elem.parentNode) {
		if (elem.matches(selector)) { return elem; }
	}

	return null;
}
