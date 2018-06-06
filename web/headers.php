<meta charset="utf-8">
<style>body { background: url(/images/stain.png) no-repeat fixed center top #421C52; }</style>

<?php // Pick random title.
	$titles = array(
		'This is why I drink!',
		'It seemed like a good idea at the time.',
		'IM SO FRESH YOU CAN SUCK MY NUTS SWAG',
		'The 24/7 out of control party abomination that is berrytube.tv!',
		'What could go wrong?',
		'Love the mods with mouth',
		'This website runs on electricity and Stockholm Syndrome.',
		'"If you dont like the wordfilters, you can fuck off back to synchtube".',
		'"If you dont like the wordfilters, you can sexual intercourse off back to synchtube."',
		'In which two dapper strapping lads attempt to flirt with me.',
		'I made a Rainbow Dash Space Marine Army. Friendship is Bolters.',
		'Of all the substances in the movie, that is the most ejaculate-like.',
		'We are all about special treatment, not ascii statistics.',
		'Like 500 picoHitlers.',
		'STAPHG HO NOP',
		'Really little pony if you were open up my always and now it through this crystal Greer its a roof sunrise.',
		'Shes too busy with her titties to stop the changelings.',
		'Now were cooking with nipples.',
		'Drunk is a universal language.',
		'GO TO BERRYTUBE.TV FOR MORE AMAAAAZING PONY VIDEOS #YOLO #SWAG',
		'Blueshift: aw, EternalLullaby isnt here, i had an orgy related question for him',
		'I forgot I had amplification on.',
		'Its where alcohol and ponies merge and there are no survivors',
		'The desk needs foreplay',
		'its easier to deal with omnomtom than peta',
		'Im sorry I made your dick twitch.',
		'What is this? A Daycare for the sexually deviant?',
		'It appears to run on some form of alcohol.',
		'Its basically a drinking site with a pony problem.',
		'Theres too many mouths and only one dick. Please take turns.',
		'You can always be deeper.',
		'Strive to be as honest as hitler.',
		'Hats and Lies.',
		'The soundtrack of a perfect porno',
		'WHO NINAsfa FUCMER',
		'Lion-O is in the set of "not Snoop Lion".'
	);
	$TITLE = 'BerryTube :: ' . $titles[array_rand($titles)];
?>
<title><?php echo $TITLE; ?></title>

<meta name="description" content="BerryTube">
<meta name="author" content="Cades / GreyMage / Eric Cutler">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#421C52">

<link rel="stylesheet" href="<?= cdn('css/colors.css') ?>" id="mainTheme"/>
<link rel="stylesheet" href="<?= cdn('css/layout-other.css') ?>"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/video.js/5.4.4/video-js.min.css" integrity="sha256-UeMWbsVFjXKSEQ5njaTwWasAFZJsen4UMOHfTHNZtBA=" crossorigin="anonymous" />
<link rel="stylesheet" href="<?= cdn('css/uni-gui.css') ?>" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/themes/ui-lightness/jquery-ui.min.css" integrity="sha256-N7K28w/GcZ69NlFwqiKb1d5YXy37TSfgduj5gQ6x8m0=" crossorigin="anonymous" />
<link rel="stylesheet" href="<?= cdn('css/countdown.css') ?>" />
<link rel="stylesheet" href="<?= cdn('css/berrymotes.core.css') ?>" />

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js" integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js" integrity="sha256-KM512VNnjElC30ehFwehXjx1YCHPiQkOPmqnrWtpccM=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tinyscrollbar/2.4.2/jquery.tinyscrollbar.min.js" integrity="sha256-gENsdwXJl1qiwOqS0DF+kfqTP5Dy+0gDTtxpRcWVhrU=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/swfobject/2.2/swfobject.min.js" integrity="sha256-oYy9uw+7cz1/TLpdKv1rJwbj8UHHQ/SRBX5YADaM2OU=" crossorigin="anonymous"></script>
<script src="https://w.soundcloud.com/player/api.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/video.js/5.4.4/video.min.js" integrity="sha256-G7x2zGxKAoYkH+OZEozBSzZ5K7Dh+5T+k9FBQ0GGTcw=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/0.9.16/socket.io.min.js" integrity="sha256-bFYtqOZj1MLDlOrOlxCU9aruDP2zxiIKvmoo+dHsy4w=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.19.1/moment.min.js" integrity="sha256-zG8v+NWiZxmjNi+CvUYnZwKtHzFtdO8cAKUIdB8+U9I=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-duration-format/1.3.0/moment-duration-format.min.js" integrity="sha256-SjPDuWPRLxUNqTwhiAcTNcIwQLbf5khquJsz5fekYms=" crossorigin="anonymous"></script>

<script>
	var CDN_ORIGIN = "<?= CDN_ORIGIN ?>";
	var socketIOTarget = "https://<?= SocketIO_HOST ?>:<?= SocketIO_PORT ?>";
	var videoWidth = <?php echo $playerDims['w']; ?>;
	var videoHeight = <?php echo $playerDims['h']; ?>;
	var WINDOW_TITLE = '<?php echo $TITLE; ?>';
</script>

<script src="<?= cdn('js/plugin-data.js') ?>"></script>
<script src="<?= cdn('js/lib.js') ?>"></script>
<script src="<?= cdn('js/init.js') ?>"></script>
<script src="<?= cdn('js/functions.js') ?>"></script>
<script src="<?= cdn('js/callbacks.js') ?>"></script>
<script src="<?= cdn('js/player.js') ?>"></script>
<script src="<?= cdn('js/berrymotes.berrytube.js') ?>"></script>
<script src="<?= cdn('js/berrymotes.core.js') ?>" async defer></script>
<script src="<?= cdn('js/countdown.js') ?>" async defer></script>

<?php
	// Load any other headers, like from the theme cookie.
	if(isset($_SESSION['overrideCss']) && !empty($_SESSION['overrideCss'])){
		$forceTheme = $_SESSION['overrideCss'];
	}

	//$forceTheme = ""; // Used for like, holiday shit. Neat effect: Does not need to be an actual selectable theme!

	if(!empty($forceTheme)){
		//setcookie("siteThemePath", $forceTheme, time()+(60*60*24*30));
		$_COOKIE['siteThemePath'] = $forceTheme;
		print('<script> $(function(){ $("body").data("cssOverride","'.$forceTheme.'"); } );</script>');
	}

	if(isset($_COOKIE['siteThemePath']) && !empty($_COOKIE['siteThemePath'])){
		print('<link rel="stylesheet" href="'.$_COOKIE['siteThemePath'].'" id="themeCss"/>');
	}
?>

<template id="countdown-future-row">
    <tr>
        <th class="countdown-title" scope="row"></th>
        <td class="countdown-start-time"></td>
        <td class="countdown-time-diff"></td>
        <td class="countdown-note"></td>
    </tr>
</template>

<template id="countdown-happening-row">
    <tr>
        <th class="countdown-title" scope="row"></th>
        <td class="countdown-happening" colspan="2">It's happening!</td>
        <td class="countdown-note"></td>
    </tr>
</template>
