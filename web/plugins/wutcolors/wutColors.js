Object.defineProperty(Array.prototype, "wutUniquefyArray", {
  enumerable: false,
  writable: true,
  value: function(){
    var newarr = [];
    this.forEach(function(k){
      if(newarr.indexOf(k) < 0 && k!== "")
        newarr.push(k);
    });
    return newarr;
  }
});
var wutUserColorsAddr = "https://btc.berrytube.tv/wut/wutColors/usercolors.js"
  , wutUserColors = null
  , wutStyles = null
  , wutAddedStyles = []
  , wutStyleSheet = null
  , firstload = true
  , AtteNicksAddress = "https://atte.fi/berrytweaks/api/nicks.py" // thanks to Atte
  , AtteNicks = null
  ;

function wutInvertObject(a){
  var b = {};
  Object.keys(a).forEach(function(v){a[v].forEach(function(vv){b[vv]=v})});
  return b;
}

var wutHasDarkBG = false;
function wutRefreshLight(color){
  var regex = /(\w+)\((\d+),\s*(\d+\%?),\s*(\d+\%?)(?:,\s*([\d\.]+))?\)/;
  var values = regex.exec(color);

  var darkbg = false;
  switch(values[1]){
    case 'rgb':
    case 'rgba':
      if( ~~values[2]+~~values[3]+~~values[4] < (255*3)/2)
        darkbg = true;
      break;
    case 'hsl':
    case 'hsla':
      if( values[4] < 50)
        darkbg = true;
      break;
  }

  wutHasDarkBG = darkbg;
}

function wutLightenColor(color){
  var regex = /(\w+)\((\d+),\s*(\d+)\%?,\s*(\d+)\%?(?:,\s*(\d+))?\)/;
  var values = regex.exec(color);
  if(values[1] === 'hsla'){
    return values[1]+"("+values[2]+", "+values[3]+"%, "+(100-values[4])+"%, 1)";
  }
  return color;
}

function wutGetUsercolor(nick){
  var h,s,l,a,c;
  if( wutUserColors && !wutUserColors[nick] && AtteNicks && AtteNicks[nick] ){
    //console.log("wutColors: Found alternate nick for "+ nick +": "+AtteNicks[nick]);
    nick = AtteNicks[nick];
  }

  if( wutUserColors && wutUserColors[nick] && wutUserColors[nick].color ){
    c = wutUserColors[nick].color;
  }else{
    h = Math.abs(wutHashCode(nick))%360
      , s = Math.abs(wutHashCode(nick))%25 + 70
      , l = Math.abs(wutHashCode(nick))%15 + 35
      , a = 1
      , c = "hsla("+h+","+s+"%,"+l+"%,"+a+")"
      ;
  }
  return (wutHasDarkBG?wutLightenColor(c):c);
}

function wutProcessUsername(nick){
  if( wutAddedStyles.indexOf(nick) < 0 ){

    var c = wutGetUsercolor(nick);
    wutAddedStyles.push(nick);
    wutStyleSheet.insertRule(`.msgwrap[nick="${nick}"] { border-style: solid;  border-width: 0; border-left-width: 10px ; border-left-color : ${c} }`,0);
    wutStyleSheet.insertRule(`.msgwrap[nick="${nick}"] > .message { margin-left:5px;position:relative;z-index:2; }`,0);
    wutStyleSheet.insertRule(`.msgwrap[nick="${nick}"] > .message > .nick:not(.flaunt) { color: ${c}; }`,0);


    wutStyleSheet.insertRule("#rcvOverlay {z-index: 3; }",0);
    wutStyleSheet.insertRule(`.msgwrap[nick="${nick}"] > .message > .nick.flaunt {font-size: 15px;position:relative;z-index:2; }`,0);
    wutStyleSheet.insertRule(`.msgwrap[nick="${nick}"] > .message > .nick.flaunt:before {color:${c};transform: rotate(-20deg);position:absolute;top:-15px;left:-15px;content:'\\e900';font-family: 'wut-icons' !important;font-style: normal;font-weight: normal;font-variant: normal;text-transform: none;line-height: 1;font-size: 30px;z-index:-1; }`,0);
    wutStyleSheet.insertRule(`.msgwrap[nick="${nick}"] > .message > .nick.flaunt+.msg:after {content: '';position:absolute;top:0;left:-5%;width:110%;height:100%;z-index:-1;background:rgba(0,0,0,.2);}`,0);

    wutStyleSheet.insertRule(`#chatlist > ul > li[nick="${nick}"]  { border-style: solid;  border-left-width: 10px ; border-left-color : ${c}; margin-left: 0; padding-left: 5px }`,0);
    wutStyleSheet.insertRule(`.user[nick="${nick}"] > .chatlistname { color:${c};  }`,0);
    wutStyleSheet.insertRule(`.user.leader[nick="${nick}"] > .chatlistname { padding-left:24px;  }`,0);
  }
}

