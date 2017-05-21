konami = new Konami()
konami.code = function() {
	(function (cfg) {BrowserPonies.setBaseUrl(cfg.baseurl);BrowserPonies.loadConfig(BrowserPoniesBaseConfig);BrowserPonies.loadConfig(cfg);})({"baseurl":"http://panzi.github.com/Browser-Ponies/","fadeDuration":500,"volume":1,"fps":25,"speed":3,"audioEnabled":false,"showFps":false,"showLoadProgress":true,"speakProbability":0.1,"spawn":{"Filly Princess Luna":3,"Nightmare Moon":3,"Princess Luna (Season 2)":3},"autostart":true});
}
konami.iphone.code = function() {
	return;
}
konami.load()