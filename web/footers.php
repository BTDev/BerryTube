<?php /* 
	Load non-render blocking content for components. We cannot make this properly async because we need it to load
	before the javascript modules, but because it won't be used until after the modules have been loaded, we don't
	want to block rendering.
*/ ?>

<link rel="stylesheet" href="<?= cdn('js/modules/player.css') ?>" />