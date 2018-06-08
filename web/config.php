<?php

	define("DB_HOST","bt-mysql");
	define("DB_NAME","berrytube");
	define("DB_USER","berrytube");
	define("DB_PASS","berrytube");
	define('NODE_ORIGIN', 'https://' . getenv('SOCKET_DOMAIN') . ((getenv('HTTPS_PORT') === '443') ? '' : (':' . getenv('HTTPS_PORT'))));
	define('CDN_ORIGIN', 'https://' . getenv('CDN_DOMAIN') . ((getenv('HTTPS_PORT') === '443') ? '' : (':' . getenv('HTTPS_PORT'))));
	/* CUT AFTER ME FOR ANY CHANGES. */
	define("PATH","/");

	function cdn($fname, $offset='.') {
		$hash = @sha1_file("$offset/$fname");
		if ($hash) {
			return CDN_ORIGIN . "/sha1/$hash/$fname";
		} else {
			return $fname;
		}
	}

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