function wutReloadUserColors(){
  $.getScript(wutUserColorsAddr, function(){
    $.getJSON(AtteNicksAddress, function(data){
      AtteNicks = wutInvertObject(data);
    })
    .fail(function() {
      console.log("wutColors: Couldn't retrieve AtteNicks. Proceeding without.");
    })
    .always(function() {
      if(firstload){
        firstload = false;
        wutAddUser = function(data, _to){
          wutOldAddUser.apply(this, arguments);
          wutProcessUsername(data.nick);
        };
        wutOldAddUser = addUser;
        addUser = wutAddUser;
      }

      if(wutStyles !== null)
        wutStyles.remove();

      wutStyles = document.createElement("style");
      wutAddedStyles = [];

      wutStyles.appendChild(document.createTextNode(""));
      document.head.appendChild(wutStyles);

      wutStyleSheet = wutStyles.sheet;
      wutStyles.setAttribute('id', 'wutColorStyles');

      wutStyleSheet.insertRule("#chatControls { z-index: 3;} ",0);
      wutStyleSheet.insertRule("#chatlist > ul > li:not(.me) { border-bottom-width: 0; }",0);
      wutStyleSheet.insertRule("#chatlist > ul > li { border-right-width: 0; border-top-width: 0; }",0);
      wutStyleSheet.insertRule("#wutColorRefresh { border: 0; background-color: transparent;width: 24px;height: 24px;opacity: 0.5; }",0);
      wutStyleSheet.insertRule("#wutColorRefresh:hover { opacity: 1; }",0);
      wutStyleSheet.insertRule("#wutColorRefresh > img { width: 16px; height: 16px; }",0);

      var chatUsers = $('span.nick').text().split(':').concat(
        $('span.chatlistname').toArray().map(function(k){
          return $(k).text();
        })
      ).wutUniquefyArray();

      wutRefreshLight(getComputedStyle($('#chatbuffer')[0]).backgroundColor);
      chatUsers.forEach(wutProcessUsername);
    });
  });
}

function wutHashCode(str){
  var hash = 0;
  for (i = 0; i < str.length; i++) {
      char = str.charCodeAt(i);
      hash = char + (hash << 6) + (hash << 16) - hash;
  }
  return hash;
}

$(`<style>
  .message > .nick.flaunt:before{
  animation: .6s infinite normal step-end tip;
  }
@keyframes tip {
  0% {
    transform: rotate(-15deg);
  }

  49% {
    transform: rotate(-15deg);
  }
  50% {
    transform: rotate(-45deg);
  }

  99% {
    transform: rotate(-45deg);
  }
}
</style>`).appendTo('head')
$('<button id="wutColorRefresh" ><img src="https://i.imgur.com/WnDT4YG.png"></button>').appendTo($('#chatlist')).css({'position':'absolute','top':'0px','right':'0px'}).on('click', wutReloadUserColors);

wutReloadUserColors();
