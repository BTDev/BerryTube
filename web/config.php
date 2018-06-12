<?php

	define("DB_HOST","mysql");
	define("DB_NAME","berrytube");
	define("DB_USER","berrytube");
	define("DB_PASS",getenv('MYSQL_PASSWORD'));
	define('ORIGIN', 'https://' . getenv('DOMAIN') . ((getenv('HTTPS_PORT') === '443') ? '' : (':' . getenv('HTTPS_PORT'))));
	define('SOCKET_ORIGIN', 'https://' . getenv('SOCKET_DOMAIN') . ((getenv('HTTPS_PORT') === '443') ? '' : (':' . getenv('HTTPS_PORT'))));
	define('CDN_ORIGIN', 'https://' . getenv('CDN_DOMAIN') . ((getenv('HTTPS_PORT') === '443') ? '' : (':' . getenv('HTTPS_PORT'))));
	define('OLD_ORIGIN', 'http://' . getenv('DOMAIN') . ((getenv('HTTP_PORT') === '80') ? '' : (':' . getenv('HTTP_PORT'))));
	define('OLD_ORIGIN_WWW', 'http://www.' . getenv('DOMAIN') . ((getenv('HTTP_PORT') === '80') ? '' : (':' . getenv('HTTP_PORT'))));
	define('NO_CDN', getenv('NO_CDN') === 'true');
	/* CUT AFTER ME FOR ANY CHANGES. */
	define("PATH","/");

	function cdn($fname) {
		if (NO_CDN) {
			return $fname;
		}
		$hash = @sha1_file(__DIR__ . '/' . $fname);
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

