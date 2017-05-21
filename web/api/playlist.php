<?php

	//TODO: Abstract these later.
	define("DB_HOST","127.0.0.1");
	define("DB_NAME","btube_db");
	define("DB_USER","btube_db");
	define("DB_PASS","d)4o&rOt7#PK");
	define("SocketIO_HOST","96.127.152.99");
	define("SocketIO_PORT","8344");
	
	function array_to_xml($x, &$y) {
		foreach($x as $key => $value) {
			if(is_array($value)) {
				if(!is_numeric($key)){
					$subnode = $y->addChild("$key");
					array_to_xml($value, $subnode);
				}
				else{
					array_to_xml($value, $y);
				}
			}
			else {
				$y->addChild("$key","$value");
			}
		}
	}
	
	$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
	if (mysqli_connect_error()) {
		die('Connect Error (' . mysqli_connect_errno() . ') '. mysqli_connect_error());
	}

	if($_GET['format'] == "xml"){
		$output = "<?xml version=\"1.0\"?>\n<playlist>";
		$q = sprintf('SELECT * FROM videos order by `position`');
		if ($result = $mysqli->query($q)) {
			while($row = $result->fetch_array(MYSQLI_ASSOC)){
				$node = "";
				foreach($row as $k => $v){
					$node .= sprintf("\n\t\t<%s>%s</%s>",$k,htmlspecialchars(urldecode($v)),$k);
				}
				$output .= "\n\t<video>".$node."\n\t</video>";
			}
			/* free result set */
			$result->close();
		}
		$output .= "\n</playlist>";
		header("Content-type: text/xml; charset=utf-8");
		print $output;
		die();
	}
	
	if($_GET['format'] == "json"){
		$output = array();
		$q = sprintf('SELECT * FROM videos order by `position`');
		if ($result = $mysqli->query($q)) {
			while($row = $result->fetch_array(MYSQLI_ASSOC)){
				$output[] = $row;
			}
			$result->close();
		}
		header("Content-type: text; charset=utf-8");
		print json_encode($output);
		die();
	}
	//print_r($playlist);