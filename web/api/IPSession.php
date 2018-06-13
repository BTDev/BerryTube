<?php

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
				  `id` int(10) unsigned NOT NULL auto_increment,
				  `ip` varchar(20) NOT NULL,
				  `session` blob NOT NULL,
				  PRIMARY KEY  (`id`)
				) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;
			';
			$this->mysqli->query($create);
			$result = $this->mysqli->query($q);
		}

		// Handle New IP.
		if($result->num_rows == 0){
			// Create inital.
			$q = 'insert into `api` (`ip`,`session`) VALUES ("'.CLIENT_IP.'","'.(base64_encode(json_encode(array()))).'");';
			$this->mysqli->query($q);
		}

		while($row = $result->fetch_array(MYSQLI_ASSOC)){
			$this->session = json_decode(base64_decode($row['session']));
		}
		/* free result set */
		$result->close();
	}

	function save(){
		$q = 'update `api` set `session` = "'.(base64_encode(json_encode($this->session))).'" where `ip` = "'.CLIENT_IP.'"';
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
