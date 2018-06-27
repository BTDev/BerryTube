<?php

	require('apiconfig.php');

	header('Access-Control-Allow-Origin: '.$_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
    header('Access-Control-Max-Age: 1000');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

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

			// Handle No Table
			if(!$result){
				//die($mysqli->error);
				$create = '
					CREATE TABLE IF NOT EXISTS `api` (
					  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
					  `ip` varchar(20) NOT NULL,
				      `session` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
					  PRIMARY KEY (`id`)
					) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
				';
				$this->mysqli->query($create);
				$result = $this->mysqli->query($q);
			}

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
		/*

CREATE TABLE IF NOT EXISTS `api` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `ip` varchar(20) NOT NULL,
  `session` blob NOT NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

*/
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
	if(isset($_GET['username']) && isset($_GET['md5pass'])){ $mode = "get"; }
	if(isset($_POST['username']) && isset($_POST['md5pass'])){ $mode = "post"; }
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
		if(isset($_GET['md5pass'])){
			$password = $mysqli->real_escape_string($_GET['md5pass']);
		} else {
			$password = md5($_GET['password']);
		}
	}

	if($mode == "post"){
		$username = $mysqli->real_escape_string($_POST['username']);
		if(isset($_POST['md5pass'])){
			$password = $mysqli->real_escape_string($_POST['md5pass']);
		} else {
			$password = md5($_POST['password']);
		}
	}

	$q = sprintf('SELECT * FROM users where `name` = "%s" and `pass` = "%s"',$username,$password);
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
		header("Content-type: text; charset=utf-8");
		print json_encode($output);
		die();
	}
	//print_r($playlist);
