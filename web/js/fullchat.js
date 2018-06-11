(function() {
    $("head").append('<link rel="stylesheet" type="text/css" href="' + ORIGIN + '/css/fullchat.css" />');
    
    var pollpane = $('#pollpane');
    $('#pollControl').appendTo(pollpane);
    var pollClose = $('<div class="close"></div>');
    pollpane.prepend(pollClose);
    pollClose.click(function () {
        pollpane.hide();
    });
    
    var showPollpane = function () {
        pollpane.show();
    };
    
    whenExists('#chatControls', function () {
        var menu = $('<div/>').addClass('settings').appendTo($('#chatControls')).text("Poll");
        menu.css('margin-right', '2px');
        menu.css('background', 'none');
        menu.click(function () {
            showPollpane();
        });
    });
    
    var playlist = $('#leftpane');
    var playlistClose = $('<div class="close"></div>');
    playlist.prepend(playlistClose);
    playlistClose.click(function () {
        playlist.hide();
    });
    
    whenExists('#chatControls', function () {
        var menu = $('<div/>').addClass('settings').appendTo($('#chatControls')).text("Playlist");
        menu.css('margin-right', '2px');
        menu.css('background', 'none');
        menu.click(function () {
            playlist.show();
            smartRefreshScrollbar();
            realignPosHelper();
            if (getCookie("plFolAcVid") == "1") {
                var x = ACTIVE.domobj.index();
                x -= 2;
                if (x < 0) x = 0;
                scrollToPlEntry(x);
            }
        });
    });
    
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        $("head").append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>');
    }
    whenExists('#chatControls', function () {
        if (NAME) {
            $('#headbar').hide();
        }
    });
    
    setTimeout(function() {
            $('#videobg').remove();
            $('#videowrap').remove();
            $('#main').css('height', '100%');
    }, 100);
})();
