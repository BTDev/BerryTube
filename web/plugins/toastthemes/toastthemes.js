/**
 * @projectDescription ==ToastThemes==
 *
 * This script creates a series of buttons used for loading my custom CSS themes for BerryTube.
 *
 * Current features:
 * - Shrinkable/expandable button pane to avoid taking up unnecessary space on the page.
 * - Semi-transparent expand button to benefit users in chat-only mode.
 * - 51 themes to choose from, now grouped and with a customizable favorites bar.
 * - ?! button, complete with easter egg(s?).
 * - "NEW!" indicator for all themes that have been added in the past three days.
 * - "UPDATED!" indicator for all themes that have been updated in the past three days.
 * - Chat Buffer Management, a feature intended to help prevent script-added elements from jumping.
 * - Auto-loading themes for some special videos (e.g. Tropical Octav3 loads Octav3Tub3). Themes loaded
 *	   this way will automatically revert after the video ends. This feature can be disabled in settings.
 * - Playlist and poll effects, including GAKIFICATION, wobniaR, rot13, and sehro-Vision™!
 *
 * Special thanks to:
 * - wut, for his BerryButtons script, which I used as a starting point
 * - BasementDerp, for providing me with all of the graphics for DerpyToob
 * - Marminator, for providing me with the raw graphics for DeskFuckTube
 * - SovietSparkle, for cropping out the lovely Barkley head I used for SlamTube
 * - Jerick, for making most of the vectors for NeonTube
 * - Cades and the entire modmin team, for making and running BerryTube (my favorite tube, _even_ including the ear tubes)
 *
 * Last updated: February 16th, 2014
 *
 * @author  Toastdeib
 * @version 3.8
 **/

$.getScript('plugins/toastthemes/toastlib.js', initToastThemes);

// Declare variables
var officialGroup;
var mainPonyGroup;
var bgPonyGroup;
var nonPonyGroup;
var fourthPartyGroup;
var favoritesGroup;
var groupList;
var cbmsEnabled;
var cbmsTrimLength;
var cbmsInterval;
var intervalId;
var autoThemeEnabled;
var autoThemeTimeoutId;
var pollNotifyEnabled;
var useAlternatePollSound;
var OHMY;
var SHOOBEEDOO;
var DOOT;
var imageVisible;
var showBonusPonies;
var slamming;
var welcomeToTheJam;
var originalTheme;
var gakified;
var rdwut;
var rotated;
var goggles;
var loggingEnabled;
var actualSetColorTheme;
var actualShowConfigMenu;
var crawlId;
var crawlDirection;
var crawlPercent;

 // Theme Button class definition
 function ThemeButton(id, name, themeUrl, tooltip, isNew, isUpdated) {
	// Properties
	this.buttonId = id;
	this.buttonDivId = id + 'Div';
	this.themeName = name;
	this.themeUrl = themeUrl;
	this.tooltip = tooltip;
	this.settingName = id + 'Favorited';
	this.isFavorited = getStoredBoolean(this.settingName, false);
	this.isNew = isNew;
	this.isUpdated = isUpdated;

	// Functions
	this.getButtonDiv = function(suffix) {
		if (suffix == undefined || suffix == null) {
			suffix = '';
		}
		var button = $('<div/>').attr('id', this.buttonDivId + suffix).attr('title', this.tooltip).addClass('themeButtonWrapper').append(
			$('<button/>').attr('id', this.buttonId + suffix).addClass(this.isFavorited ? 'themeButtonFavorited' : 'themeButton').text(this.themeName));
		if (isNew) {
			button.append($('<span/>').addClass('newText').text('NEW!'));
		}
		else if (isUpdated) {
			button.append($('<span/>').addClass('updatedText').text('UPDATED!'));
		}
		return button;
	}

	this.wireListener = function(suffix) {
		if (suffix == undefined || suffix == null) {
			suffix = '';
		}
		var button = $('#' + this.buttonId + suffix);
		button.click(function() { setColorTheme(themeUrl, false); });
		if (suffix == '') {
			button.bind('contextmenu', function(e) { toggleFavorited(themeUrl); e.preventDefault(); });
		}
		else {
			// If we're on the favorites list, just consume the event, don't toggle it
			button.bind('contextmenu', function(e) { e.preventDefault(); });
		}
	}

	this.toggleIsFavorited = function() {
		// No suffix nonsense here - this will never be called by the favorites list buttons
		this.isFavorited = !this.isFavorited;
		setStoredValue(this.settingName, this.isFavorited);
		$('#' + this.buttonId).removeClass().addClass(this.isFavorited ? 'themeButtonFavorited' : 'themeButton');
	}
}

function GroupButton(id, name, hasNew, hasUpdated, suffix, themeButtons) {
	// Properties
	this.buttonId = id;
	this.buttonDivId = id + 'Div';
	this.buttonListDivId = id + 'ListDiv';
	this.listDiv = null;
	this.groupName = name;
	this.suffix = suffix;
	this.themeButtons = themeButtons ? themeButtons : [];
	this.hasNew = hasNew;
	this.hasUpdated = hasUpdated;

	this.getButtonDiv = function() {
		var button = $('<div/>').attr('id', this.buttonDivId).addClass('groupButtonWrapper').append(
			$('<button/>').attr('id', this.buttonId).addClass('themeButton').text(this.groupName));
		if (this.hasNew) {
			button.append($('<span/>').addClass('newText').text('NEW!'));
		}
		else if (this.hasUpdated) {
			button.append($('<span/>').addClass('updatedText').text('UPDATED!'));
		}
		return button;
	}

	this.addButton = function(button, forceIndex = null) {
		var insertIndex = 0;
		if (forceIndex !== null) {
			insertIndex = forceIndex;
		} else {
			for (var i = 0; i < this.themeButtons.length; i++) {
				if (button.themeName < this.themeButtons[i].themeName) {
					break;
				}
				insertIndex++;
			}
		}
		this.themeButtons.splice(insertIndex, 0, button);
	}

	this.removeButton = function(button) {
		for (var i = 0; i < this.themeButtons.length; i++) {
			if (this.themeButtons[i] == button) {
				this.themeButtons.splice(i, 1);
				break;
			}
		}
	}

	this.getButtonByUrl = function(url) {
		for (var i = 0; i < this.themeButtons.length; i++) {
			if (this.themeButtons[i].themeUrl == url) {
				return this.themeButtons[i];
			}
		}

		return null;
	}

	this.getButtonList = function() {
		var result = $('<div/>').attr('id', this.buttonListDivId).addClass('buttonListContainer').css('display', 'none');
		if (this.themeButtons.length > 0) {
			result.append($('<div/>').css('padding', '4px 5px 3px 5px').css('text-decoration', 'underline').text(this.groupName));
			for (var i = 0; i < this.themeButtons.length; i++) {
				result.append(this.themeButtons[i].getButtonDiv(this.suffix));
			}
		}
		else {
			result.append($('<div/>').css('padding', '4px 5px 3px 5px').text('You have no favorites selected. To flag a theme as a favorite, right-click it in the other lists.'));
		}

		return result;
	}

	this.wireListener = function() {
		$('#' + this.buttonId).click(function() { toggleThemeListDiv(id + 'ListDiv'); });
	}

	this.wireThemeListeners = function() {
		for (var i = 0; i < this.themeButtons.length; i++) {
			this.themeButtons[i].wireListener(this.suffix);
		}
	}

	this.reloadButtonList = function() {
		$('#' + this.buttonListDivId).remove();
		$('body').append(this.getButtonList());
		this.wireThemeListeners();
	}
}

