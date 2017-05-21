<?php 

	$hits = 0;
	$hits = file_get_contents("./banhits.txt"); 
	$hits = $hits + 1; 
	file_put_contents ("./banhits.txt",$hits);

?><body style="background:black;"><center><img src="http://th07.deviantart.net/fs71/PRE/i/2012/317/0/8/pinkie_pie_banned_image_by_tehmage-d5kws7r.png" style="height:100%;"/></center></body>