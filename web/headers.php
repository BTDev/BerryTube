<meta charset="utf-8">
<?php // Pick random title.
	$titles = array(
		'BerryTube :: This is why I drink!',
		'BerryTube :: It seemed like a good idea at the time.',
		'BerryTube :: IM SO FRESH YOU CAN SUCK MY NUTS SWAG',
		'BerryTube :: The 24/7 out of control party abomination that is berrytube.tv!',
		'BerryTube :: What could go wrong?',
		'BerryTube :: Love the mods with mouth',
		'BerryTube :: This website runs on electricity and Stockholm Syndrome.',
		'BerryTube :: "If you dont like the wordfilters, you can fuck off back to synchtube".',
		'BerryTube :: "If you dont like the wordfilters, you can sexual intercourse off back to synchtube."',
		'BerryTube :: In which two dapper strapping lads attempt to flirt with me.',
		'BerryTube :: I made a Rainbow Dash Space Marine Army. Friendship is Bolters.',
		'BerryTube :: Of all the substances in the movie, that is the most ejaculate-like.',
		'BerryTube :: We are all about special treatment, not ascii statistics.',
		'BerryTube :: Like 500 picoHitlers.',
		'BerryTube :: STAPHG HO NOP',
		'BerryTube :: Really little pony if you were open up my always and now it through this crystal Greer its a roof sunrise.',
		'BerryTube :: Shes too busy with her titties to stop the changelings.',
		'BerryTube :: Now were cooking with nipples.',
		'BerryTube :: Drunk is a universal language.',
		'BerryTube :: GO TO BERRYTUBE.TV FOR MORE AMAAAAZING PONY VIDEOS #YOLO #SWAG',
		'BerryTube :: Blueshift: aw, EternalLullaby isnt here, i had an orgy related question for him',
		'BerryTube :: I forgot I had amplification on.',
		'BerryTube :: Its where alcohol and ponies merge and there are no survivors',
		'BerryTube :: The desk needs foreplay',
		'BerryTube :: its easier to deal with omnomtom than peta',
		'BerryTube :: Im sorry I made your dick twitch.',
		'BerryTube :: What is this? A Daycare for the sexually deviant?',
		'BerryTube :: It appears to run on some form of alcohol.',
		'BerryTube :: Its basically a drinking site with a pony problem.',
		'BerryTube :: Theres too many mouths and only one dick. Please take turns.',
		'BerryTube :: You can always be deeper.',
		'BerryTube :: Strive to be as honest as hitler.',
		'BerryTube :: Hats and Lies.',
		'BerryTube :: The soundtrack of a perfect porno',
		'BerryTube :: WHO NINAsfa FUCMER',
		'BerryTube :: Lion-O is in the set of "not Snoop Lion".'
	);
	$TITLE = $titles[array_rand($titles)];
?>
<title><?php echo $TITLE; ?></title>
<meta name="description" content="<?php echo $TITLE; ?>">
<meta name="author" content="Cades / GreyMage / Eric Cutler">
<meta name="robots" content="noindex">
<script src="js/jquery-1.8.2.js"></script>
<script src="js/jquery-ui-1.9.1.custom.js"></script>
<script src="js/jquery.tinyscrollbar.min.js"></script>
<script src="js/swfobject.js"></script>
<script src="js/froogaloop.min.js"></script>
<script src="https://w.soundcloud.com/player/api.js"></script>
<script src="http://vjs.zencdn.net/5.4.4/video.js"></script>
<!-- Socket.IO stuff -->
<script src="//<?= $_SERVER['HTTP_HOST'] ?>:<?= SocketIO_PORT ?>/socket.io/socket.io.js"></script>
<script>

	var socketIOTarget = location.hostname+":<?php echo SocketIO_PORT; ?>";
	var videoWidth = <?php echo $playerDims['w']; ?>;
	var videoHeight = <?php echo $playerDims['h']; ?>;
	var WINDOW_TITLE = '<?php echo $TITLE; ?>';

	// When socket is loaded...
	(_i = function(){

		if(!window.io){
			return setTimeout(_i,100);
		}

		try{

			window.socket = io.connect('//'+socketIOTarget,{
				'connect timeout': 5000,
				'reconnect': true,
				'reconnection delay': 500,
				'reopen delay': 500,
				'max reconnection attempts': 10
			});

			window.socket.on('error', function (reason){
				if(reason == "handshake error") {
					window.location = "ban.php";
				} else {
					$(function() {
						var AWSHIT = $("<center><h1>Unable to connect Socket.IO: "+reason+"</h1></center>").prependTo(document.body);
						console.error(e);
					});
				}
			});
		} catch(e) {
			$(function() {
				var debugging = $("<center><h3>"+e+"</h3></center>").prependTo(document.body);
				var AWSHIT = $("<center><h1>Aw shit! Couldn't connect to the server!</h1></center>").prependTo(document.body);
			});
		}
	})();


</script>

<script src="js/plugin-data.js"></script>
<script src="js/lib.js"></script>
<script src="js/init.js"></script>
<script src="js/functions.js"></script>
<script src="js/callbacks.js"></script>
<script src="js/player.js"></script>

<?php
	// Load plugins
	if ($handle = opendir('./js/plugins')) {
		/* This is the correct way to loop over the directory. */
		while (false !== ($entry = readdir($handle))) {
			if(preg_match('/\.js$/',$entry)){
				echo '<script src="js/plugins/'.$entry.'"></script>';
			}
		}
		closedir($handle);
	}
?>

<link rel="stylesheet" type="text/css" href="css/colors.css" id="mainTheme"/>
<link rel="stylesheet" type="text/css" href="css/layout-other.css"/>
<link href="http://vjs.zencdn.net/5.4.4/video-js.css" rel="stylesheet">

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
		print('<link rel="stylesheet" type="text/css" href="'.$_COOKIE['siteThemePath'].'" id="themeCss"/>');
	}
?>
<link rel="stylesheet" type="text/css" href="css/uni-gui.css" />
<link rel="stylesheet" type="text/css" href="css/ui-lightness/jquery-ui.css" />