function initToastThemes(data, textStatus, jqxhr) {
	// Theme group buttons
	officialGroup = new GroupButton('officialGroup', 'Official', false, false);
	mainPonyGroup = new GroupButton('mainPonyGroup', 'Main Pony', false, false);
	bgPonyGroup = new GroupButton('bgPonyGroup', 'Background Pony', false, false);
	nonPonyGroup = new GroupButton('nonPonyGroup', 'Non-Pony', false, false);
	fourthPartyGroup = new GroupButton('fourthPartyGroup', '4th Party', isNewOrUpdated(2015, 2, 27), false);
	favoritesGroup = new GroupButton('favoritesGroup', 'Favorites', false, false, 'Fav');
	groupList = [officialGroup, mainPonyGroup, bgPonyGroup, nonPonyGroup, fourthPartyGroup, favoritesGroup];

	officialGroup.addButton(new ThemeButton('lunaButton', 'LunaTube', 'css/colors-woona.css', '', false, false));
	//officialGroup.addButton(new ThemeButton('trixieButton', 'TrixieTube', 'http://backstage.berrytube.tv/miggyb/spoilertube.css', '', false, false));
	officialGroup.addButton(new ThemeButton('malPinkieButton', 'PinkieTube', 'https://radio.berrytube.tv/themes/pinkietube.css', '', false, false));
	officialGroup.addButton(new ThemeButton('celestiaButton', 'CelestiaTube', 'https://radio.berrytube.tv/themes/celestiatube.css', '', false, false));
	officialGroup.addButton(new ThemeButton('appleoosaButton', 'FeastTube', 'css/colors-appleoosans.css', '', false, false));
	officialGroup.addButton(new ThemeButton('holidayButton', 'HolidayTube', 'css/colors-holiday.css', '', false, false));
	officialGroup.addButton(new ThemeButton('btcon2020', 'BTCon 2020', 'plugins/toastthemes/cdncss.php?theme=btcon2020', '', false, false));
	officialGroup.addButton(new ThemeButton('btcon2021', 'BTCon 2021', 'plugins/toastthemes/cdncss.php?theme=btcon2021', '', false, false));
	officialGroup.addButton(new ThemeButton('btcon2022', 'BTCon 2022', 'plugins/toastthemes/cdncss.php?theme=btcon2022', '', false, false));
	officialGroup.addButton(new ThemeButton('btcon2023', 'BTCon 2023', 'plugins/toastthemes/cdncss.php?theme=btcon2023', '', false, false));
	officialGroup.addButton(new ThemeButton('berryButton', 'BerryTube', '', '', false, false), 0);

	mainPonyGroup.addButton(new ThemeButton('scootsButton', 'ScootaTube', 'plugins/toastthemes/cdncss.php?theme=scoots', '', false, false));
	mainPonyGroup.addButton(new ThemeButton('dashieButton', 'DashieTube', 'plugins/toastthemes/cdncss.php?theme=dashie', '', false, false));
	mainPonyGroup.addButton(new ThemeButton('apocalypseButton', 'ApocalypseTube', 'plugins/toastthemes/cdncss.php?theme=apocalypse', '', false, false));
	mainPonyGroup.addButton(new ThemeButton('ponysockButton', 'SockTube', 'plugins/toastthemes/cdncss.php?theme=sock', '', false, false));
	mainPonyGroup.addButton(new ThemeButton('cmcButton', 'CMCTube', 'plugins/toastthemes/cdncss.php?theme=cmc', '', false, false));
	mainPonyGroup.addButton(new ThemeButton('rarityButton', 'RarityTube', 'plugins/toastthemes/cdncss.php?theme=rarity', '', false, false));
	mainPonyGroup.addButton(new ThemeButton('appleButton', 'AppleTube', 'plugins/toastthemes/cdncss.php?theme=apple', '', false, false));
	mainPonyGroup.addButton(new ThemeButton('sparkleButton', 'SparkleTube', 'plugins/toastthemes/cdncss.php?theme=sparkle', '', false, false));
	mainPonyGroup.addButton(new ThemeButton('flutterButton', 'FlutterTube', 'plugins/toastthemes/cdncss.php?theme=flutter', '', false, false));
	mainPonyGroup.addButton(new ThemeButton('pinkieButton', 'PinkieTube', 'plugins/toastthemes/cdncss.php?theme=pinkie', '', false, false));
	mainPonyGroup.addButton(new ThemeButton('blazeitButton', '420BlazeItTube', 'plugins/toastthemes/cdncss.php?theme=blazeit', '', false, false));
	mainPonyGroup.addButton(new ThemeButton('woonaButton', 'WoonaTube', 'plugins/toastthemes/cdncss.php?theme=woona', '', false, false));

	bgPonyGroup.addButton(new ThemeButton('octav3Button', 'Octav3Tub3', 'plugins/toastthemes/cdncss.php?theme=octav3', '', false, false));
	bgPonyGroup.addButton(new ThemeButton('tomButton', 'TomTube', 'plugins/toastthemes/cdncss.php?theme=tom', '', false, false));
	bgPonyGroup.addButton(new ThemeButton('derpyButton', 'DerpyToob', 'plugins/toastthemes/cdncss.php?theme=derpy', '', false, false));
	bgPonyGroup.addButton(new ThemeButton('twistButton', 'TwistTube', 'plugins/toastthemes/cdncss.php?theme=twist', '', false, false));
	bgPonyGroup.addButton(new ThemeButton('toothpasteButton', 'ToothpasteTube', 'plugins/toastthemes/cdncss.php?theme=toothpaste', '', false, false));
	bgPonyGroup.addButton(new ThemeButton('deskfuckButton', 'DeskFuckTube', 'plugins/toastthemes/cdncss.php?theme=deskfuck', '', false, false));
	bgPonyGroup.addButton(new ThemeButton('fancyButton', 'FancyTube', 'plugins/toastthemes/cdncss.php?theme=fancy', '', false, false));
	bgPonyGroup.addButton(new ThemeButton('teiButton', 'TeiTheTube', 'plugins/toastthemes/cdncss.php?theme=tei', '', false, false));
	bgPonyGroup.addButton(new ThemeButton('birthdayButton', 'BirthdayTube', 'plugins/toastthemes/cdncss.php?theme=birthday', '', false, false));
	bgPonyGroup.addButton(new ThemeButton('paddyButton', 'StPatrickTube', 'plugins/toastthemes/cdncss.php?theme=paddy', '', false, false));
	bgPonyGroup.addButton(new ThemeButton('seaButton', 'SeaprincessyTube', 'plugins/toastthemes/cdncss.php?theme=seapony', '', false, false));
	bgPonyGroup.addButton(new ThemeButton('octaviaButton', 'OctaviaTube', 'plugins/toastthemes/cdncss.php?theme=octavia', '', false, false));
	bgPonyGroup.addButton(new ThemeButton('pfbtdorButton', 'PFBTDOR', 'plugins/toastthemes/cdncss.php?theme=pfbtdor', '', false, false));
	bgPonyGroup.addButton(new ThemeButton('vagrantButton', 'VagrantTube', 'plugins/toastthemes/cdncss.php?theme=vagrant', '', false, false));
	bgPonyGroup.addButton(new ThemeButton('shippingButton', 'ShippingTube', 'plugins/toastthemes/cdncss.php?theme=shipping', '', false, false));

	nonPonyGroup.addButton(new ThemeButton('toastButton', 'ToastTube', 'plugins/toastthemes/cdncss.php?theme=toast', '', false, false));
	nonPonyGroup.addButton(new ThemeButton('attorneyButton', 'AttorneyTube', 'plugins/toastthemes/cdncss.php?theme=attorney', '', false, false));
	nonPonyGroup.addButton(new ThemeButton('earButton', 'EarTubes', 'plugins/toastthemes/cdncss.php?theme=ear', '', false, false));
	nonPonyGroup.addButton(new ThemeButton('tubeSockButton', 'TubeSock', 'plugins/toastthemes/cdncss.php?theme=tubesock', '', false, false));
	nonPonyGroup.addButton(new ThemeButton('slamButton', 'SlamTube', 'plugins/toastthemes/cdncss.php?theme=slam', '', false, false));
	nonPonyGroup.addButton(new ThemeButton('americaButton', 'AmericaTube', 'plugins/toastthemes/cdncss.php?theme=america', '', false, false));
	nonPonyGroup.addButton(new ThemeButton('neonButton', 'NeonTube', 'plugins/toastthemes/cdncss.php?theme=neon', '', false, false));
	nonPonyGroup.addButton(new ThemeButton('bufferButton', 'BufferTube', 'plugins/toastthemes/cdncss.php?theme=buffer', '', false, false));
	nonPonyGroup.addButton(new ThemeButton('synchButton', 'SynchTube', 'plugins/toastthemes/cdncss.php?theme=synch', '', false, false));
	nonPonyGroup.addButton(new ThemeButton('beeButton', 'BeeTube', 'plugins/toastthemes/cdncss.php?theme=bee', '', false, false));
    nonPonyGroup.addButton(new ThemeButton('pokemonButton', 'PokeTube', 'plugins/toastthemes/cdncss.php?theme=pokemon', '', false, false));
    nonPonyGroup.addButton(new ThemeButton('spoopyButton', 'SpoopyTube', 'plugins/toastthemes/cdncss.php?theme=spoopy', '', false, false));
    nonPonyGroup.addButton(new ThemeButton('weebtubeButton', 'WeebTube', 'plugins/toastthemes/cdncss.php?theme=weebtube', '', false, false));

	fourthPartyGroup.addButton(new ThemeButton('sovietButton', 'RedTube', 'https://s3.amazonaws.com/Berrytube/Soviet+Style/berry-soviet.css', 'Created by SovietSparkle (yes, it\'s SFW)', false, false));
	//fourthPartyGroup.addButton(new ThemeButton('kurtisFlutterButton', 'FlutterTube', 'http://dl.dropboxusercontent.com/u/135755256/colours.css', 'Created by Kurtis', false, false));
	//fourthPartyGroup.addButton(new ThemeButton('tubenamiDarkButton', 'Tubenami (Dark)', 'http://dl.dropboxusercontent.com/u/28101770/Tubenami/tubenami.css', 'Created by The_Catman', false, false));
	//fourthPartyGroup.addButton(new ThemeButton('tubenamiLightButton', 'Tubenami (Light)', 'http://dl.dropboxusercontent.com/u/28101770/Tubenami/tubenami_light.css', 'Created by The_Catman', false, false));
	//fourthPartyGroup.addButton(new ThemeButton('hexButton', 'HexTube', 'http://backstage.berrytube.tv/miggyb/hextube.css', 'Created by miggyb', false, false));
	fourthPartyGroup.addButton(new ThemeButton('toxinButton', 'ToxinTube', 'https://radio.berrytube.tv/themes/toxintube/toxintube.css', 'Created by Malsententia', false, false));
	fourthPartyGroup.addButton(new ThemeButton('sunsetButton', 'SunsetTube', 'https://radio.berrytube.tv/themes/sunsettube/sunsettube.css', 'Created by Malsententia', isNewOrUpdated(2015, 2, 27), false));
	fourthPartyGroup.addButton(new ThemeButton('cooksButton', 'CooksTube', 'https://radio.berrytube.tv/themes/cookstube.css', 'Created by Malsententia', isNewOrUpdated(2015, 2, 27), false));

	for (var i = 0; i < groupList.length - 1; i++) {
		var group = groupList[i];
		for (var j = 0; j < group.themeButtons.length; j++) {
			if (group.themeButtons[j].isFavorited) {
				favoritesGroup.addButton(group.themeButtons[j]);
			}
		}
	}

	// CBMS variables
	cbmsEnabled = getStoredBoolean('cbmsEnabled', false);
	cbmsTrimLength = getStoredInt('cbmsTrimLength', 300);
	cbmsInterval = getStoredInt('cbmsInterval', 300); // Stored in seconds

	// Etc. variables
	autoThemeEnabled = getStoredBoolean('autoThemeEnabled', true);
	autoThemeTimeoutId = -1;
	pollNotifyEnabled = getStoredBoolean('pollNotifyEnabled', false);
	useAlternatePollSound = getStoredBoolean('useAlternatePollSound', false);
	OHMY = new Audio('plugins/toastthemes/ohmy.wav');
	OHMY.volume = 0.5;
	SHOOBEEDOO = new Audio('plugins/toastthemes/shoobeedoo.wav');
	SHOOBEEDOO.volume = 0.5;
    DOOT = new Audio('plugins/toastthemes/doot.wav');
	imageVisible = false;
	showBonusPonies = getStoredBoolean('showBonusPonies', true);
	slamming = false;
	welcomeToTheJam = new Audio('plugins/toastthemes/slam.wav');
	originalTheme = getStorage('siteThemePath') || '';
	gakified = false;
	rdwut = false;
	rotated = false;
	goggles = false;
	crawlId = -1;
	crawlDirection = 0;
	crawlPercent = 100;
	loggingEnabled = getStoredBoolean('loggingEnabled', false);

	// Patch setColorTheme() to handle theme effects
	actualSetColorTheme = setColorTheme;
	setColorTheme = function(theme, isTemp) {
		log('Loading ' + theme + ' as ' + (isTemp ? 'temporary' : 'permanent'));
		clearThemeEffects();
		addThemeEffect(theme);

		if (!isTemp) {
			originalTheme = theme;
		}

		actualSetColorTheme(theme);

		if (isTemp) {
			// If it's a temp theme, restore the original in case the user refreshes
			setStorage('siteThemePath', originalTheme);
		}
	}

    actualShowConfigMenu = showConfigMenu;
    showConfigMenu = function(on) {
        actualShowConfigMenu(on);

        var leftyMode = $('<input/>').attr('type', 'checkbox').change(function() {
            if ($(this).is(':checked')) {
                setStorage('leftyMode', 1);
                $('<link rel="stylesheet" type="text/css" href="plugins/toastthemes/evil.css" id="leftyModeCss">').appendTo('head');
            }
            else {
                setStorage('leftyMode', 0);
                $('#leftyModeCss').remove();
            }
        });
        if (getStorage('leftyMode') == 1) {
            leftyMode.attr('checked', 'checked');
        }
        $('legend:contains(User Options)').parent().append(
            $('<div/>').append($('<span/>').text('Lefty mode'), leftyMode)
        );
    }

	var $body = $('body');

	// Create the overall container div
	var container = $('<div id="toastThemesContainer"/>');

	// Create the upper div (chevrons and other buttons)
	var chevUpDiv = $('<div id="chevronUpDiv"/>').addClass('chevronDiv transparent').css('display', 'inline-block').html('<img src="' + CDN_ORIGIN + '/plugins/toastthemes/chevup.png">').click(toggle);
	var chevDownDiv = $('<div id="chevronDownDiv"/>').addClass('chevronDiv').css('display', 'none').html('<img src="' + CDN_ORIGIN + '/plugins/toastthemes/chevdown.png">').click(toggle);
	var settingsButtonDiv = $('<div id="settingsButtonDiv"/>').addClass('settingsButtonDiv').css('display', 'none').text('Settings').click(toggleSettingsDiv);
	var effectsButtonDiv = $('<div id="effectsButtonDiv"/>').addClass('settingsButtonDiv').css('display', 'none').text('Effects').click(function() { toggleThemeListDiv('effectsContainer'); });
	var motdButtonDiv = $('<div id="motdButtonDiv"/>').addClass('settingsButtonDiv').css('display', 'none').text('MotD').click(toggleMotd);
	var upperDiv = $('<div/>').append(
		$('<div id="chevronButtonDiv"/>').addClass('chevronButtonContainerDiv').append(chevUpDiv, chevDownDiv),
		settingsButtonDiv, effectsButtonDiv, motdButtonDiv);

	// Create the button div
	var buttonDiv = $('<div id="themeButtonDiv"/>').addClass('themeButtonContainerDiv').css('display', 'none');
	for (var i = 0; i < groupList.length; i++) {
		buttonDiv.append(groupList[i].getButtonDiv());
	}
	buttonDiv.append(
		$('<div id="randomButtonDiv"/>').addClass('groupButtonWrapper').append(
			$('<button id="randomButton"/>').addClass('themeButton').text('Randomize!').click(function() { setColorTheme(randomTheme(), false); })),
		$('<div id="hiButtonDiv"/>').addClass('groupButtonWrapper').append(
			$('<button id="hiButton"/>').addClass('themeButton').text('?!').click(fourthWall)));

	// Create/wire the theme list divs
	for (var i = 0; i < groupList.length; i++) {
		groupList[i].reloadButtonList();
	}

	// Fill the container with the chevron and button divs and add it all to the document
	container.append(upperDiv, buttonDiv);
	$body.append(container);

	// Link up the event listeners
	for (var i = 0; i < groupList.length; i++) {
		buttonDiv += groupList[i].wireListener();
	}

	// Create the MOTD div
	var motdMessage = 'Hey. Hey Kurtis. Eat a dick!<br/><br/>Love, Toast.';
	var motdDiv = $('<div id="toastMotdDiv"/>').css('display', 'none').append(
		$('<div/>').css('font-weight', 'bold').css('text-decoration', 'underline').css('margin-bottom', '7px').css('font-size', '14px').text('Message of the Day').append(
			$('<span/>').css('cursor', 'default').attr('title', '*For very large values of \'day\'.').text('*')), motdMessage);
	$body.append(motdDiv);

	// Create the settings div
	var settingsContainer = $('<div id="settingsContainer"/>').css('display', 'none').append(
		$('<div id="settingsDiv"/>').addClass('settingsPane').css('display', 'inline-block').html(
		'<table class="settingsTable">' +
		'<tr><th colspan="2">ToastThemes Settings</th></tr>' +
		'<tr><td colspan="2" class="header">General Settings</td></tr>' +
		'<tr><td>Enable automatic themes:</td><td><input type="checkbox" id="chkEnableAutoThemes"></input></td></tr>' +
		'<tr><td>Enable poll notify sound:</td><td><input type="checkbox" id="chkEnablePollNotify" onchange="enablePollNotifyToggled()"></input></td></tr>' +
		'<tr><td>Use alternate poll sound:</td><td><input type="checkbox" id="chkUseAlternatePollSound"></input></td></tr>' +
		'<tr><td>Show main 6 bonus ponies:</td><td><input type="checkbox" id="chkShowBonusPonies"></input></td></tr>' +
		'<tr><td colspan="2" class="header">Chat Buffer Management Settings <span title="Chat Buffer Management will help prevent script-added page elements from jumping. When enabled, it will automatically trim the chat buffer to the specified line length with the specified interval. Elements may jump when the buffer is trimmed, which automatically happens 1 line at a time when it hits 500 lines. This feature will help prevent it from reaching that 500-line point, minimizing the amount of jump you see." style="cursor: default;">(?)</span></td></tr>' +
		'<tr><td>Enable buffer management:</td><td><input type="checkbox" id="chkEnableCBMS"></input></td></tr>' +
		'<tr><td>Line count to trim to:</td><td><input type="text" id="txtTrimLength" style="width: 30px;"></input></td></tr>' +
		'<tr><td>Trim interval (seconds):</td><td><input type="text" id="txtInterval" style="width: 30px;"></input></td></tr>' +
		'</table><br/>' +
		'<div class="controlButtonDiv"><button id="settingsCancel" class="controlButton" style="margin-right: 5px;">Cancel</button><button id="settingsApply" class="controlButton" style="margin-left: 5px;">Save</button>'));
	$body.append(settingsContainer);

	// Wire up the settings event listeners
	$('#settingsCancel').click(hideSettingsDiv);
	$('#settingsApply').click(applySettings);

	// Create the effects div
	var effectsContainer = $('<div id="effectsContainer"/>').addClass('buttonListContainer').css('display', 'none').append(
		$('<div/>').css('padding', '4px 5px 3px 5px').css('text-decoration', 'underline').text('Effects'),
		$('<div/>').addClass('themeButtonWrapper').append($('<button id="gakifyButton"/>').addClass('themeButton').text('GAKIFY').click(gakAttack)),
		$('<div/>').addClass('themeButtonWrapper').append($('<button id="wobniarButton"/>').addClass('themeButton').text('wobniaR').click(wobniar)),
		$('<div/>').addClass('themeButtonWrapper').append($('<button id="rot13Button"/>').addClass('themeButton').text('rot13').click(rot13)),
		$('<div/>').addClass('themeButtonWrapper').attr('title', 'Warning: This can only be undone by refreshing!').append($('<button id="sehroButton"/>').addClass('themeButton').html('sehro-Vision&trade;').click(sehroVision)),
		$('<div/>').addClass('themeButtonWrapper').append($('<button id="brodyButton"/>').addClass('themeButton').text('Brody-Vision').click(brodyVision)),
		$('<div/>').addClass('themeButtonWrapper').append($('<button id="ddosButton"/>').addClass('themeButton').text('Breadstick DDoS').click(breadstickDdos)));
	$body.append(effectsContainer);

	// Create the HI! div
	$body.append($('<div id="hiDiv"/>'));

	// Create the grumpy div
	$body.append($('<div id="grumpyDiv"/>'));

	// Create the chainsaw div
	$body.append($('<div id="chainsawDiv"/>'));

	// Rig up the auto-theme method to the correct socket callback
	socket.on('forceVideoChange', function(data) {
		log('Video loaded: ' + decodeURIComponent(data.video.videotitle) + ' (id=' + data.video.videoid + ', duration=' + data.video.videolength + ')');

		// Sweetie Belle crawl
		if (crawlId > -1) {
			clearInterval(crawlId);
			crawlId = -1;
			$('#crawlyBelle').remove();
		}
		if (data.video.videoid == '4e_Glj3_kGE') {
			//And the Moon orbits Around the World...
			$('#videowrap').css('position', 'relative').append($('<div id="crawlyBelle"/>').html('<img src="' + CDN_ORIGIN + '/plugins/toastthemes/stare.png"></img>')
				.attr('style', 'bottom: 100%; margin-bottom: -70px; right: 100%; margin-right: -70px; -webkit-transform: rotate(180deg); -moz-transform: rotate(180deg);'));
			crawlId = setInterval(sweetieCrawl, 80);
		}

		autoThemeTimeoutId = -1;
		if (autoThemeEnabled) {
			var currentTheme = $('#themeCss').attr('href') || '';
			var targetTheme;
			var isTemporary = true;
			switch (data.video.videoid + '') {
				case '9bIQ8DpGHnk':
				case 'rudRUMCm8WM':
				case 'JXUNimNDHFc':
                case 'gSswUG2X7NU':
					// Berry's Drinking Telegram
					targetTheme = '';
					break;
				case 'H4tyvJJzSDk':
					// Lullaby for a Princess
					targetTheme = 'css/colors-woona.css';
					break;
				case '0Ntiphuey8g':
					// I'm making... TOAST!
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=toast';
					break;
				case 'lhjk5x54bsE':
					// Turnabout Turntable
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=attorney';
					break;
				case 'W7VRIC2TEs8':
				case 'cjwzwj2ebeg':
					// Tropical Octav3
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=octav3';
					break;
				case 'Inj-jnZa9BU':
					// Here Comes Tom
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=tom';
					break;
				case 'L0cY2NWlddU':
					// Two Best Sisters Play Portal 2
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=ear';
					break;
				case 'u1aOQIX2W-0':
					// SOCK
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=sock';
					break;
				case 'cg8W_QYeL00':
					// Twist and Shout
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=twist';
					break;
				case 'fk8VdtjNsE8':
					// Inspector Brushie
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=toothpaste';
					break;
				case 'NXnwQ9TSAOg':
					// The Changeling (Twitch Remix)
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=deskfuck';
					break;
				case 'Hnqz9OdZjRQ':
					// Beep Beep!
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=cmc';
					break;
				case '0EdAAZ2x5-E':
				case 'hS-oZ_Nkp6g':
					// America, Fuck Yeah! (two versions)
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=america';
					break;
				case 's7YB8yy9XAg':
				case 'hHBfZxr2yLA':
					// Flying With the Rainbow (two versions)
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=tei';
					break;
				case 'EiO9_PJ0h8Q':
					// Neon Pegasus
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=neon';
					break;
				case '-WIxWkby8ok':
					// I'm bringing the party to you
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=birthday';
					break;
				case 'cDuG95DXbw8':
					// Race Like Rainbow Dash
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=dashie';
					break;
				case 'qQSz6gKdhO8':
					// Shine Like Rarity
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=rarity';
					break;
				case 'rT31ZeCNdBw':
					// Strive Like Applejack
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=apple';
					break;
				case 'EXpauql2lqM':
					// Learn Like Twilight Sparkle
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=sparkle';
					break;
				case 'ikV8LL_YHv0':
					// Love Like Fluttershy
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=flutter';
					break;
				case '6UXGEbaP5Ug':
					// Play Like Pinkie Pie
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=pinkie';
					break;
				case 'P4TedkQP_hM':
				case '3_dDxISCOuM':
					// Call Upon the Seaponies
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=seapony';
					break;
				case 'wHwyca7gu7E':
				case '9w6Wa0W2y_o':
					// Super Weed Bros. and Green & Purple
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=blazeit';
					break;
				case 'qRC4Vk6kisY':
					// Fluffle Puff Tales: PFUDOR
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=pfbtdor';
					break;
                case 'PYtXuBN1Hvc':
                case '-kWW9luMD4M':
                    // DR. BEES and #CHANGETHEBEES
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=bee';
                    break;
                case 'dUjNYSpr3F8':
                    // The tale of DigitalVagrant's escape
                    targetTheme = 'plugins/toastthemes/cdncss.php?theme=vagrant';
                    break;
                case 'dGpmT3uZ-kM':
                    // Pegasi Armada
                    targetTheme = 'plugins/toastthemes/cdncss.php?theme=synch';
                    break;
				case '3DSbowW5j34':
					// Soviet Pony March
					targetTheme = 'https://s3.amazonaws.com/Berrytube/Soviet+Style/berry-soviet.css';
					break;
                    /*
                case '_Qn0ipbAIqs':
                    // MY LITTLE HEXAGON
                    targetTheme = 'http://backstage.berrytube.tv/miggyb/hextube.css';
                    break;
                */
				default:
					// Restore original theme
					targetTheme = originalTheme;
					isTemporary = false;
					break;
			}

			if (targetTheme != currentTheme) {
				setColorTheme(targetTheme, isTemporary);
			}
		}
	});

	socket.on('hbVideoDetail', function(data) {
		if (autoThemeEnabled && autoThemeTimeoutId == -1) {
			var currentTheme = $('#themeCss').attr('href') || '';
			var targetTheme;
			var offset;
			switch (data.video.videoid + '') {
				case '60884392':
				case '62126375':
                case '74486243':
					// Marmisode: Sleepless in Seaponyville
					offset = 1134 - data.time;
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=seapony';
					break;
                /*case 'lxcwTSvyU6M':
                    // Part 2 of the G1 pilot (the one with the seapony song)
                    offset = 0 - data.time; //TODO
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=seapony';
                    break;*/
				case 'wXIHH6C61I0':
					// Pinkie breaks the fourth wall
					offset = 47 - data.time;
					targetTheme = 'plugins/toastthemes/cdncss.php?theme=apocalypse';
					break;
			}

			if (offset > 0 && targetTheme != currentTheme) {
				log('Setting ' + targetTheme + ' to load in ' + offset + ' seconds');
				autoThemeTimeoutId = setTimeout(function() { setColorTheme(targetTheme, true); }, offset * 1000);
			}
		}
	});

	// Set up the new poll listener
	socket.on('newPoll', function(data) {
		log('New poll created');
		if (pollNotifyEnabled) {
			if (useAlternatePollSound) {
				SHOOBEEDOO.play();
			}
			else {
				OHMY.play();
			}
		}
	});

	// Set up a listener to handle effects on newly-added videos
	socket.on('addVideo', function(data) {
		var title = data.video.domobj.find('.title');
		if (gakified) {
			title.text(gakify(title.text()));
		}
		if (rdwut) {
			title.text(reverse(title.text()));
		}
		if (rotated) {
			title.text(doRot(title.text()));
		}
	});

	// Enable CBM if it was on in the persistent settings
	if (cbmsEnabled) {
		toggleBufferManagement(true);
	}

    // Turn on lefty mode if it's enabled
    if (getStorage('leftyMode') == 1) {
        $('<link rel="stylesheet" type="text/css" href="plugins/toastthemes/evil.css" id="leftyModeCss">').appendTo('head');
    }

	// Lastly, check if a special theme is up and if so, call its special method
	addThemeEffect(originalTheme);
}

