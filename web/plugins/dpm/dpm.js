
$(function() {
    var startTime = -1;

    function doDpm() {
        if (PLAYER.getTime) {
            PLAYER.getTime(function(time) {
				//only show DPM if we are not in an livestream
				if (time > -1) {
					$('.dpmCounter').text(' DPM: ' + (DRINKS / (time / 60)).toFixed(2));
				} else {
					$('.dpmCounter').text('');
				}
            });
        }
        else if (startTime > -1) {
            $('.dpmCounter').text(' DPM: ' + (DRINKS / ((new Date() - startTime) / 60000)).toFixed(2));
        }
        else {
            $('.dpmCounter').text('');
        }
    }

    socket.on('forceVideoChange', function(data) {
        if (Players.playerFromVideoType(data.video.videotype).getTime) {
            startTime = -1;
        }
        else {
            startTime = new Date().getTime();
        }
    });

    $('<style type="text/css"/>').text('.dpmCounter { font-size: 40px !important; visibility: visible !important; }').appendTo($('head'));
    $('<span/>').addClass('dpmCounter').appendTo($('#drinkWrap'));
    setInterval(doDpm, 1000);
});
