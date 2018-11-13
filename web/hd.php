<?php
	require_once("config.php");
	setcookie("LayoutType", "hd", time()+(60*60*24*30), "", "", true, false);

	$w = 853; $r = 9/16;
	$playerDims = Array(
		"w" => $w,
		"h" => ceil($w * $r)
	);
?>
<!doctype html>
<html lang="en">
<head>
	<?php require("headers.php"); ?>
	<link rel="stylesheet" type="text/css" href="<?= cdn('css/layout-hd.css') ?>" />
</head>
<body class="layout_hd">
	<div id="extras">
		<div class="elem first"><a href="about.php" target="_blank">About</a></div>
	</div>
	<div id="banner"></div>

	<!-- HEADER COUNTDOWN -->
	<div id="countdown-error"></div>
    <table id="countdown-timers">
        <tbody></tbody>
        <tfoot>
            <tr>
                <td><a href="https://teamup.com/ksiyi7xykfdvgyocp3" target="_blank" rel="noopener noreferrer">full schedule</a></td>
            </tr>
        </tfoot>
    </table>

	<?php
		if(isset($_SESSION['error']))
		{
			print '<div id="errors" class="wrapper"><ul class="error">';
			foreach($_SESSION['error'] as $e)
			{
				print '<li>'.$e.'</li>';
			}
			print '</ul></div>';
			unset($_SESSION['error']);
		}
	?>
	<div class="wrapper">
		<div id="headbar">
		</div>
	</div>
	<div id="videobg">
		<div id="videowrap">
			<div id="ytapiplayer">
				Loading&hellip;
			</div>
		</div>
	</div>
	<div id="main" class="wrapper">
		<div id="rightpane">

		</div>
		<div id="leftpane">

		</div>
		<div class="clear"></div>
	</div>
	<div class="wrapper">
		<center>
			<b>Theme</b><br>
			<span><a style="color:white" href="?LayoutType=hd">HD</a></span> |
			<span><a style="color:white" href="?LayoutType=compact">Regular</a></span> |
			<span><a style="color:white" id="kiosk" href="#">Kiosk Mode</a></span>
			<script>
				$("#kiosk").click(function(){
					(function(){
					  var css = '#rightpane,#videobg{top:0!important;position:fixed!important}#chatbuffer,#rightpane,#videobg{top:0!important}#chatbuffer,#chatpane{height:100%!important;overflow:hidden!important}#chatbuffer,#chatpane,#rightpane,#videobg,#videowrap,#videowrap iframe{height:100%!important}#videobg{width:80%!important;background:#000!important}#rightpane{right:0!important;width:20%!important}#chatbuffer{width:100%!important}#chatpane{width:auto!important}#videowrap{width:100%!important}#connectedCountWrapper{width:100%!important;background:#fff!important}#videowrap iframe{width:100%!important}#rcvOverlay{border:0!important}#chatControls,#chatinput,#chatlist,#leftpane,.setNick{display:none!important}';
					  $("<style/>").html(css).appendTo(document.body);
					})();
				});
			</script>
		</center>
	</div>
</body>
</html>