/**
 * Determines whether the passed-in year, month, and day are before or after
 * the current date for the purpose of displaying "NEW!" and "UPDATED!" on
 * theme buttons.
 *
 * @param {int} untilYear   The year.
 * @param {int} untilMonth  The month.
 * @param {int} untilDay    The day.
 *
 * @return {boolean}        Whether the given date is before the current date.
 */
function isNewOrUpdated(untilYear, untilMonth, untilDay) {
	var now = new Date();
	var then = new Date(untilYear, untilMonth, untilDay, 0, 0, 0, 0);
	return now < then;
}

/**
 * Returns a random theme from the full list of all available themes in the script.
 *
 * @return {Object}	 A randomly selected theme.
 */
function randomTheme() {
	var allTheThemes = [];
	for (var i = 0; i < groupList.length - 1; i++) {
		for (var j = 0; j < groupList[i].themeButtons.length; j++) {
			allTheThemes.push(groupList[i].themeButtons[j].themeUrl);
		}
	}

	return allTheThemes[Math.floor(Math.random() * allTheThemes.length)];
}

/**
 * Event handler for hiding/showing the button div. If the div is visible,
 * it will be hidden, and if it's hidden, it will be shown.
 */
function toggle() {
	var themeButtons = $('#themeButtonDiv');

	if (themeButtons.css('display') == 'none') {
		themeButtons.css('display', 'inline-block');
		$('#motdButtonDiv').css('display', 'inline-block');
		$('#settingsButtonDiv').css('display', 'inline-block');
		$('#effectsButtonDiv').css('display', 'inline-block');
		$('#chevronUpDiv').css('display', 'none');
		$('#chevronDownDiv').css('display', 'inline-block');
	}
	else {
		themeButtons.css('display', 'none');
		$('#motdButtonDiv').css('display', 'none');
		$('#toastMotdDiv').css('display', 'none');
		$('#settingsButtonDiv').css('display', 'none');
		$('#effectsButtonDiv').css('display', 'none');
		$('#chevronUpDiv').css('display', 'inline-block');
		$('#chevronDownDiv').css('display', 'none');
		toggleThemeListDiv(null);
		hideSettingsDiv();
	}
}

