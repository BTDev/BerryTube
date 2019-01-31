<meta charset="utf-8">
<meta name="theme-color" content="#421C52">
<meta name="description" content="BerryTube">
<meta name="author" content="Cades / GreyMage / Eric Cutler">
<meta name="robots" content="noindex">

<style>html { background: #421C52; }</style>

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
		'Lion-O is in the set of "not Snoop Lion".',
		'Horse marriage simulator'
	);
	$TITLE = 'BerryTube :: ' . $titles[array_rand($titles)];
?>
<title><?php echo $TITLE; ?></title>

<link rel="shortcut icon" href="<?= cdn('images/favicon.ico') ?>"/>
<link rel="icon" type="image/png" sizes="32x32" href="<?= cdn('images/favicon32.png') ?>"/>
<link rel="icon" type="image/png" sizes="192x192" href="<?= cdn('images/favicon192.png') ?>"/>
<link rel="icon" type="image/png" sizes="512x512" href="<?= cdn('images/favicon512.png') ?>"/>
<link rel="manifest" href="/manifest.json"/>

<link rel="stylesheet" href="<?= cdn('css/colors.css') ?>" id="mainTheme"/>
<link rel="stylesheet" href="<?= cdn('css/layout-other.css') ?>"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/video.js/7.3.0/video-js.min.css" integrity="sha256-mujqz1jG8djcBxoJnvfvTIjRxz7y5xNpzY18x8au5ck=" crossorigin="anonymous" />
<link rel="stylesheet" href="<?= cdn('css/uni-gui.css') ?>" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/themes/ui-lightness/jquery-ui.min.css" integrity="sha256-N7K28w/GcZ69NlFwqiKb1d5YXy37TSfgduj5gQ6x8m0=" crossorigin="anonymous" />
<link rel="stylesheet" href="<?= cdn('css/countdown.css') ?>" />
<link rel="stylesheet" href="<?= cdn('berrymotes/css/berryemotecore.css') ?>" />

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>

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

<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js" integrity="sha256-KM512VNnjElC30ehFwehXjx1YCHPiQkOPmqnrWtpccM=" crossorigin="anonymous" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tinyscrollbar/2.4.2/jquery.tinyscrollbar.min.js" integrity="sha256-gENsdwXJl1qiwOqS0DF+kfqTP5Dy+0gDTtxpRcWVhrU=" crossorigin="anonymous" defer></script>
<script src="https://w.soundcloud.com/player/api.js" defer></script>
<script src="https://player.vimeo.com/api/player.js" defer></script>
<script src="https://player.twitch.tv/js/embed/v1.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/video.js/7.3.0/video.min.js" integrity="sha256-FtN3AlYCFtRDFdQIG+XM7JgkF3CYyzDkysTR34GUII4=" crossorigin="anonymous" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/videojs-flash/2.1.2/videojs-flash.min.js" integrity="sha256-2sKPIPOV8Cj34r74ZnRcdKrQ7Jqqg0o1zR2c74VDW1s=" crossorigin="anonymous" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dashjs/2.9.2/dash.all.min.js" integrity="sha256-EmXFhpSryXnCa3tOiKDfYUFhpmnkvo3PSe3Tj3KpX6o=" crossorigin="anonymous" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/videojs-contrib-dash/2.10.0/videojs-dash.min.js" integrity="sha256-xhLRr5mlvCCC7DndQjNURZOXGxwYUoB2VoF0mNUiuJc=" crossorigin="anonymous" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/0.9.16/socket.io.min.js" integrity="sha256-bFYtqOZj1MLDlOrOlxCU9aruDP2zxiIKvmoo+dHsy4w=" crossorigin="anonymous" defer></script>

<script src="<?= cdn('js/lib.js') ?>" defer></script>
<script src="<?= cdn('js/init.js') ?>" defer></script>
<script src="<?= cdn('js/functions.js') ?>" defer></script>
<script src="<?= cdn('js/callbacks.js') ?>" defer></script>
<script src="<?= cdn('js/player.js') ?>" defer></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/cookieconsent2/3.1.0/cookieconsent.min.js" integrity="sha256-y0EpKQP2vZljM73+b7xY4dvbYQkHRQXuPqRjc7sjvnA=" crossorigin="anonymous" defer></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js" integrity="sha256-CutOzxCRucUsn6C6TcEYsauvvYilEniTXldPa6/wu0k=" crossorigin="anonymous" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-duration-format/2.2.2/moment-duration-format.min.js" integrity="sha256-bXC/nhRjq/J7K4hnL8yvthqXkskSKOsZNfrLgXBigYg=" crossorigin="anonymous" defer></script>
<script src="<?= cdn('js/countdown.js') ?>" defer></script>

<script src="<?= cdn('berrymotes/js/berrymotes.berrytube.js') ?>" defer></script>
<script src="<?= cdn('berrymotes/js/berrymotes.core.js') ?>" defer></script>

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

<script>
	var ORIGIN = '<?= ORIGIN ?>';
	var SOCKET_ORIGIN = '<?= SOCKET_ORIGIN ?>';
	var CDN_ORIGIN = '<?= CDN_ORIGIN ?>';
	var videoWidth = <?= $playerDims['w'] ?>;
	var videoHeight = <?= $playerDims['h'] ?>;
	var WINDOW_TITLE = '<?= $TITLE ?>';

	// here for caching reasons
	var NOTIFY = new Audio('<?= cdn('sounds/notify.wav') ?>');
	var DRINK = new Audio('<?= cdn('sounds/drink.wav') ?>');
	var ATTENTION = new Audio('<?= cdn('sounds/attention.wav') ?>');

	// for EU cookie law popup
	var MY_COUNTRY = <?php
		try {
			require_once('geoip2.phar');
			$georeader = new GeoIp2\Database\Reader('/usr/local/share/GeoIP/GeoLite2-Country.mmdb');
			$geo = $georeader->country(CLIENT_IP);
			echo "'", $geo->country->isoCode, "';\n";
		} catch (Exception $e) {
			echo "null;\n";
			echo "/* $e */\n";
		}
		?>

	var scriptNodes = <?php
		require_once('plugin-data.php');
		echo json_encode($plugin_data, JSON_UNESCAPED_SLASHES);
		?>;

	Bem = typeof Bem === "undefined" ? {} : Bem;
	Bem.skip_css = true;
	Bem.origin = ORIGIN + '/berrymotes';
	Bem.cdn_origin = CDN_ORIGIN + '/berrymotes';
	Bem.data_url = '<?= cdn('berrymotes/data/berrymotes_json_data.v2.json') ?>';
</script>
