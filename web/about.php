<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>BerryTube :: This is why I drink!</title>
	<meta name="description" content="BerryTube :: This is why I drink!">
	<meta name="author" content="Cades / GreyMage / Eric Cutler">
	<meta name="robots" content="noindex">
	<script src="js/jquery-1.8.0.min.js"></script>
	<script src="js/jquery-ui-1.8.23.custom.min.js"></script>
	<link rel="stylesheet" type="text/css" href="css/colors.css" />
	<link rel="stylesheet" type="text/css" href="css/layout-other.css" />
	<link rel="stylesheet" type="text/css" href="css/uni-gui.css" />
</head>
<body>
	<div id="banner"></div>
	<div class="wrapper fifty">
		<p>Hey there!</p>
		<p>The name is Eric. I go by Cades around here. I'm a web developer living in Atlanta, GA, currently working for <a href="http://purewebdevelopment.com/">Pure Web Development<a/>, and I made BerryTube!</p>
		<p>In early July of 2012 I started hanging out on MyLittleAlcoholic, a Reddit community centered on booze and ponies. I wasn't terribly active as a member until I discovered the drinking games. Even then, It took until mid-August before I started attending regularly, and heard that the community was growing larger than the existing host was going to be able to support. The 1-year anniversary games would probably hit the user cap of 100 connections, and cause problems with people being denied a slot to play!</p>
		<p>One particularly boring day I decided to try my hand at making a custom solution. I discussed the idea with the existing moderators and admins, and got a blessing to give it a real shot. After about an hour of digging through the existing host's client side code I had a decently good idea of how they created the site, but it was using a technology I hadn't previously used, professionally or otherwise, websockets.</p>
		<p>I won't go into extreme detail, but If normal webpages are billboards, a webpage using websockets is closer to human interaction. The possibilities are extreme compared to normal LAMP stack work. This excitement of working with a whole new and unexplored tech and the very real possibility of creating something a few people might enjoy drove me to continue working on BerryTube instead of getting bored in a few days and giving up.</p>
		<p>Within about a week I had an extremely rough and ugly prototype, and invited the administrators to see it. The reaction was incredible. I had not received such praise for charity work before. Over the next few weeks I made improvements and even attempted to let people stay in the room and chat -- the site was getting more stable every day. About two weeks before the anniversary games, I spoke with the administrators, and they agreed to try that weekend's pre-game on BerryTube. I was extremely excited, but equally nervous.</p>
		<p>The pregame went better than expected, and if I recall, the server didn't even crash once for the duration! But I might as well have been breathing into a paper bag the entire time, scanning logfiles, watching server load... I had never tested over 8 simultaneous connections, and here I was with over 60! The idea of running the real game (scheduled to occur about 1-2 hours after the pregame ended) on BerryTube was brought up, and the general opinion was, "Sure! Why not?"</p>
		<p>About an hour into the main game, something about how the Polls were working went wrong, and crashed the entire BerryTube server program. <em>I panicked.</em> I sprinted across my apartment, while <span title="technical term.">shit-hammered</span> drunk, and arrived at my development PC, to a screen full of IRC highlights all asking me if everything was okay. I vaguely recall telling everyone, "I'm fucking fixing it, omg so drunk", and in a moment of drunken lucidity, I noted the spot the error had occurred, added a quick bit of code to act as a failsafe (Not fixing the problem mind you, just adding instructions on how to gracefully fail) and restarted the program.</p>
		<p>Within a few minutes people began reconnecting, and filtering back in from the fallback room the admins had wisely setup beforehand. The attitude was almost entirely positive, more cheering for it being back online than cursing the fact that it broke. That right there? That made me smile.</p>
		<p>Since then, I've been making updates and changes to make the whole site and experience all the better. I'm going to release an Open-Source version of the Server and Client code one of these days soon, when I feel the code is no longer experimental in any spots.</p>
		<?php //Secretly this bit only appears if you have a nick set in localStorage. ?>
		<div id="t"></div>
		<script>
			var _0x5d06=["\x6E\x69\x63\x6B","\x75\x6E\x64\x65\x66\x69\x6E\x65\x64","\x23\x74","\x69\x6E\x73\x65\x72\x74\x41\x66\x74\x65\x72","\x3C\x70\x3E\x41\x6C\x74\x68\x6F\x75\x67\x68\x20\x49\x20\x61\x6D\x20\x65\x6D\x70\x6C\x6F\x79\x65\x64\x2C\x20\x66\x6F\x72\x20\x72\x65\x61\x73\x6F\x6E\x73\x20\x49\x27\x64\x20\x72\x61\x74\x68\x65\x72\x20\x6E\x6F\x74\x20\x64\x69\x73\x63\x75\x73\x73\x20\x70\x75\x62\x6C\x69\x63\x6C\x79\x20\x49\x20\x64\x6F\x20\x6E\x6F\x74\x20\x6D\x61\x6B\x65\x20\x76\x65\x72\x79\x20\x6D\x75\x63\x68\x20\x6D\x6F\x6E\x65\x79\x2E\x20\x49\x66\x20\x79\x6F\x75\x27\x76\x65\x20\x65\x6E\x6A\x6F\x79\x65\x64\x20\x42\x65\x72\x72\x79\x54\x75\x62\x65\x2C\x20\x49\x20\x77\x6F\x75\x6C\x64\x20\x6C\x69\x6B\x65\x20\x74\x6F\x20\x68\x75\x6D\x62\x6C\x79\x20\x61\x73\x6B\x20\x74\x68\x61\x74\x20\x79\x6F\x75\x20\x63\x6F\x6E\x73\x69\x64\x65\x72\x20\x6D\x61\x6B\x69\x6E\x67\x20\x61\x20\x3C\x61\x20\x68\x72\x65\x66\x3D\x22\x64\x6F\x6E\x61\x74\x65\x2E\x70\x68\x70\x22\x3E\x64\x6F\x6E\x61\x74\x69\x6F\x6E\x3C\x2F\x61\x3E\x2E\x20\x49\x20\x6C\x6F\x76\x65\x20\x77\x6F\x72\x6B\x69\x6E\x67\x20\x6F\x6E\x20\x42\x65\x72\x72\x79\x54\x75\x62\x65\x2C\x20\x61\x6E\x64\x20\x49\x20\x6C\x6F\x76\x65\x20\x74\x68\x65\x20\x63\x6F\x6D\x6D\x75\x6E\x69\x74\x79\x20\x49\x74\x27\x73\x20\x63\x72\x65\x61\x74\x65\x64\x2C\x20\x41\x6E\x64\x20\x65\x76\x65\x6E\x20\x61\x20\x73\x6D\x61\x6C\x6C\x20\x3C\x61\x20\x68\x72\x65\x66\x3D\x22\x64\x6F\x6E\x61\x74\x65\x2E\x70\x68\x70\x22\x3E\x64\x6F\x6E\x61\x74\x69\x6F\x6E\x3C\x2F\x61\x3E\x20\x62\x61\x63\x6B\x20\x77\x6F\x75\x6C\x64\x20\x6D\x65\x61\x6E\x20\x6D\x6F\x72\x65\x20\x74\x6F\x20\x6D\x65\x20\x74\x68\x61\x6E\x20\x79\x6F\x75\x20\x6D\x61\x79\x20\x72\x65\x61\x6C\x69\x7A\x65\x2E\x20\x49\x6E\x20\x74\x68\x69\x73\x20\x63\x61\x73\x65\x2C\x20\x65\x76\x65\x72\x79\x20\x6C\x69\x74\x74\x6C\x65\x20\x62\x69\x74\x20\x72\x65\x61\x6C\x6C\x79\x20\x64\x6F\x65\x73\x20\x63\x6F\x75\x6E\x74\x2E\x3C\x2F\x70\x3E"];if( typeof localStorage[_0x5d06[0]]!=_0x5d06[1]){$(_0x5d06[4])[_0x5d06[3]]($(_0x5d06[2]));} ;
		</script>
		<p>I sincerely hope everyone here has a wonderful time on BerryTube. You are all the reason I did this! &lt;3</p>
		<p></p>
		<p>-- Eric</p>
	</div>
</body>
</html>  