/**
 * Event handler for hiding/showing the MotD div.
 */
function toggleMotd() {
	var div = $('#toastMotdDiv');
	if (div.css('display') == 'none') {
		div.css('display', 'block');
	}
	else {
		div.css('display', 'none');
	}
}

/**
 * Event handler for displaying a theme list. This function will hide any already-open
 * lists before showing the specified one. If the specified one is already showing,
 * it will just be closed.
 */
var visibleThemeList = null;
function toggleThemeListDiv(divId) {
	$('#' + visibleThemeList).css('display', 'none');

	if (divId != null && visibleThemeList != divId) {
		$('#' + divId).css('display', 'block');
		visibleThemeList = divId;
	}
	else {
		visibleThemeList = null;
	}
}

/**
 * Event handler for toggling whether a theme is favorited.
 */
function toggleFavorited(themeUrl) {
	var button = null;
	for (var i = 0; i < groupList.length - 1; i++) { // -1 on the length so we skip the favorites list (it has no unique buttons)
		button = groupList[i].getButtonByUrl(themeUrl);
		if (button != null) {
			break;
		}
	}

	if (button != null) {
		button.toggleIsFavorited();
		if (button.isFavorited) {
			// Add it to the favorites list
			favoritesGroup.addButton(button);
			favoritesGroup.reloadButtonList();
		}
		else {
			// Remove it from the favorites list
			favoritesGroup.removeButton(button);
			favoritesGroup.reloadButtonList();
		}
	}
}

