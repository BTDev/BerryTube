<!doctype html>
<html lang="en">
<head>
	<?php require("headers.php"); ?>
	<link rel="stylesheet" type="text/css" href="<?= cdn('css/layout-' . LAYOUT . '.css') ?>" />
</head>
<body class="layout_<?= LAYOUT ?>">
	<div id="extras">
		<div class="elem first"><a href="about.php" target="_blank">About</a></div>
	</div>
	<div id="banner"></div>

	<!-- HEADER COUNTDOWN -->
	<div id="countdown-error"></div>
    <table id="countdown-timers">
        <tbody id="countdown-body"></tbody>
        <tfoot>
            <tr>
                <td><a href="https://teamup.com/ksiyi7xykfdvgyocp3" target="_blank" rel="noopener noreferrer">full schedule</a></td>
            </tr>
        </tfoot>
    </table>

	<div class="wrapper">
		<div id="headbar">
		</div>
	</div>
	<?php if (LAYOUT === 'hd') { ?>
		<div id="videobg">
			<div id="videowrap">
				<div id="ytapiplayer">
					Loading&hellip;
				</div>
			</div>
		</div>
	<?php } ?>
	<div id="main" class="wrapper">
		<div id="rightpane">

		</div>
		<div id="leftpane">
			<?php if (LAYOUT === 'compact') { ?>
				<div id="videowrap">
					<div id="ytapiplayer">
						Loading&hellip;
					</div>
				</div>
			<?php } ?>
		</div>
		<div class="clear"></div>
	</div>
	<div class="wrapper">
		<center>
			<b>Theme</b><br>
			<span><a style="color:white" href="?LayoutType=hd">HD</a></span>
			|
			<span><a style="color:white" href="?LayoutType=compact">Regular</a></span>
			<?php if (LAYOUT == 'hd') { ?>
				|
				<span><a style="color:white" id="kiosk" href="#">Kiosk Mode</a></span>
				<script>
					$("#kiosk").click(function(){
						(function(){
						var css = '#rightpane,#videobg{top:0!important;position:fixed!important}#chatbuffer,#rightpane,#videobg{top:0!important}#chatbuffer,#chatpane{height:100%!important;overflow:hidden!important}#chatbuffer,#chatpane,#rightpane,#videobg,#videowrap,#videowrap iframe{height:100%!important}#videobg{width:80%!important;background:#000!important}#rightpane{right:0!important;width:20%!important}#chatbuffer{width:100%!important}#chatpane{width:auto!important}#videowrap{width:100%!important}#connectedCountWrapper{width:100%!important;background:#fff!important}#videowrap iframe{width:100%!important}#rcvOverlay{border:0!important}#chatControls,#chatinput,#chatlist,#leftpane,.setNick{display:none!important}';
						$("<style/>").html(css).appendTo(document.body);
						})();
					});
				</script>
			<?php } ?>
			<?php
				if (date('n') == 6) {
					if ($_COOKIE['no-pride'] !== 'true') {
						$prideCookie = 'no-pride=true; expires=Thu, 01 Jan 2970 00:00:00 GMT';
						$prideText = 'Disable pride month theme';
					} else {
						$prideCookie = 'no-pride=false; expires=Thu, 01 Jan 1970 00:00:00 GMT';
						$prideText = 'Enable pride month theme';
					}
					?>
					<br>
					<a style="color:white" href="#" onclick="document.cookie='<?= $prideCookie ?>; Secure'; location.reload()"><?= $prideText ?></a>
					<?php
				}
			?>
		</center>
	</div>
</body>
</html>
