/*
 * Copyright (C) 2013 Marminator <cody_y@shaw.ca>
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * COPYING for more details.
 */

Bem = typeof Bem === "undefined" ? {} : Bem;
Bem.jQuery = jQuery;
Bem.community = "bt";

var berrytube_settings_schema = [
    { key: 'drunkMode', type: "bool", default: false },
    { key: 'effectTTL', type: "int", default: 20 }
];

Bem.loggingIn = false;
Bem.refreshers = ['marminator', 'toastdeib', 'miggyb', 'jerick'];

Bem.berrySiteInit = function () {
    Bem.loadSettings(berrytube_settings_schema, function () {
        // Export it for backwards compat with BT squee inbox
        postEmoteEffects = Bem.postEmoteEffects;
        var invertScript;
        if (document.body.style.webkitFilter !== undefined) {
            invertScript = document.createElement('script');
            invertScript.type = 'text/javascript';
            invertScript.src = 'plugins/berrymotes/assets/berrymotes.webkit.invert.js';
            document.body.appendChild(invertScript);
        } else {
            invertScript = document.createElement('script');
            invertScript.type = 'text/javascript';
            invertScript.src = 'plugins/berrymotes/assets/berrymotes.invertfilter.js';
            document.body.appendChild(invertScript);
        }
        Bem.monkeyPatchChat();
        Bem.monkeyPatchPoll();
        Bem.monkeyPatchTabComplete();
        Bem.injectEmoteButton('#chatControls');
        window.onbeforeunload = function () {
            if (Bem.drunkMode && !Bem.loggingIn) {
                return "Are you sure you want to navigate away?";
            }
            // not in drunk mode, just let it happen.
            return null;
        };

        $('form').submit(function () {
            Bem.loggingIn = true;
        });

        if (!Bem.enabled){
            // do not emote existing chat messages if emotes are disabled
            return null;
        }

        function handleText(node) {
            Bem.applyEmotesToTextNode(node);
        }

        function walk(node) {
            // I stole this function from here:
            // http://is.gd/mwZp7E
            var child, next;
            switch (node.nodeType) {
                case 1:  // Element
                case 9:  // Document
                case 11: // Document fragment
                    child = node.firstChild;
                    while (child) {
                        next = child.nextSibling;
                        walk(child);
                        child = next;
                    }
                    break;
                case 3: // Text node
                    handleText(node);
                    break;
            }
        }
        walk(document.body);
    });
};

// [name] is the name of the event "click", "mouseover", ..
// same as you'd pass it to bind()
// [fn] is the handler function
$.fn.bindFirst = function (name, fn) {
    // bind as you normally would
    // don't want to miss out on any jQuery magic
    this.on(name, fn);

    // Thanks to a comment by @Martin, adding support for
    // namespaced events too.
    this.each(function () {
        var handlers = $._data(this, 'events')[name.split('.')[0]];
        // take out the handler we just inserted from the end
        var handler = handlers.pop();
        // move it at the beginning
        handlers.splice(0, 0, handler);
    });
};