/**
 * Event handler for showing the settings div and populating it with the current settings values.
 */
function toggleSettingsDiv() {
	var div = document.getElementById('settingsContainer');
	if (div.style.display == 'none') {
		div.style.display = 'block';

		// Set the values
		$('#chkEnableAutoThemes').attr('checked', autoThemeEnabled);
		$('#chkEnablePollNotify').attr('checked', pollNotifyEnabled);
		$('#chkUseAlternatePollSound').attr('checked', useAlternatePollSound).attr('disabled', !pollNotifyEnabled);
		$('#chkShowBonusPonies').attr('checked', showBonusPonies);
		$('#chkEnableCBMS').attr('checked', cbmsEnabled);
		$('#txtTrimLength').val(cbmsTrimLength);
		$('#txtInterval').val(cbmsInterval);
	}
	else {
		hideSettingsDiv();
	}
}

/**
 * Event handler for hiding the settings div.
 */
function hideSettingsDiv() {
	document.getElementById('settingsContainer').style.display = 'none';
}

/**
 * Event handler for applying the settings settings the user has set.
 */
function applySettings() {
	autoThemeEnabled = $('#chkEnableAutoThemes').is(':checked');
	pollNotifyEnabled = $('#chkEnablePollNotify').is(':checked');
	useAlternatePollSound = $('#chkUseAlternatePollSound').is(':checked');
	showBonusPonies = $('#chkShowBonusPonies').is(':checked');
	var tmpEnabled = $('#chkEnableCBMS').is(':checked');
	var tmpTrimLength = parseInt($('#txtTrimLength').val());
	var tmpInterval = parseInt($('#txtInterval').val());

	if (tmpTrimLength && tmpInterval &&
		((tmpEnabled != cbmsEnabled) ||
		(tmpTrimLength != cbmsTrimLength) ||
		(tmpInterval != cbmsInterval))) {
		// If the length and interval are both valid and at least one value changed, start CMB
		if (cbmsEnabled) {
			// First, disabled CBM if it was already on
			toggleBufferManagement(false);
		}

		// Next, update the variables
		cbmsEnabled = tmpEnabled;
		cbmsTrimLength = tmpTrimLength;
		cbmsInterval = tmpInterval;

		if (tmpEnabled) {
			// And finally, if it's being turned on (or updated), start it up
			toggleBufferManagement(true);
		}
	}

	// Save the settings to local storage
	setStoredValue('autoThemeEnabled', autoThemeEnabled);
	setStoredValue('pollNotifyEnabled', pollNotifyEnabled);
	setStoredValue('useAlternatePollSound', useAlternatePollSound);
	setStoredValue('showBonusPonies', showBonusPonies);
	setStoredValue('cbmsEnabled', cbmsEnabled);
	setStoredValue('cbmsTrimLength', cbmsTrimLength);
	setStoredValue('cbmsInterval', cbmsInterval);

	hideSettingsDiv();

	showSimpleToastMessage('Your changes have been saved.', 500, 1500);
}

