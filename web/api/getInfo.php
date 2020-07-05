<?php

	require_once('apiconfig.php');

	header('Access-Control-Allow-Origin: '.$_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
    header('Access-Control-Max-Age: 1000');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

	$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
	if (mysqli_connect_error()) {
		die('Connect Error (' . mysqli_connect_errno() . ') '. mysqli_connect_error());
	}

	require_once("IPSession.php");

	$ips = new ipSession($mysqli);

	if(!isset($ips->session->last_hit)){
		$ips->session->last_hit = time()-1;
	}
	if($ips->session->last_hit == time()){
		die("Rate-limit Exceeded");
	}

	$ips->session->last_hit = time();
	$ips->save();

	$mode = "fail";
	$format = "fail";
	if(isset($_GET['username'])){ $mode = "get"; }
	if(isset($_POST['username'])){ $mode = "post"; }
	if(isset($_GET['format'])){ $format = $_GET['format']; }
	if(isset($_POST['format'])){ $format = $_POST['format']; }
	//foreach($_GET as $k => $v){$_GET[$k] = $mysqli->real_escape_string($_GET[$k]);}
	//foreach($_POST as $k => $v){$_POST[$k] = $mysqli->real_escape_string($_POST[$k]);}

	if($mode == "fail"){
		$x = array(
			"result" => "fail",
			"message" => "No valid input specified"
		);
		die($x["message"]);
	}

	if($format == "fail"){
		$x = array(
			"result" => "fail",
			"message" => "You must specify format = xml or json"
		);
		die($x["message"]);
	}

	if($mode == "get"){
		$username = $mysqli->real_escape_string($_GET['username']);
	}

	if($mode == "post"){
		$username = $mysqli->real_escape_string($_POST['username']);
	}

	$q = sprintf('SELECT * FROM users where `name` = "%s"',$username);
	$blacklist = array(
		"meta",
		"pass"
	);

	if($format == "xml"){
		$output = "<?xml version=\"1.0\"?>\n<user>";
		if ($result = $mysqli->query($q)) {
			while($row = $result->fetch_array(MYSQLI_ASSOC)){

				$node = "";
				foreach($row as $k => $v){
					if(in_array($k,$blacklist)) continue;
					$node .= sprintf("\n\t\t<%s>%s</%s>",$k,htmlspecialchars(urldecode($v)),$k);
				}
				$output .= "\n\t<attribute>".$node."\n\t</attribute>";
			}
			/* free result set */
			$result->close();
		}
		$output .= "\n</user>";
		header("Content-type: text/xml; charset=utf-8");
		print $output;
		die();
	}

	if($format == "json"){
		$output = array();
		if ($result = $mysqli->query($q)) {
			while($row = $result->fetch_array(MYSQLI_ASSOC)){
				$filtered = array();
				foreach($row as $k => $v){
					if(in_array($k,$blacklist)) continue;
					$filtered[$k] = $row[$k];
				}
				$output[] = $filtered;
			}
			$result->close();
		}
		header("Content-type: application/json; charset=utf-8");
		print json_encode($output);
		die();
	}
	//print_r($playlist);
