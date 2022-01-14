// Namespacing
new function(){

    var ns = this;

    ns.lsname = "cades.videoblacklist";
    ns.embedname = "cades.videoblacklistembed";

    ns.getStub = function(vidObj){
        if(vidObj && vidObj.videoid && vidObj.videotype) return {
            videoid:vidObj.videoid,
            videotype:vidObj.videotype
        }

        return {};
    }

    ns.scan = function(){
        // Scan playlist
        var elem = PLAYLIST.first;
        do{
            if(!ns.isOk(ns.getStub(elem))){
                $(elem.domobj).addClass("blacklisted");
            } else {
                $(elem.domobj).removeClass("blacklisted");
            }
            elem = elem.next;
        }while(elem != PLAYLIST.first)
    }

    ns.uid = function(digits){
        var x = Math.floor(Math.random() * 36).toString(36);
        if(digits > 1) return x + ns.uid(digits-1);
        return x;
    }

    ns.load = function(){
        // Load Blacklist
        try{
            ns.videoBlacklist = JSON.parse(localStorage.getItem(ns.lsname));
            if(!ns.videoBlacklist) throw "Bad Cache";
        } catch(e){
            ns.videoBlacklist = [];
        }
        ns.scan();

        // Load Embed
        try{
            ns.embed = JSON.parse(localStorage.getItem(ns.embedname));
            if(!ns.embed) throw "Bad Cache";
        } catch(e){
            ns.embed = '<div class="blacklistmessage">[ You have Blacklisted this Video ]</div>';
        }
    }

    ns.waitForIo = function(callback){
        if(window.io){
            callback();
        } else {
            setTimeout(function(){
                ns.waitForIo(callback);
            },100);
        }
    }

    ns.save = function(){

        // Clear Dupes
        var hashtable = {};
        var finalsave = [];
        for(var i in ns.videoBlacklist){
            if(!ns.videoBlacklist[i]) continue;
            var k = JSON.stringify(ns.videoBlacklist[i]);
            hashtable[k] = ns.videoBlacklist[i];
        }
        for(var i in hashtable){
            finalsave.push(hashtable[i]);
        }

        // Save Blacklist
        localStorage.setItem(ns.lsname,JSON.stringify(finalsave));
        // Save Embed
        localStorage.setItem(ns.embedname,ns.embed);
    }

    ns.isOk = function(vidObj){
        for(var i in ns.videoBlacklist){
            if(!ns.videoBlacklist[i]) continue;
            var a = JSON.stringify(ns.videoBlacklist[i]);
            var b = JSON.stringify(ns.getStub(vidObj));
            if(a == b) return false;
        }
        return true;
    }

    ns.blacklistVideo = function(vidObj){
        ns.videoBlacklist.push(vidObj);
        ns.save();
    }

    ns.unBlacklistVideo = function(vidObj){
        for(var i in ns.videoBlacklist){
            if(!ns.videoBlacklist[i]) continue;
            var a = JSON.stringify(ns.videoBlacklist[i]);
            var b = JSON.stringify(ns.getStub(vidObj));
            if(a == b) ns.videoBlacklist.splice(i,1);
        }
        ns.save();
    }

    ns.videoLoadAtTime = function(vidObj, time){
        //console.log("Private videoLoadAtTime",vidObj);

        if(!ns.isOk(vidObj)){
            var clone = $.extend({},vidObj);
            clone.videotype = "blacklist";
            //console.log("This video is blacklisted");
            ns.tcCurrentLength = clone.videolength;
            ns._videoLoadAtTime(clone, time);
            return;
        }

        ns._videoLoadAtTime(vidObj, time);
    }

    ns.addVideo = function addVideo(data, queue, sanityid){
        ns._addVideo(data, queue, sanityid);
        ns.scan();
        // TODO: find a more elegant way to do this. The add function is pretty
        // self-contained, so aside from a rewrite this might be the only good solution.
    }

    ns.addVideoControls = function(entry,optionList){
        ns._addVideoControls(entry,optionList);

        var stub = ns.getStub($(entry).data("plobject"));

        // Blacklist Button
        if(ns.isOk(stub)){
            var blackBtn = $("<div/>").addClass("button").appendTo($("<li/>").appendTo(optionList));
            $("<span/>").text("Blacklist Video").appendTo(blackBtn);
            blackBtn.click(function(){
                $(entry).addClass("blacklisted");
                ns.blacklistVideo(stub);
                if(window.ACTIVE == $(entry).data("plobject")) socket.emit("refreshMyVideo");
            });
        } else {
            var whiteBtn = $("<div/>").addClass("button").appendTo($("<li/>").appendTo(optionList));
            $("<span/>").text("Pardon Video").appendTo(whiteBtn);
            whiteBtn.click(function(){
                $(entry).removeClass("blacklisted");
                ns.unBlacklistVideo(stub);
                if(window.ACTIVE == $(entry).data("plobject")) socket.emit("refreshMyVideo");
            });
        }
    }

    ns.installCSS = function(){
        var styles = [
            ' @font-face { font-family: "RemoteCR"; src: url("' + CDN_ORIGIN + '/plugins/videoBlacklist/CelestiaMediumRedux1.55.ttf");',
            ' .blacklisted * { text-decoration: line-through;   font-style: italic; }',
            ' .blacklistmessage { text-shadow: 0 0 10px black; font-family: "Celestia Redux", "RemoteCR", "Arial"; bottom: 0; display: block; font-size: 2.2em; height: 70px; left: 0; line-height: 70px; margin: auto; position: absolute; right: 0; text-align: center; top: 0; width: 580px;}',
            ' .blacklistwrap { background-color: black; background-position: center center; background-repeat: no-repeat; background-size: auto 70%; background-image: url("' + CDN_ORIGIN + '/plugins/videoBlacklist/bp_cutiemark.svg"); height: 100%; width: 100%; } ',
            ' .blacklistprogress { background-color: red; bottom: 0; height: 10px; left: 0; position: absolute; } ',
            ' .bl_optwrap { float: left; width: 50%; }',
            ' .bl_optwrap button { width: 90%; display: block; height: 40px; margin: 0px auto 10px; }'
        ];
        //TODO: This could be one style element, perhaps refactor in case of style growth.
        for(var i in styles){
            $("<style/>").html(styles[i]).appendTo("head");
        }
    }

    //Timekeeping
    ns.tcCurrentLength = 0;
    ns.tcCurrentTime = 0;
    ns.tcLastSeek = new Date().getTime(); // ms of last sync

    ns.installBlackListType = function(){
        var wrap = $("<div/>").addClass("blacklistwrap");
        var progress = $("<div/>").addClass("blacklistprogress");
        Players.register('blacklist', {
            playVideo: function (id, at) {},
            loadPlayer: function (id, at, volume) {
                $('#ytapiplayer').empty();

                ns.tcLastSeek = new Date().getTime();
                ns.tcCurrentTime = at;
                wrap.appendTo($("#ytapiplayer"));
                progress.appendTo($("#ytapiplayer"));
                wrap.html(ns.embed);
            },
            onPlayerStateChange: function (event) {},
            pause: function () {},
            play: function () {},
            getVideoState: function () {},
            seek: function (pos) {
                ns.tcLastSeek = new Date().getTime();
                ns.tcCurrentTime = pos;
            },
            getTime: function (callback) {
                var x = ((new Date().getTime() - ns.tcLastSeek) / 1000) + ns.tcCurrentTime;
                var perc = x / ns.tcCurrentLength;
                progress.css({
                    width: (perc * 100)+"%"
                });
                callback(x);
            },
            destroy: function() {
				$('#ytapiplayer').empty();
			},
            resetRetries: function() {}
        });
    }

    ns.init = function(){
        /// Punch Ducks
        //Load Video
        ns._videoLoadAtTime = window.videoLoadAtTime;
        window.videoLoadAtTime = ns.videoLoadAtTime;
        //Controls
        ns._addVideoControls = window.addVideoControls;
        window.addVideoControls = ns.addVideoControls;
        //addVideo
        ns._addVideo = window.addVideo;
        window.addVideo = ns.addVideo;

        /// Install components
        // Load Blacklist
        ns.load();

        // Install CSS
        ns.installCSS();

        // Install Blacklist "video type"
        ns.installBlackListType();
    }

    ns.waitReady = function(){
        waitForFlag("PLREADY",function(){
            ns.init();
        });
    }

    ns.waitReady();

}
