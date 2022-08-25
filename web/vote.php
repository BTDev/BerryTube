<?php

	require_once('config.php');
	if(!isset($_COOKIE['retainVote'])) {
		setcookie('retainVote', 1, time()+60, '/', $domain);
	}

	if (CDN_ORIGIN !== ORIGIN) {
		array_unshift($preconnects, CDN_ORIGIN);
	}

	$corsPreconnects = [
		'https://cdnjs.cloudflare.com'
	];
	if (SOCKET_ORIGIN !== ORIGIN) {
		array_unshift($corsPreconnects, SOCKET_ORIGIN);
	}

	foreach ($corsPreconnects as $origin) {
		header("Link: <$origin>; rel=preconnect; crossorigin", false);
	}
?>
<!doctype html>
<html lang="en">
<head>
	<?php require("voteheaders.php"); ?>
	<style>
body{min-width:auto;}
.wrapper{width:100%;}
</style>
</head>
<body class="layout_<?= LAYOUT ?>">
	<div id="main" class="wrapper">
		<div id="rightpane">

		</div>
		<span>Polls appear here, if one is active!</span>
</div>
</body>
</html>
