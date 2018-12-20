<?php

require_once('apiconfig.php');

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
			$q = 'insert into `api` (`ip`,`session`) VALUES ("'.CLIENT_IP.'","'.($mysqli->real_escape_string(json_encode(array()))).'");';
			$this->mysqli->query($q);
		}

		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$this->session = json_decode($row['session']);
		}
		/* free result set */
		$result->close();
	}

	function save(){
		$q = 'update `api` set `session` = "'.($mysqli->real_escape_string(json_encode($this->session))).'" where `ip` = "'.CLIENT_IP.'"';
		//print $q;
		$this->mysqli->query($q);
	}
}
