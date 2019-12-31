<?php
	require_once("config.php");
	setcookie("LayoutType", "compact", time()+(60*60*24*30), "", "", true, false);
	define('LAYOUT', 'compact');

	$w = 693; $r = 9/16;
	$playerDims = Array(
		"w" => $w,
		"h" => ceil($w * $r)
	);

	require('body.php');
