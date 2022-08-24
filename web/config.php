<?php

	require_once('api/apiconfig.php');

	function sha1_dir($dirname) {
		$hashes = '';
		$iter = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dirname, FilesystemIterator::SKIP_DOTS));
		foreach ($iter as $fname) {
			$hashes .= sha1_file($fname, true);
		}
		return sha1($hashes, true);
	}

	function cdn($fname) {
		if (NO_CDN) {
			return $fname;
		}
		$fname = ltrim($fname, '/');
		if (substr($fname, 0, 11) == 'js/modules/') {
			$hash = sha1_dir(__DIR__ . '/js/modules');
		} else {
			$hash = @sha1_file(__DIR__ . '/' . $fname, true);
		}
		if ($hash) {
			$hash = strtr(rtrim(base64_encode($hash), '='), '+/', '-_');
			if (CDN_ORIGIN === ORIGIN) {
				return "/sha1/$hash/$fname";
			}
			return CDN_ORIGIN . "/sha1/$hash/$fname";
		}
		return $fname;
	}

	function cdn_absolute($fname) {
		$url = cdn($fname);
		if (substr($url, 0, 8) === 'https://') {
			return $url;
		}
		return CDN_ORIGIN . '/' . ltrim($url, '/');
	}

	function start_minified_tags() {
		if (NO_MINIFIED) {
			ob_start();
		}
	}

	function end_minified_tags() {
		if (NO_MINIFIED) {
			$source = ob_get_clean();
			$doc = new DOMDocument();
			$doc->loadHTML($source, LIBXML_HTML_NODEFDTD);

			function handle_element($el, $link) {
				if (strpos($link->value, '/socket.io/') !== false || strpos($link->value, '/dashjs/') !== false) {
					return;
				}

				$link->value = str_replace('.min.', '.', $link->value);

				$integrity = $el->attributes->getNamedItem('integrity');
				if ($integrity) {
					$integrity->value = null;
				}
			}

			foreach ($doc->getElementsByTagName('script') as $el) {
				$link = $el->attributes->getNamedItem('src');
				if ($link) {
					handle_element($el, $link);
				}
			}

			foreach ($doc->getElementsByTagName('link') as $el) {
				$link = $el->attributes->getNamedItem('href');
				if ($link) {
					handle_element($el, $link);
				}
			}

			echo preg_replace('#</?(html|head|body)>#i', '', $doc->saveHTML());
		}
	}
	//random uuid generator
	function guidv4($data = null) {
		$data = $data ?? random_bytes(16);
		assert(strlen($data) == 16);
		// Set version to 0100
		$data[6] = chr(ord($data[6]) & 0x0f | 0x40);
		// Set bits 6-7 to 10
		$data[8] = chr(ord($data[8]) & 0x3f | 0x80);
		// Output the 36 character UUID.
		return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
	
	}

	$mysqli = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
	if (mysqli_connect_error()) {
		die('Server is still restarting, please refresh again in a bit.');
	}

	// Check for any theme override
	$themeOverride = '';
	$q = sprintf('SELECT * FROM misc WHERE name = "overrideCss"');
	if ($result = $mysqli->query($q)) {
		if($result->num_rows > 0){
			$row = $result->fetch_object();
			$themeOverride = $row->value;
		}
		/* free result set */
		$result->close();
	}
	// cookie primarily for party room voting
	if(!isset($_COOKIE['uniqueBrowser'])) {
		setcookie('uniqueBrowser', guidv4(), time()+86400, '/', $domain);
	}
