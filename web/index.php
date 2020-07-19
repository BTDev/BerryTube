<?php

	require_once('config.php');

	$preconnects = [
		'https://www.youtube.com',
		'https://w.soundcloud.com',
		'https://player.vimeo.com',
		'https://player.twitch.tv',
		'https://api.dmcdn.net'
	];
	if (CDN_ORIGIN !== ORIGIN) {
		array_unshift($preconnects, CDN_ORIGIN);
	}

	$corsPreconnects = [
		'https://cdnjs.cloudflare.com'
	];
	if (SOCKET_ORIGIN !== ORIGIN) {
		array_unshift($corsPreconnects, SOCKET_ORIGIN);
	}

	foreach ($preconnects as $origin) {
		header("Link: <$origin>; rel=preconnect", false);
	}
	foreach ($corsPreconnects as $origin) {
		header("Link: <$origin>; rel=preconnect; crossorigin", false);
	}

	if(isset($_GET['LayoutType'])) { $_COOKIE['LayoutType'] = $_GET['LayoutType']; }
	if(isset($_COOKIE['LayoutType']) && $_COOKIE['LayoutType'] == "compact"){
		require_once("compact.php");
	} else {
		require_once("hd.php");
	}