/**
 * Event handler for enabling/disabling the alternate poll sound checkbox.
 */
function enablePollNotifyToggled() {
	$('#chkUseAlternatePollSound').attr('disabled', !($('#chkEnablePollNotify').is(':checked')));
}

/**
 * Event handler for enabling/disabling buffer management.
 */
function toggleBufferManagement(enable) {
	if (enable) {
		log('Chat buffer management enabled with interval=' + cbmsInterval + ', trim length=' + cbmsTrimLength);
		intervalId = setInterval(trimChatBuffer, cbmsInterval * 1000); // Convert seconds to millis
	}
	else {
		log('Chat buffer management disabled');
		clearInterval(intervalId);
	}
}

/**
 * Adapted from wut's BerryButtons script. This function trims the chat buffer
 * down to the number of lines currently specified by the cbmsTrimLength variable
 * and logs a timestamped message indicating as such.
 */
function trimChatBuffer() {
	log('Trimming chat buffer to ' + cbmsTrimLength + ' lines');
	$('#chatbuffer div[class^=msg]').each(function () {
		if ($('#chatbuffer div[class^=msg]').length > cbmsTrimLength) {
			$(this).remove();
		}
	});
}

/**
 * Event handler for hiding and showing the Pinkie divs. If one is visible,
 * it will be hidden. Otherwise, one of them will be chosen at random and
 * displayed.
 */