function marmReactiveMode() {
    if (Bem.debug)
        $("head").append('<link rel="stylesheet" type="text/css" href="plugins/berrymotes/assets/reactive.staging.css" />');
    else
        $("head").append('<link rel="stylesheet" type="text/css" href="plugins/berrymotes/assets/reactive.css" />');

    $('.wrapper').first().hide();

    var pollpane = $('#pollpane');
    $('#pollControl').appendTo(pollpane);
    var pollClose = $('<div class="close"></div>');
    pollpane.prepend(pollClose);
    pollClose.click(function () {
        pollpane.hide();
    });

    var showPollpane = function () {
        pollpane.show();
    };

    Bem.whenExists('#chatControls', function () {
        if (Bem.debug) console.log('Injecting poll button.');
        var menu = $('<div/>').addClass('settings').appendTo($('#chatControls')).text("Poll");
        menu.css('margin-right', '2px');
        menu.css('background', 'none');
        menu.click(function () {
            showPollpane();
        });
    });

    var playlist = $('#leftpane');
    var playlistClose = $('<div class="close"></div>');
    playlist.prepend(playlistClose);
    playlistClose.click(function () {
        playlist.hide();
    });

    $(window).bindFirst('keydown', function (event) {
        if (event.keyCode == 27) {
            playlist.hide();
            return true;
        }
        if (!(event.keyCode == 70 && event.ctrlKey)) return true;
        event.preventDefault();
        playlist.show();
        return false;
    });

    Bem.whenExists('#chatControls', function () {
        if (Bem.debug) console.log('Injecting playlist button.');
        var menu = $('<div/>').addClass('settings').appendTo($('#chatControls')).text("Playlist");
        menu.css('margin-right', '2px');
        menu.css('background', 'none');
        menu.click(function () {
            playlist.show();
            smartRefreshScrollbar();
            realignPosHelper();
            if (getCookie("plFolAcVid") == "1") {
                var x = ACTIVE.domobj.index();
                x -= 2;
                if (x < 0) x = 0;
                scrollToPlEntry(x);
            }
        });
    });

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        $("head").append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>');
    }
    Bem.whenExists('#chatControls', function () {
        if (NAME) {
            $('#headbar').hide();
        }
    });
}

Bem.monkeyPatchChat = function () {
    var oldAddChatMsg = addChatMsg;
    addChatMsg = function (data, _to) {
        var applyEmotes = Bem.enabled && data.msg.msg.match(Bem.emoteRegex);
        if (applyEmotes) {
            data.msg.msg = Bem.applyEmotesToStr(data.msg.msg);
        }
        Bem.effectStack = $.grep(Bem.effectStack, function (effectEmote, i) {
            effectEmote["ttl"] -= 1;
            if (effectEmote["ttl"] >= 0) {
                return true; // keep the element in the array
            }
            else {
                effectEmote["$emote"].css("animation", "none");
                return false;
            }
        });
        oldAddChatMsg.apply(this, arguments);
        if (applyEmotes) {
            var chatMessage = $(_to).children(':last-child');
            Bem.postEmoteEffects(chatMessage, false, Bem.effectTTL, data.msg.nick);
        }
    }
};

Bem.monkeyPatchPoll = function () {
    var oldPoll = newPoll;
    newPoll = function (data) {
        if (Bem.enabled) {
            for (var i = 0; i < data.options.length; ++i) {
                // workaround so we don't conflict with BPM
                data.options[i] = data.options[i].replace(Bem.emoteRegex, '\\\\$1$2$3');
            }
        }
        oldPoll(data);
        if (Bem.enabled) {
            var poll = $('.poll.active');
            var options = poll.find('div.label, .title');
            $.each(options, function (i, option) {
                var $option = $(option);
                if (Bem.debug) console.log(option);
                var t = $option.text().replace(">", "&gt;").replace("<", "&lt;");
                t = t.replace(/\\\\([\w-]+)/i, '[](/$1)');
                t = Bem.applyEmotesToStr(t);
                $option.html(t);
                Bem.postEmoteEffects($option);
            });
        }
    }
};

Bem.monkeyPatchTabComplete = function () {
    var oldTabComplete = tabComplete;
    tabComplete = function (elem) {
        var chat = elem.val();
        var ts = elem.data('tabcycle');
        var i = elem.data('tabindex');
        var hasTS = false;

        if (typeof ts != "undefined" && ts != false) hasTS = true;

        if (hasTS == false) {
            console.log("New Tab");
            var endword = /\\\\([^ ]+)$/i;
            var m = chat.match(endword);
            if (m) {
                var emoteToComplete = m[1];
                if (Bem.debug) console.log('Found emote to tab complete: ', emoteToComplete)
            } else {
                return oldTabComplete(elem);
            }

            var re = new RegExp('^' + emoteToComplete + '.*', 'i');

            var ret = [];
            for (var i in Bem.map) {
                if (Bem.isEmoteEligible(Bem.emotes[Bem.map[i]])) {
                    var m = i.match(re);
                    if (m) ret.push(m[0]);
                }
            }
            ret.sort();

            if (ret.length == 1) {
                var x = chat.replace(endword, '\\\\' + ret[0]);
                elem.val(x);
            }
            if (ret.length > 1) {
                var ts = [];
                for (var i in ret) {
                    var x = chat.replace(endword, '\\\\' + ret[i]);
                    ts.push(x);
                }
                elem.data('tabcycle', ts);
                elem.data('tabindex', 0);
                hasTS = true;
                console.log(elem.data());
            }
        }

        if (hasTS == true) {
            console.log("Cycle");
            var ts = elem.data('tabcycle');
            var i = elem.data('tabindex');
            elem.val(ts[i]);
            if (++i >= ts.length) i = 0;
            elem.data('tabindex', i);
        }

        return ret
    };
};

