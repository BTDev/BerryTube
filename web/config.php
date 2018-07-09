<?php

	require('api/apiconfig.php');

	function cdn($fname) {
		if (NO_CDN) {
			return $fname;
		}
		$hash = @sha1_file(__DIR__ . '/' . $fname, true);
		if ($hash) {
			$hash = rtrim(strtr(base64_encode($hash), '+/', '-_'), '=');
			return CDN_ORIGIN . "/sha1/$hash/$fname";
		} else {
			return $fname;
		}
	}

	$mysqli = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
	if (mysqli_connect_error()) {
		die('Server is still restarting, please refresh again in a bit.');
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

