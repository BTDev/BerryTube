//Oh hey, a change log or something
//2014-03-?? Initial version
//2014-07-14 Fixed Squees from ignored users
//           Attempting fix for enabled notification(and possibly backlog/history notifications)
//           showing during preload(chrome) and thumbnail generation(firefox).
function tryEnable(){
    if (!Notification){
        window.alert("Sorry, your browser does not support HTML5 notifications");
        localStorage.scriptNodeDesktopSqueesEnabled = "false";
        return;
    }
    Notification.requestPermission(function (status) {
        if (Notification.permission !== status) {
            Notification.permission = status;
        }
    });
    //the permission prompt on chrome will only show if initiated by an onclick or similar.
    setTimeout(function(){
        if (Notification && Notification.permission !== "granted") {
            var confirm = $('body').dialogWindow({
                title:'Enable Desktop Squees',
                center:true
            });
            $('<span>Some browsers will only prompt for enabling '+
              'notifications if the prompting is initiated by a user\'s click.'+
              '<br>So click this:</span><br>').appendTo(confirm);
            $('<div id="enableDS">Click here to get prompted to Enable '+
              'Notifications</div>').addClass('button').appendTo(confirm);
            $('<br><span>If that doesn\'t work, either your browser doesn\'t '+
              'support desktop notifications, or you need to try ' +
              '<a href="plugins/desktopSquees/enableOnChrome.png" target="_blank">this</a>.</span>').appendTo(confirm);
            confirm.css({'max-width':'270px','text-align':'center'});
            confirm.window.center();
            document.getElementById("enableDS").onclick = function(){
                Notification.requestPermission(function (status) {
                    if (Notification.permission !== status) {
                        Notification.permission = status;
                    }
                });
                //give them time to respond
                setTimeout(function(){
                    if(Notification.permission == "granted")
                        desktopSquee("Desktop Squees Enabled!");
                },5000);
                confirm.window.close();
            };
        }
    },5000);
}
tryEnable(); //originally this was called in different locations, hence it being a function. \\bpshrug
function desktopSquee(str){
    if (Notification) {
        //This SHOULD stop notifications from showing during preloading(chrome) and thumbnail generation(firefox)
        //hopefully not at the expense of intended functionality
        if (window.outerWidth < window.innerWidth && window.outerHeight < window.innerHeight && window.outerHeight<150 && window.outerWidth<150)
            return;
        var n = new Notification(str,{'icon':"images/bpcm.png"});
        //replace this URL with full path to bpcm.png
        n.onshow = function () {
            setTimeout(function(){n.close()}, 7000);//chrome wasn't happy with n.close being called directly
        }
    } else if (!Notification){
        window.alert("Sorry, your browser does not support HTML5 notifications. =[");
        localStorage.scriptNodeDesktopSqueesEnabled = false;
    }
}
if(Notification.permission === "granted") desktopSquee("Desktop Squees Enabled!");
/*var dsOldaddNewMailMessage = addNewMailMessage;
var addNewMailMessage = function(nick, msg){
    if (!WINDOW_FOCUS) {
        desktopSquee(nick + ": " + $(msg).text())
    }
    dsOldaddNewMailMessage(nick, msg);
};*/
/*hooking it into addChatMsg, so I can get the original [](/emote) text, for readability purposes...Though this monkey patch
will have to hit after berrymotes, or there will be issues...this is why I wouldn't mind a hook+priority
system. Wouldn't have to repeat squee detection either. */
var dsPunchChat = function(){
    var dsOldaddChatMsg = addChatMsg;
    addChatMsg = function(data,_to){
        //totally borrowed some of this
        var nick = data.msg.nick;
        var msgText = data.msg.msg;
        var isGhost = data.ghost;
        if(nick != NAME && NAME.length > 0 && detectName(NAME, msgText) &&
          !(IGNORELIST.indexOf(nick) != -1 || (IGNORE_GHOST_MESSAGES && isGhost) || WINDOW_FOCUS) ){
            desktopSquee(nick + ": " + $("<div/>").html(msgText).text());//this ensure it treats it as html and not a selector
        }
        dsOldaddChatMsg(data,_to);
    };
}
//this may technically not be necessary, if the scripts are loaded in the order they appear
//and berrymotes remains at the top, but I'd rather be safe than sorry.
if(localStorage.scriptNodeBerrymotesEnabled == "true"){
    var bemwait = setInterval(function(){
        if(typeof Bem !== "undefined"){
            dsPunchChat();
            clearInterval(bemwait);
        }
    },3000);
} else {
    dsPunchChat();
}