Bem.siteSettings = function (configOps) {
    //----------------------------------------
    row = $('<div/>').appendTo(configOps);
    $('<span/>').text("Drunk mode (prevents accidental navigation): ").appendTo(row);
    var drunkMode = $('<input/>').attr('type', 'checkbox').appendTo(row);
    if (Bem.drunkMode) drunkMode.attr('checked', 'checked');
    drunkMode.change(function () {
        var enabled = $(this).is(":checked");
        Bem.drunkMode = enabled;
        Bem.settings.set('drunkMode', enabled);
    });
    //----------------------------------------
    row = $('<div/>').appendTo(configOps);
    $('<span/>').text("Max chat lines to keep effects running on (saves CPU):").appendTo(row);
    var chatTTL = $('<input/>').attr('type', 'text').val(Bem.effectTTL).addClass("small").appendTo(row);
    chatTTL.css('text-align', 'center');
    chatTTL.css('width', '30px');
    chatTTL.keyup(function () {
        Bem.effectTTL = chatTTL.val();
        Bem.settings.set('effectTTL', chatTTL.val());
    });
    //----------------------------------------
    row = $('<div/>').appendTo(configOps);
    var refresh = $('<button>Refresh Data</button>').appendTo(row);
    refresh.click(function () {
        Bem.emoteRefresh(false);
    });
};

Bem.settings = {
    get: function (key, callback) {
        var val = localStorage.getItem(key);
        callback(val);
    },
    set: function (key, val, callback) {
        localStorage.setItem(key, val);
        if (callback) callback();
    }
};

Bem.settings.set('siteWhitelist', [location.hostname]);


//Bem.emoteRefresh = function() {
//    $.getScript('http://backstage.berrytube.tv/marminator/berrymotes_data.js', function () {
//        Bem.buildEmoteMap();
//    });
//};

Bem.emoteRefresh = function (cache) {
    cache = cache !== false;
    $.ajax({
        cache: cache,
        url: CDN_ORIGIN + '/berrymotes/assets/berrymotes_json_data.json',
        dataType: 'json',
        success: function (data) {
            Bem.emotes = data;
            Bem.buildEmoteMap();
        }
    });
};

Bem.apngSupported = true;

/*
Bem.settings.get('apngSupported', function (apngSupported) {
    if (apngSupported === null || apngSupported === undefined) {
        (function () {
            var apngTest = new Image(),
                ctx = document.createElement("canvas").getContext("2d");
            apngTest.onload = function () {
                ctx.drawImage(apngTest, 0, 0);
                apngSupported = ctx.getImageData(0, 0, 1, 1).data[3] === 0;
                localStorage.setItem('apngSupported', apngSupported);
                Bem.apngSupported = apngSupported;
                if (!apngSupported) {
                    // If we don't have apng support we're gonna load up the canvas hack. No reason to load if apng support exists.
                    var script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = 'plugins/berrymotes/assets/apng-canvas.min.js';
                    document.body.appendChild(script);
                }
            };
            apngTest.src =
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjVEwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAAAAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==";
            // frame 1 (skipped on apng-supporting browsers): [0, 0, 0, 255]
            // frame 2: [0, 0, 0, 0]
        }());
    }
    else if (apngSupported === 'false') {
        Bem.apngSupported = false;
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'plugins/berrymotes/assets/apng-canvas.min.js';
        document.body.appendChild(script);
    } else {
        Bem.apngSupported = true;
    }
});
*/
