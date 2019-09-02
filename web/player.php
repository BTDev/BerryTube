<?php
	require_once("config.php");
?>
<!doctype html>
<html lang="en">
	<head>
		<meta name="theme-color" content="#421C52" />
		<meta name="robots" content="noindex" />
		<script src="<?= cdn('js/modules/player/popout.js') ?>" type="module"></script>
		<script src="https://www.youtube.com/iframe_api" async></script>
		<link rel="stylesheet" href="<?= cdn('css/player.css') ?>" />
		<script>
			window.BT = {
				origin: "<?= ORIGIN ?>"
			};
		</script>
	</head>
	<body>
		<div id="root"></div>
	</body>
</html>