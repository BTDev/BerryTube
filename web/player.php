<?php
	require_once("config.php");
?>
<!doctype html>
<html lang="en">
	<head>
		<meta name="theme-color" content="#421C52" />
		<meta name="robots" content="noindex" />
		<script src="<?= cdn('js/modules/main.player.js') ?>" type="module"></script>
		<script src="https://www.youtube.com/iframe_api" async></script>
		<link rel="stylesheet" href="<?= cdn('js/modules/player/component.css') ?>" />
		<style>
			html, body {
				margin: 0;
				padding: 0;
				height: 100%;
			}
			
			#root {
				width: 100%;
				height: 100%;
			}
		</style>
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