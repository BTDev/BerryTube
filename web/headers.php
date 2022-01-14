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
<link rel="icon" type="image/png" sizes="512x512" href="<?= cdn('images/favicon512.png') ?>"/>
<link rel="icon" type="image/webp" sizes="512x512" href="<?= cdn('images/favicon512.webp') ?>"/>
<link rel="manifest" href="/manifest.json"/>

<?php start_minified_tags(); ?>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/video.js/7.15.4/video-js.min.css" integrity="sha512-RU6FIpN8MZ6jrswHMYzP9t7QlAtDkpCJP6uqyHYm56iP6eEdYCDfMW2C42KtimtJ8DKa+iWJqjpeTyLyQjV61g==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/themes/ui-lightness/jquery-ui.min.css" integrity="sha256-N7K28w/GcZ69NlFwqiKb1d5YXy37TSfgduj5gQ6x8m0=" crossorigin="anonymous" />
<link rel="stylesheet" href="<?= cdn('vendor/videojs-quality-selector/quality-selector.css') ?>" />

<link rel="stylesheet" href="<?= cdn('css/colors.css') ?>" id="mainTheme"/>
<script>
	const themeOverride = '<?= $themeOverride ?>';
	if (themeOverride) {
		localStorage.setItem('themeOverride', themeOverride);
		localStorage.setItem('siteThemePath', themeOverride);
	} else {
		if (localStorage.getItem('themeOverride') === localStorage.getItem('siteThemePath')) {
			localStorage.removeItem('siteThemePath');
		}
		localStorage.removeItem('themeOverride');
	}

	const initialTheme = localStorage.getItem('siteThemePath');
	if (initialTheme) {
		document.write(`<link rel="stylesheet" href="${initialTheme}" id="themeCss" />`);
	}
</script>

<link rel="stylesheet" href="<?= cdn('css/layout-other.css') ?>" />
<link rel="stylesheet" href="<?= cdn('css/uni-gui.css') ?>" />
<link rel="stylesheet" href="<?= cdn('css/countdown.css') ?>" />
<link rel="stylesheet" href="<?= cdn('berrymotes/css/berryemotecore.css') ?>" />

<?php
if (date('n') == 6 && $_COOKIE['no-pride'] !== 'true') {
	echo '<link rel="stylesheet" href="', cdn('css/pride.css'), '" />';
}
?>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js" integrity="sha256-KM512VNnjElC30ehFwehXjx1YCHPiQkOPmqnrWtpccM=" crossorigin="anonymous" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tinyscrollbar/2.4.2/jquery.tinyscrollbar.min.js" integrity="sha256-gENsdwXJl1qiwOqS0DF+kfqTP5Dy+0gDTtxpRcWVhrU=" crossorigin="anonymous" defer></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/video.js/7.15.4/video.min.js" integrity="sha512-dsg6qxwnVPFvhJhbRxyhW9gFvzytQ//4fCinJgKZQuoH6v6JYryP4OOjDGY7MfdVHjv1trJRDmJWdL2dNsbm6A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/0.9.16/socket.io.min.js" integrity="sha256-bFYtqOZj1MLDlOrOlxCU9aruDP2zxiIKvmoo+dHsy4w=" crossorigin="anonymous" defer></script>

<script src="<?= cdn('vendor/videojs-quality-selector/silvermine-videojs-quality-selector.js') ?>" defer></script>

<script src="https://www.youtube.com/iframe_api" defer id="youtube-iframe-api"></script>
<script src="https://w.soundcloud.com/player/api.js" defer></script>
<script src="https://player.vimeo.com/api/player.js" defer></script>
<script src="https://player.twitch.tv/js/embed/v1.js" defer></script>
<script src="https://api.dmcdn.net/all.js" defer></script>

<script src="<?= cdn('js/lib.js') ?>" defer></script>
<script src="<?= cdn('js/init.js') ?>" defer></script>
<script src="<?= cdn('js/functions.js') ?>" defer></script>
<script src="<?= cdn('js/callbacks.js') ?>" defer></script>
<script src="<?= cdn('js/modules/main.js') ?>" type="module"></script>
<script src="<?= cdn('js/modules/player.js') ?>" type="module"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/cookieconsent2/3.1.0/cookieconsent.min.js" integrity="sha256-y0EpKQP2vZljM73+b7xY4dvbYQkHRQXuPqRjc7sjvnA=" crossorigin="anonymous" defer></script>

<script src="<?= cdn('berrymotes/js/berrymotes.berrytube.js') ?>" defer></script>
<script src="<?= cdn('berrymotes/js/berrymotes.core.js') ?>" defer></script>



<?php end_minified_tags(); ?>

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
	var WORKER_URLS = {
		countdown: '<?= cdn_absolute('js/countdown.worker.js') ?>'
	};

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
	Bem.data_url = [
		'<?= cdn('berrymotes/data/berrymotes_json_data.v2.json') ?>',
		ORIGIN + '/discord_emotes.php',
	];
	Bem.worker_url = '<?= cdn_absolute('berrymotes/js/berrymotes.worker.js') ?>';
</script>
