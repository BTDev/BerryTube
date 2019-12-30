<?php

	require_once('config.php');

	header('Link: <'.CDN_ORIGIN.'>; rel=preconnect; crossorigin', false);
	header('Link: <'.SOCKET_ORIGIN.'>; rel=preconnect; crossorigin', false);
	header('Link: <https://cdnjs.cloudflare.com>; rel=preconnect; crossorigin', false);

	if(isset($_GET['LayoutType'])) { $_COOKIE['LayoutType'] = $_GET['LayoutType']; }
	if(isset($_COOKIE['LayoutType']) && $_COOKIE['LayoutType'] == "compact"){
		require_once("compact.php");
	} else {
		require_once("hd.php");
	}