function fourthWall() {
	if (imageVisible) {
		$('#hiDiv').css('display', 'none');
		$('#grumpyDiv').css('display', 'none');
		$('#chainsawDiv').css('display', 'none');
		imageVisible = false;
	}
	else {
		var r = Math.random();
		if (r >= 0.02) {
			// In 98% of cases, show [](/seriouslyfourthwall)
			$('#hiDiv').html('<img src="' + CDN_ORIGIN + '/plugins/toastthemes/hi.webp"></img>').css('display', 'block');
		}
		else if (r >= 0.002) {
			// In 1.8% of cases, show [](/grumpypie)
			$('#grumpyDiv').html('<img src="' + CDN_ORIGIN + '/plugins/toastthemes/grumpy.webp"></img>').css('display', 'block');
		}
		else {
			// And in the last 0.2%, show [](/ppchainsaw)
			$('#chainsawDiv').html('<img src="' + CDN_ORIGIN + '/plugins/toastthemes/chainsaw.webp"></img>').css('display', 'block');
		}
		imageVisible = true;
	}
}

/**
 * Adds any bonus elements required by the given theme to the page. This should only
 * really be called in setColorTheme(), and only _after_ clearThemeEffects() (see below).
 */
function addThemeEffect(theme) {
	switch(theme) {
		case 'plugins/toastthemes/cdncss.php?theme=btcon2021':
			$('<script>', {
				class: 'toastthemes-theme-specific',
				src: 'plugins/toastthemes/css/btcon2021/bootlegcon.js',
			}).appendTo(document.head);
			break;
		case 'plugins/toastthemes/cdncss.php?theme=btcon2022':
			$('<script>', {
				class: 'toastthemes-theme-specific',
				src: 'plugins/toastthemes/css/btcon2022/videobg.js',
			}).appendTo(document.head);
			break;
		case 'plugins/toastthemes/cdncss.php?theme=btcon2023':
			$('<script>', {
				class: 'toastthemes-theme-specific',
				src: 'plugins/toastthemes/css/btcon2023/videobg.js',
			}).appendTo(document.head);
			break;
		case 'plugins/toastthemes/cdncss.php?theme=slam':
			slamming = true;
			welcomeToTheJam.play();
			$('#videowrap').append(
				$('<div id="barkleyDiv"/>').html('<img src="plugins/toastthemes/css/slam/images/barkley.png">').click(function() { welcomeToTheJam.play(); }));
			barkleyJump();
			break;
		case 'plugins/toastthemes/cdncss.php?theme=fancy':
			$('#videowrap').append(
				$('<div id="fancyHatDiv"/>').css('display', 'none').html('<img src="plugins/toastthemes/css/fancy/images/player_hat.png">'),
				$('<div id="fancyStacheDiv"/>').css('display', 'none').html('<img src="plugins/toastthemes/css/fancy/images/player_mustache.png">'),
				$('<div id="fancyMonocleDiv"/>').css('display', 'none').html('<img src="plugins/toastthemes/css/fancy/images/player_monocle.png">'),
				$('<div id="fancyToggleDiv"/>').html('Fancy<br/>OFF').click(toggleFancy));
			break;
		case 'plugins/toastthemes/cdncss.php?theme=dashie':
			if (showBonusPonies) {
				$('#chatpane').append(
					$('<div id="chatDashieDiv"/>').html('<img src="plugins/toastthemes/css/dashie/images/chat_dashie.png">'),
					$('<div id="chatScootsDiv"/>').html('<img src="plugins/toastthemes/css/dashie/images/chat_scoots.png">'));
			}
			break;
		case 'plugins/toastthemes/cdncss.php?theme=rarity':
			if (showBonusPonies) {
				$('#playlist').css('position', 'relative').append(
					$('<div id="playlistRarityDiv"/>').html('<img src="plugins/toastthemes/css/rarity/images/playlist_rarity.png">'));
			}
			break;
		case 'plugins/toastthemes/cdncss.php?theme=apple':
			if (showBonusPonies) {
				$('#playlist').append(
					$('<div id="playlistAjDiv"/>').html('<img src="plugins/toastthemes/css/apple/images/playlist_aj.png">'));
			}
			break;
		case 'plugins/toastthemes/cdncss.php?theme=sparkle':
			if (showBonusPonies) {
				$('#videowrap').append(
					$('<div id="playerTwilightDiv"/>').html('<img src="plugins/toastthemes/css/sparkle/images/player_twilight.png">'));
			}
			break;
		case 'plugins/toastthemes/cdncss.php?theme=flutter':
			if (showBonusPonies) {
				$('#chatControls').append(
					$('<div id="chatFluttershyDiv"/>').html('<img src="plugins/toastthemes/css/flutter/images/chat_fluttershy.png">'));
			}
			break;
		case 'plugins/toastthemes/cdncss.php?theme=pinkie':
			if (showBonusPonies) {
				$('#chatpane').append(
					$('<div id="aboveChatPinkieDiv"/>').html('<img src="plugins/toastthemes/css/pinkie/images/abovechat_pinkie.png">'),
					$('<div id="belowChatPinkieDiv"/>').html('<img src="plugins/toastthemes/css/pinkie/images/belowchat_pinkie.png">'));
				$('#videowrap').append(
					$('<div id="playerPinkieDiv"/>').html('<img src="plugins/toastthemes/css/pinkie/images/player_pinkie.png">'));
				$('#playlist').append(
					$('<div id="playlistPinkieDiv"/>').html('<img src="plugins/toastthemes/css/pinkie/images/playlist_pinkie.png">'));
			}
			break;
		case 'plugins/toastthemes/cdncss.php?theme=spoopy':
            $('#banner').mouseover(function() { DOOT.play(); });
            break;
	}
}

/**
 * Deletes any bonus elements that were added to the page by addThemeEffect().
 * This should be called during every theme change.
 */
