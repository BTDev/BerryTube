/*

To generate CSS class based list, run on BT:

JSON.stringify(
    Array.from(
        new Set(
            Array.from(document.querySelectorAll('*'))
                .flatMap(el => Array.from(el.classList))
        )
    )
    .filter(cl => !cl.startsWith('msg-') && !(cl in CHATLIST))
    .map(cl => cl.toLowerCase())
    .sort()
)

On the server can also do something like:

egrep -R --only-matching --no-filename '\.[a-zA-Z0-9]+' web/css/*.css berrymotes/css/*.css | sort | uniq | sed 's/^\.//' | tr '[A-Z]' '[a-z]' | jq -cRs '. / "\n"'

*/

const NICK_BLACKLIST = new Set(
    ["act","active","admin","anon","berryemote","berryemote-wrapper-inner","berryemote-wrapper-outer","berrymotes_button","berrytweaks-dialog","berrytweaks-flag","berrytweaks-ircify-join","berrytweaks-ircify-part","berrytweaks-ircify-title","berrytweaks-localtime","berrytweaks-queue-playlist","btn","buttonlistcontainer","cb","chatbuffer","chatlistname","chevronbuttoncontainerdiv","chevrondiv","clear","colortag","controlbutton","controlbuttondiv","controlson","countdown-no-notes","countdown-note","countdown-start-time","countdown-time-diff","countdown-title","delete","drinkshown","dynarea","editbtn","elem","end","fa","fa-4x","fa-arrow-down","fa-arrow-up","fa-check-square-o","fa-cogs","fa-expand","fa-glass","fa-lg","fa-list-alt","fa-list-ul","fa-magic","fa-paint-brush","fa-times","fa-youtube-play","first","flair","flair_0","flair_5","floatinner","green","groupbuttonwrapper","hastoast","header","hidechatflair","hoverzoomlink","impele","import","layout_hd","log","loginas","mainbtns","me","message","misc","msg","mtclose","nick","note","option","optioncontainer","options","optionwrap","overview","playing","plshown","pollshown","ponypen_btns","preload","previouslyenabled","requeue","resize","scrollbar","settings","settingsbuttondiv","settingspane","settingstable","showsbchatter","showtimestamps","slidebtn","submit","tab","themebutton","themebuttoncontainerdiv","themebuttonwrapper","thumb","time","timestamp","title","toastshown","totallength","totalvideos","track","transparent","tweakbutt","tweaked","ui-helper-hidden-accessible","ui-sortable","ui-sortable-handle","user","vidshown","viewport","vjs-styles-defaults","wrapper"]
    .concat(
        ["0","05em","075","08929em","1","12","14","165","1em","2","3","3em","4","4em","5","5em","6","7","75","7em","8","82","95em","act","active","ad","admin","anon","assistant","banzone","bem","berry","berryemote","berrymotes","btn","button","ca","cb","center","chatbuffer","chatlistname","clear","close","code","colorgrid","colortag","confirm","content","controlson","countdown","createdat","date","dd","delete","dialogcontent","dialogtitlebar","dialogtoolbar","dialogwindow","disable","disabled","drink","drinkflair","drinkwrap","elem","end","expanded","fifty","filtered","flair","flaunt","flutter","gif","gilded","graymute","green","half","hidden","hidechatflair","highlight","history","ignored","img","impele","import","is","jpg","kicked","kill","leader","level","loading","log","loginas","mainbtns","me","message","misc","mod","msg","multi","name","new","newmsg","nick","nickwrap","noads","nobody","note","notify","obscure","optionlist","options","optionwrap","overview","pluginauthors","plugindesc","pluginenable","pluginexists","pluginnode","plugintitle","png","poll","pollnote","ranked","rcv","reconnecting","request","requeue","right","rmtimer","rotation","row","rulezone","sbanned","scrollabledialog","scrollbar","search","searching","server","setnick","settings","setvolatile","shitpost","show","showsbchatter","showtimestamps","slidebtn","small","spoiler","squee","submit","swatch","sweetiebot","tab","thumb","time","timestamp","tiny","title","titlebar","totallength","totalvideos","track","tweaked","unban","viewport","volatile","voted","warntext","wide","wrapper"]
    )
    .concat(
        ["admin","mod","moderator","berrytube","server"]
    ).map(
        s => s.toLowerCase()
    )
);

// false positives
NICK_BLACKLIST.delete("tab");

module.exports = NICK_BLACKLIST;
