<?php
	if( $_SERVER['REMOTE_ADDR'] == "24.96.63.69" ){
		//header('Location: http://meatspin.com/');
	}

	if(isset($_GET['LayoutType'])) { $_COOKIE['LayoutType'] = $_GET['LayoutType']; }
	if(isset($_COOKIE['LayoutType'])){
		if($_COOKIE['LayoutType'] == "compact"){
			require_once("compact.php");
		} elseif($_COOKIE['LayoutType'] == "miggy"){
			require_once("miggy.php");
		} else {
			require_once("hd.php");
		}
	} else {
		require_once("hd.php");
	}