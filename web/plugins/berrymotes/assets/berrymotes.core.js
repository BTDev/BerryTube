/*
 * Copyright (C) 2013 Cody <cody_y@shaw.ca>
 * Copyright (C) 2013 Marminator <cody_y@shaw.ca>
 * Copyright (C) 2013 Patrick O'Leary <patrick.oleary@gmail.com>
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * COPYING for more details.
 */

Bem = typeof Bem === "undefined" ? {} : Bem;
(function ($) {
    var settingsSchema = [
        { key: 'enabled', type: "bool", default: true },
        { key: 'effects', type: "bool", default: true },
        { key: 'showNsfwEmotes', type: "bool", default: false },
        { key: 'onlyHover', type: "bool", default: false },
        { key: 'onlyHoverNSFW', type: "bool", default: false },
        { key: 'maxEmoteHeight', type: "int", default: 200 },
        { key: 'debug', type: "bool", default: false },
        { key: 'enableSlide', type: "bool", default: true },
        { key: 'enableSpin', type: "bool", default: true },
        { key: 'enableVibrate', type: "bool", default: true },
        { key: 'enableTranspose', type: "bool", default: true },
        { key: 'enableReverse', type: "bool", default: true },
        { key: 'enableRotate', type: "bool", default: true },
        { key: 'enableBrody', type: "bool", default: true },
        { key: 'enableInvert', type: "bool", default: true },
        { key: 'blacklist', type: "string_array", default: [] }
    ];

    Bem.btcdn = function(url) {
        return url.replace(/^http:\/\/berrymotes\.com/, CDN_ORIGIN + '/berrymotes');
    };

    Bem.loadSettings = function (settings, callback) {
        var total = settings.length;
        var cbCounter = function () {
            total--;
            if (total === 0) {
                callback();
            }
        };
        $.each(settings, function (i, item) {
            var cb = function (val) {
                switch (item.type) {
                    case "bool":
                        if (val === "false") val = false;
                        else if (val == "true") val = true;
                        else val = item.default;
                        break;
                    case "int":
                        if (val) val = +val;
                        else val = item.default;
                        break;
                    case "string_array":
                        if (!val) val = item.default;
                        else val = val.split(/[\s,]+/);
                        break;
                }
                Bem[item.key] = val;
                cbCounter();
            };
            Bem.settings.get(item.key, cb);
        });
    };


    Bem.effectStack = [];
    Bem.emoteRegex = /\[([^\]]*)\]\(\/([\w:!#\/]+)([-\w!]*)([^)]*)\)/gi;
    Bem.emRegex = /\*([^\]\*]+)\*/gi;
    Bem.strongRegex = /\*\*([^\]\*]+)\*\*/gi;
    Bem.searchPage = 0;

    Bem.spinAnimations = ['spin', 'zspin', 'xspin', 'yspin', '!spin', '!zspin', '!xspin', '!yspin'];
    Bem.animationSpeeds = ['slowest', 'slower', 'slow', 'fast', 'faster', 'fastest'];
    Bem.animationSpeedMap = {
        'slowest': '14s',
        'slower': '12s',
        'slow': '10s',
        'fast': '6s',
        'faster': '4s',
        'fastest': '2s'
    };

    Bem.tagRegexes = {
        'fs': 'fluttershy',
        'pp': 'pinkiepie',
        'aj': 'applejack',
        'r': 'rarity',
        'ts': 'twilightsparkle',
        'rd': 'rainbowdash',
        'mane6': 'fluttershy|pinkiepie|rarity|applejack|twilightsparkle|rainbowdash',
        'main6': 'fluttershy|pinkiepie|rarity|applejack|twilightsparkle|rainbowdash',
        'cmc': 'scootaloo|sweetiebelle|applebloom'
    };

    Bem.applyEmotesToStr = function (str) {
        var match;
        while (match = Bem.emoteRegex.exec(str)) {
            var emoteId = Bem.map[match[2]];
            if (emoteId !== undefined) {
                var emote = Bem.emotes[emoteId];
                if (Bem.isEmoteEligible(emote)) {
                    var innerText = Bem.formatInnerText(match[1]);
                    var emoteCode = Bem.getEmoteHtml(emote, match[3], innerText, match[4]);
                    //if (Bem.debug) console.log('Emote code: ' + emoteCode);
                    str = str.replace(match[0], emoteCode);
                }
            }
        }
        return str;
    };

    Bem.applyEmotesToAnchor = function (a) {
        //try {
        var href = a.getAttribute('href').substring(1).split('-');
        var name = href.shift();
        var altText = a.getAttribute('title');
        var emoteId = Bem.map[name];
        if (emoteId) {
            var $a = $(a);
            var emote = Bem.emotes[emoteId];
            var emoteCode = Bem.getEmoteHtml(emote, href.join('-'), a.innerHTML, altText);
            var emoteDom = $("<span>" + emoteCode + "</span>");
            $a.replaceWith(emoteDom);
            Bem.postEmoteEffects(emoteDom, false);
        }
        //} catch (ex) {
        //    console.log("Exception mucking with anchor: ", a, ex);
        //}
    };

    Bem.nodeTypeWhitelist = [
        'b',
        'big',
        'blockquote',
        'body',
        'br',
        'caption',
        'center',
        'cite',
        'code',
        'dir',
        'div',
        'em',
        'form',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'i',
        'label',
        'li',
        'marquee',
        'p',
        'pre',
        'q',
        's',
        'small',
        'span',
        'strike',
        'strong',
        'style',
        'sub',
        'sup',
        'td',
        'tt',
        'u'
    ];

    Bem.formatInnerText = function (innerText) {
        if (innerText) {
            while (itMatch = Bem.strongRegex.exec(innerText)) {
                innerText = innerText.replace(itMatch[0], '<strong>' + itMatch[1] + '</strong>');
            }
            while (itMatch = Bem.emRegex.exec(innerText)) {
                innerText = innerText.replace(itMatch[0], '<em>' + itMatch[1] + '</em>');
            }
        }
        return innerText;
    };

    Bem.applyEmotesToTextNode = function (textNode) {
        if (textNode.parentNode &&
            textNode.nodeValue &&
            textNode.nodeValue.search(Bem.emoteRegex) >= 0 &&
            textNode.parentNode.nodeName &&
            Bem.nodeTypeWhitelist.indexOf(textNode.parentNode.nodeName.toLowerCase()) >= 0) {
            var match;
            var str = textNode.nodeValue;
            var emoteLocations = [];
            while (match = Bem.emoteRegex.exec(str)) {
                var emoteId = Bem.map[match[2]];
                if (emoteId !== undefined) {
                    var emote = Bem.emotes[emoteId];
                    if (Bem.isEmoteEligible(emote)) {
                        var innerText = Bem.formatInnerText(match[1]);
                        emoteLocations.push({
                                start: match.index,
                                replace_length: match[0].length,
                                emote_html: Bem.getEmoteHtml(emote, match[3], innerText, match[4])
                            }
                        );
                    }
                }
            }
            var parent = textNode.parentNode;
            for (var i = emoteLocations.length - 1; i >= 0; i--) {
                var loc = emoteLocations[i];
                var newTextNode = textNode.splitText(loc.start);
                newTextNode.deleteData(0, loc.replace_length);
                var emote_node = $(loc.emote_html);
                //if(Bem.debug) console.log(loc.emote_html);
                parent.insertBefore(emote_node.get(0), newTextNode);
            }
            Bem.postEmoteEffects($(parent));
        }
    };

    Bem.getEmoteHtml = function (emote, flags, innerText, altText) {
        var emoteHtml = ['<span class="berryemote',
            emote.height > Bem.maxEmoteHeight ? ' resize' : '',
            Bem.apngSupported == false && emote.apng_url ? ' canvasapng' : '',
            Bem.onlyHover == true || ( emote.nsfw && Bem.onlyHoverNSFW ) ? ' berryemote_hover' : '',
            '" ',
            'style="',
            'height:', emote.height, 'px; ',
            'width:', emote.width, 'px; ',
            'display:inline-block; ',
            'position: relative; overflow: hidden;', '" ',
            'flags="', flags, '" ',
            'emote_id="', emote.id , '">', innerText || "" , '</span>'

        ];
        if (altText) {
            emoteHtml.push.apply(emoteHtml, ['<span class="berryemote_altText">', altText, '</span>']);
        }
        return emoteHtml.join('');
    };

    Bem.isEmoteEligible = function (emote) {
        var eligible = true;
        for (var j = 0; j < Bem.blacklist.length; j++) {
            if (emote.names.indexOf($.trim(Bem.blacklist[j])) > -1) {
                eligible = false;
            }
            // allow subreddit blacklisting
            if ('/r/'+emote.sr == $.trim(Bem.blacklist[j])) {
                eligible = false;
            }
        }
        if (Bem.showNsfwEmotes === false && emote.nsfw) eligible = false;
        if (emote.com && Bem.community != emote.com) eligible = false;

        return eligible;
    };

    Bem.applyAnimation = function (emote, $emote) {
        APNG.createAPNGCanvas(Bem.btcdn(emote.apng_url), function (canvas) {
            var position = (emote['background-position'] || ['0px', '0px']);
            var $canvas = $(canvas);
            $emote.prepend(canvas);
            $canvas.css('position', 'absolute');
            $canvas.css('left', position[0]);
            $canvas.css('top', position[1]);
        });
    };

    Bem.wrapEmoteHeight = function ($emote, height) {
        var offset = Math.floor((height - $emote.height()) / 2);
        $emote.wrap('<span class="rotation-wrapper" />').parent().css({
            'height': Math.ceil(height - offset),
            'display': 'inline-block',
            'margin-top': offset,
            'position': 'relative'});
    };

    Bem.postEmoteEffects = function (message, isSearch, ttl, username) {
        if (!Bem.apngSupported) {
            var emotesToAnimate = message.find('.canvasapng');
            $.each(emotesToAnimate, function (i, emoteDom) {
                var $emote = $(emoteDom);
                var emote = Bem.emotes[$emote.attr('emote_id')];

                if (isSearch) {
                    $emote.hover(function () {
                        var $this = $(this);
                        var bgImage = $this.css('background-image');
                        if (bgImage && bgImage != 'none') {
                            $this.css('background-image', '');
                            Bem.applyAnimation(emote, $this);
                        }
                    });
                    $emote.append('Hover to animate');
                    $emote.css('border', '1px solid black');
                    $emote.css('background-image', ['url(', emote['background-image'], ')'].join(''));
                } else {
                    Bem.applyAnimation(emote, $emote);
                }
            });
        }

        var emotesToResize = message.find('.resize');
        $.each(emotesToResize, function (i, emoteDom) {
            var $emote = $(emoteDom);
            var scale = Bem.maxEmoteHeight / $emote.height();
            var innerWrap = $emote.wrap('<span class="berryemote-wrapper-outer"><span class="berryemote-wrapper-inner"></span></span>').parent();
            var outerWrap = innerWrap.parent();
            outerWrap.css('height', $emote.height() * scale);
            outerWrap.css('width', $emote.width() * scale);
            outerWrap.css('display', 'inline-block');
            outerWrap.css('position', 'relative');
            innerWrap.css('transform', ['scale(', scale, ', ', scale, ')'].join(''));
            innerWrap.css('-webkit-transform', ['scale(', scale, ', ', scale, ')'].join(''));
            innerWrap.css('transform-origin', 'left top');
            innerWrap.css('position', 'absolute');
            innerWrap.css('top', '0');
            innerWrap.css('left', '0');
        });

        if ((Bem.onlyHover || Bem.onlyHoverNSFW) && !isSearch) {
            var emotesToHover = message.find('.berryemote_hover');
            $.each(emotesToHover, function (index, emoteDom) {
                var $emote = $(emoteDom);
                var emote = Bem.emotes[$emote.attr('emote_id')];
                var emoteName = "";
                for (var i = 0; i < emote.names.length; ++i) {
                    if (emote.names[i].length > emoteName.length) {
                        emoteName = emote.names[i];
                    }
                }
                var grandParent = $emote.parents('.berryemote-wrapper-outer');
                $emote = grandParent.is('.berryemote-wrapper-outer') ? grandParent : $emote;
                var wrap = $emote.wrap('<span class="berryemote_hover"/>').parent();
                wrap.append([
                    '<span class="berryemote_placeholder">',
                    '[](/', emoteName, ')',
                    '</span>'].join(''));
            });
        }

        var emotes = message.find('.berryemote');
        if (!isSearch && Bem.effects) {
            $.each(emotes, function (index, emoteDom) {
                var $emote = $(emoteDom);
                var flags = $emote.attr('flags');
                flags = flags ? flags.split('-') : [];

                var grandParent = $emote.parents('.berryemote-wrapper-outer');
                $emote = grandParent.is('.berryemote-wrapper-outer') ? grandParent : $emote;
                var animations = [];
                var wrapperAnimations = [];
                var transforms = [];

                var speed;
                var reverse;
                var spin;
                var brody;
                var needsWrapper;
                for (var i = 0; i < flags.length; ++i) {
                    if (Bem.animationSpeeds.indexOf(flags[i]) > -1 || flags[i].match(/^s\d/)) {
                        speed = flags[i];
                    }
                    if (flags[i] == 'r') {
                        reverse = true;
                    }
                    if (Bem.spinAnimations.indexOf(flags[i]) != -1) {
                        spin = true;
                    }
                    if (flags[i] == 'brody') {
                        brody = true;
                    }
                    if ((Bem.enableSpin && (flags[i] == 'spin' || flags[i] == 'zspin')) ||
                        (Bem.enableRotate && flags[i].match(/^\d+$/)) ||
                        (Bem.enableBrody && flags[i] == 'brody')) {
                        needsWrapper = true;
                    }
                }
                for (var i = 0; i < flags.length; ++i) {
                    if (Bem.enableSpin && Bem.spinAnimations.indexOf(flags[i]) != -1) {
                        animations.push(flags[i] + ' 2s infinite linear');
                        if (flags[i] == 'zspin' || flags[i] == 'spin') {
                            var diag = Math.sqrt($emote.width() * $emote.width() + $emote.height() * $emote.height());
                            Bem.wrapEmoteHeight($emote, diag);
                        }
                    }
                    if (Bem.enableSlide && (flags[i] == 'slide' || flags[i] == '!slide')) {
                        slideAnimations = [];
                        var slideSpeed = '8s';
                        if (speed) {
                            if (speed.match(/^s\d/)) {
                                slideSpeed = speed.replace('s', '') + 's';
                            }
                            else {
                                slideSpeed = Bem.animationSpeedMap[speed];
                                if (!slideSpeed) slideSpeed = '8s';
                            }
                        }

                        slideAnimations.push(['slideleft', slideSpeed, 'infinite ease'].join(' '));
                        if (!brody && !spin) {
                            if (flags[i] == 'slide' && reverse) {
                                slideAnimations.push(['!slideflip', slideSpeed, 'infinite ease'].join(' '));
                            }
                            else {
                                slideAnimations.push(['slideflip', slideSpeed, 'infinite ease'].join(' '));
                            }
                        }
                        if (!needsWrapper) {
                            animations.push.apply(animations, slideAnimations);
                        }
                        else {
                            wrapperAnimations.push.apply(wrapperAnimations, slideAnimations);
                        }
                    }
                    if (Bem.enableRotate && flags[i].match(/^\d+$/)) {
                        transforms.push('rotate(' + flags[i] + 'deg)');
                        var rot_height = $emote.width() * Math.abs(Math.sin(flags[i] * Math.PI / 180)) + $emote.height() * Math.abs(Math.cos(flags[i] * Math.PI / 180));
                        Bem.wrapEmoteHeight($emote, rot_height);
                    }
                    if (Bem.enableTranspose && flags[i].match(/^x\d+$/)) {
                        var shift = +flags[i].replace('x', '');
                        shift = shift > 150 ? 0 : shift;
                        $emote.css('left', shift + 'px');
                    }
                    if (Bem.enableTranspose && flags[i].match(/^!x\d+$/)) {
                        var shift = +flags[i].replace('!x', '');
                        shift = shift * -1;
                        shift = shift < -150 ? 0 : shift;
                        $emote.css('left', shift + 'px');
                    }
                    if (Bem.enableTranspose && flags[i].match(/^z\d+$/)) {
                        var zindex = +flags[i].replace('z', '');
                        zindex = zindex > 10 ? 0 : zindex;
                        $emote.css('z-index', zindex);
                    }
                    if (Bem.enableVibrate && (flags[i] == 'vibrate' || flags[i] == 'chargin' || flags[i] == 'v')) {
                        animations.unshift('vibrate 0.05s infinite linear');
                    }
                    if (Bem.enableInvert && flags[i] == 'invert') {
                        $emote.addClass('bem-invert');
                    }
                    else if (Bem.enableInvert && flags[i] == 'i') {
                        $emote.addClass('bem-hue-rotate');
                    }
                    if (Bem.enableBrody && (flags[i] == 'brody')) {
                        animations.push('brody  1.27659s infinite ease');
                        var brody_height = 1.01 * ($emote.width() * Math.sin(10 * Math.PI / 180) + $emote.height() * Math.cos(10 * Math.PI / 180));
                        Bem.wrapEmoteHeight($emote, brody_height);
                    }
                }
                if (animations.length > 0 && ttl) {
                    Bem.effectStack.push({"ttl": ttl, "$emote": $emote});
                }

                $emote.css('animation', animations.join(',').replace('!', '-'));
                if (needsWrapper) {
                    $emote.parent().css('animation', wrapperAnimations.join(',').replace('!', '-'));
                }
                if (Bem.enableReverse && reverse) transforms.push('scaleX(-1)');
                if (transforms.length > 0) {
                    $emote.css('transform', transforms.join(' '));
                }
            });
        }
        $.each(emotes, function (index, emoteDom) {
            var $emote = $(emoteDom);
            var emote = Bem.emotes[$emote.attr('emote_id')];
            var position_string = (emote['background-position'] || ['0px', '0px']).join(' ');
            var em_alt = $emote.find('em');
            var strong_alt = $emote.find('strong');
            if (em_alt || strong_alt) {
                for (var key in emote) {
                    var prefix = key.split('-')[0];
                    var val = key.slice(prefix.length + 1);
                    if (prefix == "em") {
                        em_alt.css(val, emote[key]);
                    } else if (prefix == "strong") {
                        strong_alt.css(val, emote[key]);
                    } else if (prefix == "text") {
                        $emote.css(val, emote[key]);
                    }
                }
            }
            $emote.css('background-position', position_string);
            if ($emote.is('.canvasapng') == false) {
                var bgImage = emote['background-image'];
                if (emote['apng_url'])
                    bgImage = Bem.btcdn(emote['apng_url']);
                $emote.css('background-image', ['url(', bgImage, ')'].join(''));
            }
            var flags = $emote.attr('flags');
            if (flags) flags = flags.replace('-refresh', '');

            $emote.attr('title', [emote.names,
                ' from /r/',
                emote.sr,
                flags ? ' effects: ' + flags : ''].join(''));

            if (emote['hover-background-position'] || emote['hover-background-image']) {
                $emote.hover(function () {
                        var $this = $(this);
                        var positionString = (emote['hover-background-position'] || ['0px', '0px']).join(' ');
                        var width = emote['hover-width'];
                        var height = emote['hover-height'];
                        $this.css('background-position', positionString);
                        if (emote['hover-background-image']) {
                            $this.css('background-image', ['url(', emote['hover-background-image'], ')'].join(''));
                        }
                        if (width) {
                            $this.css('width', width);
                        }
                        if (height) {
                            $this.css('height', height);
                        }
                    },
                    function () {
                        var $this = $(this);
                        var position_string = (emote['background-position'] || ['0px', '0px']).join(' ');
                        var width = emote['width'];
                        var height = emote['height'];
                        $this.css('background-position', position_string);
                        $this.css('background-image', ['url(', emote['background-image'], ')'].join(''));
                        if (width) {
                            $this.css('width', width);
                        }
                        if (height) {
                            $this.css('height', height);
                        }
                    });
            }
            username = username || "";
            if (Bem.refreshers && Bem.refreshers.indexOf(username.toLowerCase()) > -1) {
                var flags = $emote.attr('flags').split('-');
                if (flags.indexOf('refresh') >= 0) {
                    var sleep = Math.random() * 30;
                    sleep = (sleep + 1) * 1000;
                    if (Bem.debug) console.log('Got refresh, going in: ', sleep);
                    setTimeout(function () {
                        Bem.emoteRefresh(false);
                    }, sleep);
                }
            }
            $emote.removeAttr('flags');
        });
    };

    Bem.buildEmoteMap = function () {
        Bem.map = {};
        var max = Bem.emotes.length;
        for (var i = 0; i < max; ++i) {
            var berryemote = Bem.emotes[i];
            for (var j = 0; j < berryemote.names.length; ++j) {
                Bem.map[berryemote.names[j]] = i;
                berryemote.id = i;
            }
            if (!berryemote.tags) berryemote.tags = [];
            if (berryemote.apng_url) {
                berryemote.tags.push('animated');
            }
            if (berryemote.nsfw) {
                berryemote.tags.push('nsfw');
            }
        }
    };
    Bem.whenExists = function (objSelector, callback) {
        var guy = $(objSelector);
        if (guy.length <= 0) {
            setTimeout(function () {
                Bem.whenExists(objSelector, callback)
            }, 100);
        } else {
            callback(guy);
        }
    };

    Bem.injectEmoteButton = function (target) {
        Bem.whenExists(target, function () {
            var emoteButton = $('<div/>').addClass('berrymotes_button').appendTo($(target)).text("Emotes");
            emoteButton.css('margin-right', '2px');
            emoteButton.css('background', 'url(plugins/berrymotes/assets/bp.png) no-repeat scroll left center transparent');
        });
    };

    Bem.listenForInput = function () {
        $(window).keydown(function (event) {
            if ((event.keyCode == 69 && event.ctrlKey) ||
                (Bem.drunkMode && event.ctrlKey && (event.keyCode == 87 || event.keyCode == 82)) ||
                (event.keyCode == 27 && $('.berrymotes_search_results').length)) {
                if ($('.berrymotes_search_results').length) {
                    $('.berrymotes.dialogWindow').remove();
                }
                else {
                    Bem.showBerrymoteSearch();
                }
                event.preventDefault();
                return false;
            }
            return true;
        });
        $('body').on('click', '.berrymotes_button', function () {
            Bem.showBerrymoteSearch();
        });

        $('body').on('focus', ':text,textarea', function () {
            if ($(this).is(".berrymotes_search")) return;
            Bem.lastFocus = this;
            if (Bem.debug) console.log('Setting focus to: ', this);
        });
    };

    Bem.waitToStart = function () {
        if (typeof Bem.emotes === "undefined" ||
            Bem.apngSupported === undefined ||
            Bem.berrySiteInit === undefined ||
            (Bem.apngSupported ? false : typeof APNG === "undefined")) {
            setTimeout(Bem.waitToStart, 100);
            if (Bem.debug) console.log('waiting ');
        }
        else {
            if (Bem.debug) console.log('starting');

            //$("head").append('<link rel="stylesheet" type="text/css" href="plugins/berrymotes/assets/berrymotes.core.css" />');

            Bem.berrySiteInit();
            Bem.listenForInput();
        }
    };

    Bem.insertAtCursor = function (myField, myValue) {
        //IE support
        if (document.selection) {
            myField.focus();
            sel = document.selection.createRange();
            sel.text = myValue;
            var cursor = myField.selectionStart + myValue.length;
            myField.setSelectionRange(cursor, cursor);
        }
        //MOZILLA and others
        else if (myField.selectionStart || myField.selectionStart == '0') {
            var startPos = myField.selectionStart;
            var endPos = myField.selectionEnd;
            myField.value = myField.value.substring(0, startPos)
                + myValue
                + myField.value.substring(endPos, myField.value.length);
            var cursor = myField.selectionStart + myValue.length;
            myField.selectionStart = myField.selectionEnd = cursor;
        } else {
            myField.value += myValue;
        }
    };

    Bem.showBerrymoteSearch = function () {
        var searchWin = $("body").dialogWindow({
            title: "BerryEmote Search",
            uid: "berryEmoteSearch",
            center: true
        });
        searchWin.parent('.dialogWindow').addClass('berrymotes');
        if (Bem.debug) console.log('Search window: ', searchWin);
        var settingsMenu = $('<div style="float: right; cursor: pointer; text-decoration: underline;" />')
            .appendTo(searchWin)
            .text("Settings");
        settingsMenu.click(function () {
            Bem.showBerrymoteConfig();
        });

        var searchTimer;
        var pageSize = 50;
        var page = 0;
        var searchResults = [];
        var distances;
        var $searchBox = $('<input class="berrymotes_search" type="text" placeholder="Search..." />').appendTo(searchWin);
        if (Bem.berryEmoteSearchTerm) {
            $searchBox.val(Bem.berryEmoteSearchTerm);
        }
        $searchBox.focus();
        $searchBox.select();
        $('<span class="prev_page" style="cursor: pointer; text-decoration: underline;" />')
            .appendTo(searchWin)
            .text("< Prev");
        $('<span class="next_page" style="cursor: pointer; text-decoration: underline; margin-left:5px;" />')
            .appendTo(searchWin)
            .text("Next >");
        $('<span class="num_found" style="margin-left: 5px;" />')
            .appendTo(searchWin);

        var $results = $('<div class="berrymotes_search_results" style="width:500px; height: 500px; overflow-y: scroll;" ></div>').appendTo(searchWin);
        $results.on('click', '.berryemote', function (e) {
            if (Bem.lastFocus) {
                var $emote = $(e.currentTarget);
                var emote = Bem.emotes[$emote.attr('emote_id')];
                Bem.insertAtCursor(Bem.lastFocus, ['[](/', emote.names[0], ')'].join(''));
                searchWin.parent('.dialogWindow').remove();
                Bem.lastFocus.focus();
            }
        });

        searchWin.on('click', '.next_page, .prev_page', function (e) {
            $results.scrollTop(0);
            var $button = $(e.currentTarget);
            if ($button.is('.next_page')) {
                if ((page === 0 && searchResults.length > pageSize) ||
                    (page > 0 && Math.floor((searchResults.length - (page * pageSize)) / pageSize) > 0)) {
                    page++;
                    Bem.searchPage = page;
                }
            }
            else if (page > 0) {
                page--;
                Bem.searchPage = page;
            }
            showSearchResults();
        });

        var showSearchResults = function () {
            $results.empty();
            var start = page * pageSize;
            var max = Math.min(start + pageSize, searchResults.length);
            for (var i = start; i < max; ++i) {
                var emote = $('<span style="margin: 2px;" />').append(Bem.getEmoteHtml(Bem.emotes[searchResults[i]]));
                Bem.postEmoteEffects(emote, true);
                $results.append(emote);
            }
            $('.num_found').text('Found: ' + searchResults.length);
        };

        var berryEmoteSearch = function (startPage) {
            searchResults = [];
            distances = [];
            var term = $searchBox.val();
            Bem.berryEmoteSearchTerm = term;

            if (!term) {
                var max = Bem.emotes.length;
                for (var i = 0; i < max; ++i) {
                    var emote = Bem.emotes[i];
                    if (Bem.isEmoteEligible(emote)) {
                        searchResults.push(i);
                    }
                }
            }
            else {
                var searchBits = term.split(' ');
                var tags = [];
                var srs = [];
                var terms = [];
                var scores = {};
                var srRegex = /^([-+]?sr:)|([-+]?[/]?r\/)/i;
                var tagRegex = /^[-+]/i;

                function sdrify(str) {
                    return new RegExp('^' + str, 'i');
                }

                for (var i = 0; i < searchBits.length; ++i) {
                    var bit = $.trim(searchBits[i]);
                    if (bit.match(srRegex)) {
                        var trim = bit.match(srRegex)[0].length;
                        if (bit[0] == '-' || bit[0] == '+') {
                            srs.push({match: bit[0] != '-', sdr: sdrify(bit.substring(trim))});
                        } else {
                            srs.push({match: true, sdr: sdrify(bit.substring(trim))});
                        }
                    } else if (bit.match(tagRegex)) {
                        var trim = bit.match(tagRegex)[0].length;
                        var tag = bit.substring(trim);
                        var tagRegex = tag in Bem.tagRegexes ? sdrify(Bem.tagRegexes[tag]) : sdrify(tag);
                        tags.push({match: bit[0] != '-', sdr: tagRegex});
                    } else {
                        terms.push({
                            any: new RegExp(bit, 'i'),
                            prefix: sdrify(bit),
                            exact: new RegExp('^' + bit + '$')
                        });
                    }
                }

                var max = Bem.emotes.length;
                for (var i = 0; i < max; ++i) {
                    var emote = Bem.emotes[i];
                    if (!Bem.isEmoteEligible(emote)) continue;
                    var negated = false;
                    for (var k = 0; k < srs.length; ++k) {
                        var match = emote.sr.match(srs[k].sdr) || [];
                        if (match.length != srs[k].match) {
                            negated = true;
                        }
                    }
                    if (negated) continue;
                    if (tags.length && (!emote.tags || !emote.tags.length)) continue;
                    if (emote.tags && tags.length) {
                        for (var j = 0; j < tags.length; ++j) {
                            var tagSearch = tags[j];
                            var match = false;
                            for (var k = 0; k < emote.tags.length; ++k) {
                                var tag = emote.tags[k];
                                var tagMatch = tag.match(tagSearch.sdr) || [];
                                if (tagMatch.length) {
                                    match = true;
                                }
                            }
                            if (match != tagSearch.match) {
                                negated = true;
                                break;
                            }
                        }
                    }
                    if (negated) continue;
                    if (terms.length) {
                        for (var j = 0; j < terms.length; ++j) {
                            var term = terms[j];
                            var match = false;
                            for (var k = 0; k < emote.names.length; ++k) {
                                var name = emote.names[k];
                                if (name.match(term.exact)) {
                                    scores[i] = (scores[i] || 0.0) + 3;
                                    match = true;
                                } else if (name.match(term.prefix)) {
                                    scores[i] = (scores[i] || 0.0) + 2;
                                    match = true;
                                } else if (name.match(term.any)) {
                                    scores[i] = (scores[i] || 0.0) + 1;
                                    match = true;
                                }
                            }
                            for (var k = 0; k < emote.tags.length; k++) {
                                var tag = emote.tags[k];
                                if (tag.match(term.exact)) {
                                    scores[i] = (scores[i] || 0.0) + 0.3;
                                    match = true;
                                } else if (tag.match(term.prefix)) {
                                    scores[i] = (scores[i] || 0.0) + 0.2;
                                    match = true;
                                } else if (tag.match(term.any)) {
                                    scores[i] = (scores[i] || 0.0) + 0.1;
                                    match = true;
                                }
                            }
                            if (!match) {
                                delete scores[i];
                                negated = true;
                                break;
                            }
                        }
                        if (negated) continue;
                        //if (Bem.debug) console.log('Matched emote, score: ', emote, scores[i]);
                    } else {
                        scores[i] = 0;
                    }
                }
                for (var id in scores) {
                    searchResults.push(id);
                }
                searchResults.sort(function (a, b) {
                    return scores[b] - scores[a];
                });
            }

            page = startPage;
            showSearchResults();
        };

        $searchBox.keyup(function (e) {
            clearTimeout(searchTimer);
            if (e.keyCode == 13) {
                berryEmoteSearch(0);
            }
            // don't search if they release control otherwise the shortcut loses your page#
            else if (e.keyCode != 17) {
                searchTimer = setTimeout(function () {
                    berryEmoteSearch(0);
                }, 400);
            }
        });

        berryEmoteSearch(Bem.searchPage);

        $('<span class="prev_page" style="cursor: pointer; text-decoration: underline;" />')
            .appendTo(searchWin)
            .text("< Prev");
        $('<span class="next_page" style="cursor: pointer; text-decoration: underline; margin-left:5px;" />')
            .appendTo(searchWin)
            .text("Next >");

        searchWin.window.center();
    };

    Bem.showBerrymoteConfig = function () {
        var row;
        var settWin = $("body").dialogWindow({
            title: "BerryEmote Settings",
            uid: "berryEmoteSettings",
            center: true
        });
        settWin.parent('.dialogWindow').addClass('berrymotes');

        var configOps = $('<fieldset/>').appendTo(settWin);
        var rowDivStr = '<div class="settings_row" />';
        var rowSpanStr = '<span class="settings_span" />';
        //----------------------------------------
        row = $(rowDivStr).appendTo(configOps);
        $(rowSpanStr).text("Display Emotes: ").appendTo(row);
        var displayEmotes = $('<input/>').attr('type', 'checkbox').appendTo(row);
        if (Bem.enabled) displayEmotes.attr('checked', 'checked');
        displayEmotes.change(function () {
            var enabled = $(this).is(":checked");
            Bem.enabled = enabled;
            Bem.settings.set('enabled', enabled);
        });
        //----------------------------------------
        row = $(rowDivStr).appendTo(configOps);
        $(rowSpanStr).text("NSFW Emotes: ").appendTo(row);
        var nsfwEmotes = $('<input/>').attr('type', 'checkbox').appendTo(row);
        if (Bem.showNsfwEmotes) nsfwEmotes.attr('checked', 'checked');
        nsfwEmotes.change(function () {
            var enabled = $(this).is(":checked");
            Bem.showNsfwEmotes = enabled;
            Bem.settings.set('showNsfwEmotes', enabled);
            nsfwHover.prop("disabled", !enabled)
        });
        //----------------------------------------
        $(rowSpanStr).text(" only on hover: ").appendTo(row);
        var nsfwHover = $('<input/>').attr('type', 'checkbox').appendTo(row);
        nsfwHover.prop('disabled', !Bem.showNsfwEmotes);
        if (Bem.onlyHoverNSFW) nsfwHover.attr('checked', 'checked');
        nsfwHover.change(function () {
            var enabled = $(this).is(":checked");
            Bem.onlyHoverNSFW = enabled;
            Bem.settings.set('onlyHoverNSFW', enabled);
        });
        //----------------------------------------
        row = $(rowDivStr).appendTo(configOps);
        $(rowSpanStr).text("Only show emotes on hover: ").appendTo(row);
        var cadesBeardMode = $('<input/>').attr('type', 'checkbox').appendTo(row);
        if (Bem.onlyHover) cadesBeardMode.attr('checked', 'checked');
        cadesBeardMode.change(function () {
            var enabled = $(this).is(":checked");
            Bem.onlyHover = enabled;
            Bem.settings.set('onlyHover', enabled);
        });
        //----------------------------------------
        row = $(rowDivStr).appendTo(configOps);
        $(rowSpanStr).text("Enable extra effects: ").appendTo(row);
        var effects = $('<input/>').attr('type', 'checkbox').appendTo(row);
        if (Bem.effects) effects.attr('checked', 'checked');
        effects.change(function () {
            var enabled = $(this).is(":checked");
            Bem.effects = enabled;
            Bem.settings.set('effects', enabled);
        });
        effects = $('<div style="margin-left:10px; border: 1px solid black;"><div style="clear:both;"/></div>');
        configOps.append(effects);
        //----------------------------------------
        Bem.berryCreateOption(effects, "Slide Effect", "enableSlide");
        Bem.berryCreateOption(effects, "Spin Effect", "enableSpin");
        Bem.berryCreateOption(effects, "Vibrate Effect", "enableVibrate");
        Bem.berryCreateOption(effects, "Transpose (shift left and right) Effect", "enableTranspose");
        Bem.berryCreateOption(effects, "Reverse Effect", "enableReverse");
        Bem.berryCreateOption(effects, "Rotate Effect", "enableRotate");
        Bem.berryCreateOption(effects, "Brody Effect", "enableBrody");
        Bem.berryCreateOption(effects, "Invert Effect", "enableInvert");
        //----------------------------------------
        row = $(rowDivStr).appendTo(configOps);
        $(rowSpanStr).text("Max Height:").appendTo(row);
        var maxHeight = $('<input/>').attr('type', 'text').val(Bem.maxEmoteHeight).addClass("small").appendTo(row);
        maxHeight.css('text-align', 'center');
        maxHeight.css('width', '30px');
        maxHeight.keyup(function () {
            Bem.maxEmoteHeight = maxHeight.val();
            Bem.settings.set('maxEmoteHeight', maxHeight.val());
        });
        $(rowSpanStr).text("pixels.").appendTo(row);
        //----------------------------------------
        row = $(rowDivStr).appendTo(configOps);
        $(rowSpanStr).text("Emote Blacklist").appendTo(row);
        var emoteBlacklist = $('<textarea/>').val(Bem.blacklist).appendTo(row);
        emoteBlacklist.css('width', '300px');
        emoteBlacklist.css('height', '100px');
        emoteBlacklist.css('display', 'block');
        emoteBlacklist.css('margin-left', '10px');
        emoteBlacklist.keyup(function () {
            Bem.blacklist = emoteBlacklist.val().split(',');
            Bem.settings.set('blacklist', emoteBlacklist.val());
        });//----------------------------------------

        if (Bem.siteSettings) {
            Bem.siteSettings(configOps);
        }
        settWin.window.center();
    };

    Bem.berryCreateOption = function (configOps, title, optionName) {
        var rowDivStr = '<div class="settings_row" />';
        var rowSpanStr = '<span class="settings_span" />';
        row = $(rowDivStr).appendTo(configOps);
        $(rowSpanStr).text(title).appendTo(row);
        var chkBox = $('<input/>').attr('type', 'checkbox').appendTo(row);
        if (Bem[optionName]) chkBox.attr('checked', 'checked');
        chkBox.change(function () {
            var enabled = $(this).is(":checked");
            Bem[optionName] = enabled;
            Bem.settings.set(optionName, enabled);
        });
    };

    Bem.loadSettings(settingsSchema, function () {
        var load = false;

        if (Bem.enableSiteWhitelist && Bem.siteWhitelist && Bem.siteWhitelist.length > 0) {
            for (var i = 0; i < Bem.siteWhitelist.length; ++i) {
                if (location.hostname.match(Bem.siteWhitelist[i])) {
                    load = true;
                }
            }
        } else {
            load = true;
            if (Bem.enableSiteBlacklist && Bem.siteBlacklist) {
                for (var i = 0; i < Bem.siteBlacklist.length; ++i) {
                    if (location.hostname.match(Bem.siteBlacklist[i])) {
                        load = false;
                    }
                }
            }
        }

        if (location.hostname == "gmiegnmgindbinjikakekghnpdhflooc") {
            load = false;
            Bem.showBerrymoteConfig();
        }

        if (load) {
            if (Bem.debug) console.log("Load is a go, waiting to start.");
            Bem.apngSupported = typeof APNG === "undefined";
            Bem.emoteRefresh();
            Bem.waitToStart();
            var unsafeGlobal;
            if (typeof unsafeWindow !== 'undefined') unsafeGlobal = unsafeWindow;
            if (!unsafeGlobal && typeof Global !== 'undefined') unsafeGlobal = Global;
            if (!unsafeGlobal) unsafeGlobal = (window || this);

            unsafeGlobal.Bem = Bem;
        } else if (Bem.debug) console.log("Load is a negative, going quiet.");
    });

})(Bem.jQuery);
