<?php

	define("DB_HOST","mysql");
	define("DB_NAME","btube");
	define("DB_USER","root");
	define("DB_PASS","root");
	// define("SocketIO_HOST","192.168.99.100");
	define("SocketIO_PORT","8443");
	/* CUT AFTER ME FOR ANY CHANGES. */
	define("PATH","/");

	$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
	if (mysqli_connect_error()) {
		die('Connect Error (' . mysqli_connect_errno() . ') '. mysqli_connect_error(). " " . DB_HOST);
	}

	session_start();

	// Check for any theme override
	$q = sprintf('SELECT * FROM misc WHERE name = "overrideCss"');
	if ($result = $mysqli->query($q)) {
		if($result->num_rows > 0){
			$row = $result->fetch_object();
			$_SESSION['overrideCss'] = $row->value;
		}
		/* free result set */
		$result->close();
	}

