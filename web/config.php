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
			return CDN_ORIGIN . "/sha1/$hash/$fname";
		} else {
			return $fname;
		}
	}

	function cdn_absolute($fname) {
		$url = cdn($fname);
		if (substr($url, 0, 4) === 'http') {
			return $url;
		}
		return CDN_ORIGIN . "/$url";
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

