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

*/

const NICK_BLACKLIST = new Set(
    ["act","active","admin","anon","berryemote","berryemote-wrapper-inner","berryemote-wrapper-outer","berrymotes_button","berrytweaks-dialog","berrytweaks-flag","berrytweaks-ircify-join","berrytweaks-ircify-part","berrytweaks-ircify-title","berrytweaks-localtime","berrytweaks-queue-playlist","btn","buttonlistcontainer","cb","chatbuffer","chatlistname","chevronbuttoncontainerdiv","chevrondiv","clear","colortag","controlbutton","controlbuttondiv","controlson","countdown-no-notes","countdown-note","countdown-start-time","countdown-time-diff","countdown-title","delete","drinkshown","dynarea","editbtn","elem","end","fa","fa-4x","fa-arrow-down","fa-arrow-up","fa-check-square-o","fa-cogs","fa-expand","fa-glass","fa-lg","fa-list-alt","fa-list-ul","fa-magic","fa-paint-brush","fa-times","fa-youtube-play","first","flair","flair_0","flair_5","floatinner","green","groupbuttonwrapper","hastoast","header","hidechatflair","hoverzoomlink","impele","import","layout_hd","log","loginas","mainbtns","me","message","misc","msg","mtclose","nick","note","option","optioncontainer","options","optionwrap","overview","playing","plshown","pollshown","ponypen_btns","preload","previouslyenabled","requeue","resize","scrollbar","settings","settingsbuttondiv","settingspane","settingstable","showsbchatter","showtimestamps","slidebtn","submit","tab","themebutton","themebuttoncontainerdiv","themebuttonwrapper","thumb","time","timestamp","title","toastshown","totallength","totalvideos","track","transparent","tweakbutt","tweaked","ui-helper-hidden-accessible","ui-sortable","ui-sortable-handle","user","vidshown","viewport","vjs-styles-defaults","wrapper"]
    .concat(
        ["admin","mod","moderator","berrytube","server"]
    )
);

module.exports = NICK_BLACKLIST;
