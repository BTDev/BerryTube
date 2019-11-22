<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>BerryTube :: This is why I drink!</title>
	<meta name="description" content="BerryTube :: This is why I drink!">
	<meta name="author" content="Cades / GreyMage / Eric Cutler">
	<meta name="robots" content="noindex">
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
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
		<p>I sincerely hope everyone here has a wonderful time on BerryTube. You are all the reason I did this! &lt;3</p>
		<p></p>
		<p>-- Eric</p>
	</div>
</body>
</html>
