<?php
	require_once("config.php");
	setcookie("LayoutType", "hd", time()+(60*60*24*30), "", "", true, false);
	define('LAYOUT', 'hd');

	$w = 853; $r = 9/16;
	$playerDims = Array(
		"w" => $w,
		"h" => ceil($w * $r)
	);

	require('body.php');
