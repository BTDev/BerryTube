<?php

	require_once('apiconfig.php');
	require_once('cors.php');

	$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
	if (mysqli_connect_error()) {
		die('Connect Error (' . mysqli_connect_errno() . ') '. mysqli_connect_error());
	}

	class ipSession{

		var $mysqli;
		var $session;

		function ipSession($mysqli){
			$this->session = new stdClass();
			// Load IP Session
			$this->mysqli = $mysqli;
			$q = 'select `session` from `api` where `ip` = "'.CLIENT_IP.'"';
			$result = $this->mysqli->query($q);

			// Handle New IP.
			if($result->num_rows == 0){
				// Create inital.
				$q = 'insert into `api` (`ip`,`session`) VALUES ("'.CLIENT_IP.'","'.($this->mysqli->real_escape_string(json_encode(array()))).'");';
				$this->mysqli->query($q);
			}

			while($row = $result->fetch_array(MYSQLI_ASSOC)){
				$this->session = (object)json_decode($row['session']);
			}
			/* free result set */
			$result->close();
		}

		function save(){
			$q = 'update `api` set `session` = "'.($this->mysqli->real_escape_string(json_encode($this->session))).'" where `ip` = "'.CLIENT_IP.'"';
			//print $q;
			$this->mysqli->query($q);
		}
	}

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
	if(isset($_GET['username']) && isset($_GET['password'])){ $mode = "get"; }
	if(isset($_POST['username']) && isset($_POST['password'])){ $mode = "post"; }
	if(isset($_GET['format'])){ $format = $_GET['format']; }
	if(isset($_POST['format'])){ $format = $_POST['format']; }

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
		$password = $_GET['password'];
	}

	if($mode == "post"){
		$username = $mysqli->real_escape_string($_POST['username']);
		$password = $_POST['password'];
	}

	$q = sprintf('SELECT * FROM users where `name` = "%s"',$username);
	$blacklist = array(
		"meta",
		"pass"
	);

	function checkPassword($input, $actual) {
		return md5($input) == $actual || password_verify($input, preg_replace('/^\\$2b\\$/', '\\$2y\\$', $actual));
	}

	if($format == "xml"){
		$output = "<?xml version=\"1.0\"?>\n<user>";
		if ($result = $mysqli->query($q)) {
			while($row = $result->fetch_array(MYSQLI_ASSOC)){
				if (!checkPassword($password, $row['pass'])) {
					die();
				}
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
				if (!checkPassword($password, $row['pass'])) {
					die();
				}
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