function clearThemeEffects() {
	slamming = false;

	$('#barkleyDiv').remove();
	$('#fancyHatDiv').remove();
	$('#fancyStacheDiv').remove();
	$('#fancyMonocleDiv').remove();
	$('#fancyToggleDiv').remove();
	$('#chatDashieDiv').remove();
	$('#chatScootsDiv').remove();
	$('#playlistRarityDiv').remove();
	$('#playlistAjDiv').remove();
	$('#playerTwilightDiv').remove();
	$('#chatFluttershyDiv').remove();
	$('#aboveChatPinkieDiv').remove();
	$('#belowChatPinkieDiv').remove();
	$('#playerPinkieDiv').remove();
	$('#playlistPinkieDiv').remove();
    $('#banner').unbind();
	$('#banner').empty();
	$('.toastthemes-theme-specific').remove();
}

/**
 * This function causes Barkley's head to jump to a random location within the player.
 * It self-propogates as long as SlamTube is loaded.
 */
function barkleyJump() {
	// Only jump Barkley if we're currently slamming (we want to let this propogation
	// die when SlamTube is turned off so we don't get multiple chains of it going)
	if (slamming) {
		// Randomize top and left percentages
		// Top range: 35% to 65%
		// Left range: 20% to 80%
		var top = Math.round(Math.random() * 31) + 35;
		var left = Math.round(Math.random() * 61) + 20;
		$('#barkleyDiv').css('top', top + '%').css('left', left + '%');

		// Then set the next jump for a random time between 2 and 4 seconds
		setTimeout(barkleyJump, Math.round(Math.random() * 2000) + 2000);
	}
}

/**
 * Event handler for hiding/showing the hat/monocle/mustache on FancyTube.
 */
function toggleFancy() {
	var hat = $('#fancyHatDiv');
	if (hat.css('display') == 'none') {
		hat.css('display', 'inline-block');
		$('#fancyStacheDiv').css('display', 'inline-block');
		$('#fancyMonocleDiv').css('display', 'inline-block');
		$('#fancyToggleDiv').html('Fancy<br/>ON');
	}
	else {
		hat.css('display', 'none');
		$('#fancyStacheDiv').css('display', 'none');
		$('#fancyMonocleDiv').css('display', 'none');
		$('#fancyToggleDiv').html('Fancy<br/>OFF');
	}
}

// Playlist and poll effects
/**
 * Gakifies the titles of every element in the playlist.
 */
function gakAttack() {
	$('#plul li').each(function(index, element) {
		var node = $(element);
		node.find('.title').text(gakify(node));
	});
	gakified = !gakified;
}

/**
 * Gakifies a string, replacing every word with 'GAK'.
 */
function gakify(node) {
	var text;
	if (gakified) {
		text = node.data('plobject').videotitle;
		return decodeURIComponent(text);
	}
	else {
		text = node.find('.title').text();
		if (!text) {
			return '';
		}
		else {
			return text.replace(/[a-zA-Z0-9\.']+/g, 'GAK');
		}
	}
}

/**
 * Reverses the characters in each word in the titles of every element in the playlist.
 */
function wobniar() {
	rdwut = !rdwut;
	$('#plul').find('.title').each(function(index, element) {
		var node = $(element);
		node.text(reverse(node.text()));
	});
}

/**
 * Reverses the characters in a string, returning the result.
 */
function reverse(val) {
	if (!val) {
		return '';
	}
	var words = val.split(' ');
	for (var i = 0; i < words.length; i++) {
		words[i] = words[i].split('').reverse().join('');
	}
	return words.join(' ');
}

/**
 * Applies a rot13 transformation to the titles of every element in the playlist.
 */
function rot13() {
	rotated = !rotated;
	$('#plul').find('.title').each(function(index, element) {
		var node = $(element);
		node.text(doRot(node.text()));
	});
}

/**
 * Performs the rot13 operation on the given string, returning the result.
 */
function doRot(val) {
	if (!val) {
		return '';
	}
	var chars = val.split('');
	for (var i = 0; i < chars.length; i++) {
		var code = chars[i].charCodeAt(0);
		if (code >= 65 && code <= 90) {
			// A-Z
			code += 13;
			if (code > 90) {
				code -= 26;
			}
		}
		else if (code >= 97 && code <= 122) {
			// a-z
			code += 13;
			if (code > 122) {
				code -= 26;
			}
		}
		chars[i] = String.fromCharCode(code);
	}
	return chars.join('');
}

/**
 * Applies sehro-Vision Goggles (TM) to all polls, active or closed
 * (i.e. changes every poll option to 'Yes').
 */
function sehroVision() {
	goggles = true;
	$('#pollpane').find('.label').each(function(index, element) {
		element.innerHTML = 'Yes';
	});
}

function brodyVision() {
	var videowrap = $('#videowrap');
	if (videowrap.data('brody') === true) {
		videowrap.css('animation', '')
		videowrap.data('brody', false);
	}
	else {
		videowrap.css('animation', 'brody 1.27659s ease infinite')
		videowrap.data('brody', true);
	}
}

function breadstickDdos() {
	var ddos = $('.breadstickDdos');
	if (ddos.length == 0) {
		$('body').append(
			$('<div/>').addClass('breadstickDdos').css('background', 'url(plugins/toastthemes/breadsticks.png) repeat'),
			$('<div/>').addClass('breadstickDdos').css('background', 'url(plugins/toastthemes/breadsticks2.png) repeat'));
		$('#chatpane').css('z-index', '900');
	}
	else {
		ddos.remove();
	}
}

function sweetieCrawl() {
	var sb = $('#crawlyBelle');
	crawlPercent--;
	var margin = Math.round(-70 * (crawlPercent / 100.0));
	switch (crawlDirection) {
		case 0: // Right
			// Clear previous CSS, set fixed CSS
			sb.css('top', '').css('margin-top', '').css('bottom', '100%').css('margin-bottom', '-70px');
			// Set dynamic CSS
			sb.css('right', crawlPercent + '%').css('margin-right', margin + 'px').css('-webkit-transform', 'rotate(180deg)').css('-moz-transform', 'rotate(180deg)');
			break;
		case 1: // Down
			// Clear previous CSS, set fixed CSS
			sb.css('right', '').css('margin-right', '').css('left', '100%').css('margin-left', '-70px');
			// Set dynamic CSS
			sb.css('bottom', crawlPercent + '%').css('margin-bottom', margin + 'px').css('-webkit-transform', 'rotate(270deg)').css('-moz-transform', 'rotate(270deg)');
			break;
		case 2: // Left
			// Clear previous CSS, set fixed CSS
			sb.css('bottom', '').css('margin-bottom', '').css('top', '100%').css('margin-top', '-70px');
			// Set dynamic CSS
			sb.css('left', crawlPercent + '%').css('margin-left', margin + 'px').css('-webkit-transform', 'rotate(0deg)').css('-moz-transform', 'rotate(0deg)');
			break;
		case 3: // Up
			// Clear previous CSS, set fixed CSS
			sb.css('left', '').css('margin-left', '').css('right', '100%').css('margin-right', '-70px');
			// Set dynamic CSS
			sb.css('top', crawlPercent + '%').css('margin-top', margin + 'px').css('-webkit-transform', 'rotate(90deg)').css('-moz-transform', 'rotate(90deg)');
			break;
	}

	if (crawlPercent <= 0) {
		crawlPercent = 100;
		crawlDirection = (crawlDirection + 1) % 4;
	}
}
