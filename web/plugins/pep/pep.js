//PEP Playlist Enhancment Plugin
//Author:  Malsententia
//Desc.:   Provides playlist item alerts and estimated play times
var PEP = {};
PEP.rootDir = 'plugins/pep/';
//if loading from bookmarklet, get the css
if(localStorage.scriptNodePEPEnabled !== "true"){
  $('<link/>', {rel: 'stylesheet', href: PEP.rootDir+'multipleselectbox.css?'}).appendTo('head');
  $('<link/>', {rel: 'stylesheet', href: PEP.rootDir+'pep.css?'+Math.random()}).appendTo('head');
}

$.getScript('https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.1/clipboard.min.js');
$.getScript(PEP.rootDir+'jquery.multipleselectbox-min.js');

PEP.unknown = '??:??';//displayed when times are incalculable due to an item of indeterminate length
PEP.JAM = new Audio(PEP.rootDir+'JAM.wav');
PEP.set = false;
PEP.pauseCalcs = true; //internal pause for reducing recalcs
PEP.timeout = null;
if(localStorage.PEPsound === undefined){
  localStorage.PEPsound = "true";
}
if(localStorage.PEPds === undefined){
  localStorage.PEPds = "true";
}
if(localStorage.PEPflash === undefined){
  localStorage.PEPflash = "false";
}
if(localStorage.PEPpause === undefined){
  localStorage.PEPpause = "false";
}
if(localStorage.PEPmilTime === undefined){
  localStorage.PEPmilTime = "false";
}
PEP.sound = (localStorage.PEPsound === "true");
PEP.ds = (localStorage.PEPds === "true");
PEP.flash = (localStorage.PEPflash === "true");
PEP.milTime = (localStorage.PEPmilTime === "true");

PEP.getStorage = function(){
  if(localStorage.PEP === undefined){
    localStorage.PEP = "{}";
  }
  return JSON.parse(localStorage.PEP);
};
PEP.setStorage = function (i){
  localStorage.PEP = JSON.stringify(i);
};

PEP.alarms = PEP.getStorage();
//the toArray is broken in BT's code, so here's a new one.
LinkedList.Circular.prototype.PEPtoArr = function(start){
  var elem = (start!==undefined)?start:this.first;
  var out = [];
  var i;
  for(i = 0;i<this.length;i++)
  {
    out.push(elem);
    elem = elem.next;
  }
  return out;
};

PEP.try = function(delay){
  if(delay === undefined)
    delay = 9000;
  if(!PEP.set){
    return;
  }
  if(PEP.timeout!==null)
    clearTimeout(PEP.timeout);
//  $('#toggleTimes').addClass('loading');
  PEP.timeout = setTimeout(function(){
    PEP.calcEstTimes();
    PEP.timeout = null;
  },delay);
};

PEP.fixActive = function(t,now){
  if(typeof now === "undefined")
    now = Date.now();
  if(ACTIVE.videolength === 0){
    ACTIVE.endTime = undefined;
//    $(this).addClass('loading');
//    setTimeout(function(){
//      $(this).removeClass('loading');
//    },10000);
  } else{
    ACTIVE.endTime=(ACTIVE.videolength-t)*1000+now;
    //$(this).removeClass('loading');
  }
  ACTIVE.startTime=(now-t*1000);
};
PEP.gotTime = function(data){
  if(data.state === 1){
    PEP.initAtTime(data.time);
  }
}

socket.on("hbVideoDetail",PEP.gotTime);
socket.on("forceVideoChange",PEP.gotTime);
socket.on("createPlayer",PEP.gotTime);

PEP.initAtTime = function(t){
  var n = Date.now();
  PEP.fixActive(t,n);
  if(PEP.set)
    return;
  PEP.initButts();
  PEP.set = true;
  PEP.calcEstTimes();
};
PEP.initButts = function(){
  var timesBut = $('<div/>',{
      id:'toggleTimes',
      text:' ',//'🕐', And here I thought the very OS from which unicode 6.0 got its dingbats would support them. NOPE. Fucking windows.
      title:'Show/Hide Projected Play Times. Right Click for Options.',
      click: function(){
        //if(PEP.loading)
          //$(this).addClass('loading');
        //else
          //$(this).removeClass('loading')p;
        PEP.toggleTimes();
        PEP.pauseCalcs=!$('#plul').hasClass('showStarts');
        if(!PEP.pauseCalcs)
          PEP.try(500);
      }
    }).insertBefore("#plstats .totalLength").bind('contextmenu',
      PEP.openTimeOpts);
  var manageBut = $('<div/>',{
      id:'manageAlarms',
      text:' ',//'🔔',
      title:'Manage Playlist Item Alerts',
      click:PEP.alertDialog
    }).insertBefore("#plstats .totalLength");
};
//whenExists('#plstats .totalLength',PEP.initButts);

PEP.toggleTimes = function(){
  $('#toggleTimes').toggleClass('timesOn');
  $('#plul').toggleClass('showStarts');
  realignPosHelper();
};

PEP.oldVST = videoSeekTo;
videoSeekTo = function(pos){
  PEP.oldVST(pos);
  ACTIVE.endTime=(ACTIVE.videolength-pos)*1000+Date.now();
  ACTIVE.startTime=(Date.now()-pos*1000);
  if(ACTIVE.next!==null)PEP.initAtTime(pos);
};


PEP.openTimeOpts = function(e){
  $(PEP.timeDialog).parent().remove();
  PEP.timeDialog = $('body').dialogWindow({
      title:'Projected Time Options',
      toolBox:true,
      offset:{
        top:e.pageY,
        left:e.pageX
      }
  }).attr('id','timeDialogWin').css({"padding-right": '8px'});
  var timeops = $('<fieldset><legend>Projected Time Options</legend></fieldset>').css({'text-align':'left'}).appendTo(PEP.timeDialog);
  var milTimeCheck = $('<div/>').append($('<input>',{
    type:'checkbox',
    name:'PEPmilTime',
    checked: PEP.milTime?'true':undefined,
    click: function(){
      PEP.milTime = $(this).prop("checked");
      localStorage.PEPmilTime = PEP.milTime;
      PEP.calcEstTimes(true);
    }
  }).after('<label for="PEPmilTime">Use 24-Hour format</label>')).appendTo(timeops);
  var pauseUpdates = $('<div/>').append($('<input>',{
    type:'checkbox',
    name:'PEPpause',
    checked: PEP.pause?'true':undefined,
    click: function(){
      PEP.pause = $(this).prop("checked");
    }
  }).after('<label for="PEPpause">Stop Updating Estimated Times</label>')).appendTo(timeops);
  return false;
};

PEP.alertDialog = function(){
  if($(PEP.manageAlerts).is(":visible")){
    $(PEP.manageAlerts).parent().remove();
    return;
  }
  PEP.alarms = PEP.getStorage();
  PEP.manageAlerts = $('body').dialogWindow({
      title:'Manage Playlist Item Alerts',
      center:true,
  }).attr('id','alertsDialog').css({"padding-right": '8px'});
  $('<span>Right click items on the actual playlist to set alerts.<br>'
    + 'Key:<span class="alert1ex">One-Time Alert</span>, '
    + '<span class="alert2ex">Recurring Alert</span><br>'
    + '<span class="alertNote">Shift and Ctrl can be used to select multiple items</span></span>'
    + '<ul id="alertsSelect" multiple style="width:100%;height:250px"/>').appendTo(PEP.manageAlerts);
  PEP.loadOptions();

  var onceBut = $('<div/>',{id:'setOnce','class':'button alert1b','html':'<span>Set to One-Time</span>',
    click:function(){PEP.eachSelected(function(id){
      PEP.alarms[id].alert = 1;
    })} }).appendTo(PEP.manageAlerts);
  var alwaysBut = $('<div/>',{id:'setAlways','class':'button alert2b','html':'<span>Set to Recurring</span>',
    click:function(){PEP.eachSelected(function(id){
      PEP.alarms[id].alert = 2;
    })} }).appendTo(PEP.manageAlerts);
  var removeBut = $('<div/>',{id:'remove','class':'button','html':'<span>Remove Alert</span>',
    click:function(){PEP.eachSelected(function(id){
      delete PEP.alarms[id];
    })} }).appendTo(PEP.manageAlerts);
  var pepops = $('<fieldset><legend>Alert Options</legend></fieldset>').css({'text-align':'left'}).appendTo(PEP.manageAlerts);
  var soundCheck = $('<div/>').append($('<input>',{
    type:'checkbox',
    name:'PEPsound',
    checked: PEP.sound?'true':undefined,
    click: function(){
      PEP.sound = $(this).prop("checked");
      localStorage.PEPsound = PEP.sound;
    }
  })).append('<label for="PEPsound">Play Sound</label>').appendTo(pepops);
  var dsCheck = $('<div/>').append($('<input>',{
    type:'checkbox',
    name:'PEPds',
    checked: PEP.ds?'true':undefined,
    click: function(){
      PEP.ds = $(this).prop("checked");
      localStorage.PEPds = PEP.ds;
    }
  })).append('<label for="PEPds" >Show Desktop Pop-up<span class="alertNote">(Requires Desktop Squees Plugin)</span></label>').appendTo(pepops);
  var flashCheck = $('<div/>').append($('<input>',{
    type:'checkbox',
    name:'PEPflash',
    checked: PEP.flash?'true':undefined,
    click: function(){
      PEP.flash = $(this).prop("checked");
      localStorage.PEPflash = PEP.flash;
    }
  })).append('<label for="PEPflash">Flash Window Title</label>').appendTo(pepops);
  PEP.manageAlerts.css({'max-width':'400px','text-align':'center'});
  PEP.manageAlerts.window.center();
};

PEP.loadOptions = function(){//well, tryloadoptions, anyway
  if($('#alertsSelect').length){
    $('#alertsSelect li').remove();
    $.each(PEP.obArrSort(PEP.alarms),function(i,val){
      $('<li data-value="'+val.id+'" class="alert'+val.alert+'">'+val.title+'</li>').appendTo('#alertsSelect');
    });
    $('#alertsSelect').multipleSelectBox();
  }
};

PEP.eachSelected = function(callback){
  $('#alertsSelect li.selected').each(function(){callback($(this).attr('data-value'));});
  PEP.loadOptions();
  PEP.restarPlaylist();
  PEP.setStorage(PEP.alarms);
};

PEP.obArrSort = function(ob){
  var arr = [];
  for(var i in ob){
    arr.push({id:i,title:ob[i].title,alert:ob[i].alert});
  }
  arr.sort(PEP.titleSort);
  return arr;
};

PEP.titleSort = function(a, b) {
  var titleA = a.title.toUpperCase().replace( /\W/g , '');
  var titleB = b.title.toUpperCase().replace( /\W/g , '');
  return (titleA < titleB) ? -1 : (titleA > titleB) ? 1 : 0;
};


PEP.calcEstTimes = function(rerender){
  if(ACTIVE.startTime === undefined && ACTIVE.videolength>0 || PEP.pauseCalcs || PEP.pause){
    PEP.try(PEP.pause?10000:1000);
    return;
  }
  console.log('Recalculating Estimated Playtimes');
  var now = Date.now();
  var pl = PLAYLIST.PEPtoArr(ACTIVE.next);
  //cut out all that crap used for starting partway
  //through. most calcs will start near the start
  //anyway.
  var i;
  for(i = 0; i<pl.length; i++){
    /*this should balance out to:
      On first run, all times will be calculated.
      After that, all times after the halfway point
      will only be recalculated if they have not
      already been played. Moving of items around
      the "far end" of the loop may result in
      inaccuracies*/
    if( (i<=pl.length/2) || (pl[i].endTime === undefined) || (pl[i].startTime > now)){//(i<=stopat) &&
      if(pl[i].prev.endTime === undefined){
        if(pl[i].startTime === undefined)
          continue;//oh looks like we already hit the change before, data should already be set
        pl[i].startTime = undefined;
        pl[i].endTime = undefined;
      }else{
        var tempST = pl[i].prev.endTime+2000+3000;//store before setting, so we can check if we're already on track
        if(pl[i].videolength === 0){
          pl[i].endTime = undefined;
        } else {
          var tempET = tempST + pl[i].videolength*1000;
          if(pl[i].startTime !== undefined && pl[i].endTime !== undefined &&
            Math.abs(tempET-pl[i].endTime)<=1 && Math.abs(tempST-pl[i].startTime)<=1){
            if(!rerender)continue;//if we're this close, we must be back in alignment. Or close enough.
          }
        //checking the math now and skipping is cheaper than a dom op that might do nothing
          pl[i].endTime = tempET;
        }
        pl[i].startTime = tempST;
      }
    }
    $(pl[i].domobj).children('div.time').attr('data-till',PEP.formatTime(pl[i].startTime,now));
  }
//  $('#toggleTimes').removeClass('loading');
};

var days = ['Sun','Mon','Tue','Wed','Thr','Fri','Sat'];
PEP.formatTime = function(start,now){
  if(start === undefined)
    return PEP.unknown;
  var d = new Date(start);
  var l=(start-now>86400000);//if it's over a day ahead, start tacking day names on
  //en-GB does 24 hour time
  if(PEP.milTime){var s=(l?days[d.getDay()]:"")+d.toLocaleTimeString("en-GB").replace(l?/:\d\d\$/:/\s/,"").replace(/^0/,"");}
  else{var s=(l?days[d.getDay()]:"")+d.toLocaleTimeString("en-US").replace(l?/:\d\d /:/\s/,"").toLowerCase();}
  return s;
};
//full recalcs are less expensive than I first thought.
//Especially with limiting unnecessary DOM manipulation
//Unfuck gets called pretty much anytime things get
//moved/deleted/added, so let's hook into that.
//Most changes occur in the near-playing future,
//so savings would be minimal if I made it start a few
//items later, unless I fix it to break the recalc loop properly
PEP.oldUnfuck = unfuckPlaylist;
unfuckPlaylist = function(){
  PEP.oldUnfuck();
  PEP.try();
};


PEP.oldAVC = addVideoControls;
addVideoControls = function(entry,optionList){
  var plob=$(entry).data("plobject");
  var vid = plob.videoid;
  var vlink = false;
  switch(plob.videotype){//hmm. Could add osmf here, but people could more easily jack streams.
    case "yt":
      vlink = 'http://youtu.be/'+vid;
      break;
    case "vimeo":
      vlink = 'http://vimeo.com/'+vid;
      break;
    case "soundcloud":
      vlink = plob.meta.permalink;
      break;
    case "dm":
      vlink = 'http://www.dailymotion.com/video/' + vid.substr(2);
      break;
    default:
      break;
  }
  if(vlink){
    function manualCopy(clipBtn) {
      var box = $("<input readonly/>").addClass('button').css({
        width:parseInt(clipBtn.width())+parseInt(clipBtn.css('padding-left'))*2,
        height:clipBtn.height(),
        padding:0,
        'font-size':clipBtn.css('font-size'),
      }).val(vlink);
      clipBtn.replaceWith(box);
      $("<span/>").addClass('copyCaption').text("Sorry, automatic copy failed. Have a text box!")
        .insertAfter(box).before('<br>');
      box.select();
      box.click(function(){
        $(this).select();
      });
    }

    var clipBtn = $("<div/>").addClass("button").attr('data-clipboard-text',vlink).appendTo($("<li/>").appendTo(optionList));
    var clipSpn = $("<span/>").text("Copy Link to Clipboard").appendTo(clipBtn);
    if(window.ClipboardJS && ClipboardJS.isSupported()){
      const clip = new ClipboardJS(clipBtn[0]);
      clip.on('success', function(e) {
        clipSpn.text("Link Copied!");
        setTimeout(function(){$(e.trigger).parents('.dialogWindow').remove();},1500);
      });
      clip.on('error', function(e) {
        manualCopy($(e.trigger));
      });
    }else{
      clipBtn.click(function(e){
        manualCopy($(this));
      });
    }
  }
  var optBtn = $("<div/>").addClass("button").appendTo($("<li/>").appendTo(optionList));
  var optSpn = $("<span/>").text("Set Play Alert").appendTo(optBtn).attr('title','Alert me when this plays!');
  PEP.alarms = PEP.getStorage();
  if(PEP.alarms[vid]!==undefined){
      switch(PEP.alarms[vid].alert){
        case 0://er, should never get here.
          optSpn.text('Set Play Alert');
          optBtn.css('background-color','');
          break;
        case 1:
          optSpn.text('Alert Once');
          optBtn.css('background-color','#DD0000');
          break;
        case 2:
          optSpn.text('Alert Always');
          optBtn.css('background-color','#DDDD00');
          break;
      }
  }
  optBtn.click(function(){
    PEP.alarms = PEP.getStorage();
    if(PEP.alarms[vid]!==undefined){
        switch(PEP.alarms[vid].alert){
          case 1:
            PEP.alarms[vid]={title:decodeURI(plob.videotitle),alert:2};
            $(entry).addClass('alarm').removeClass('once');
            optSpn.text('Alert Always');
            optBtn.css('background-color','#DDDD00');
            break;
          case 2:
            delete PEP.alarms[vid];
            $(entry).removeClass('once alarm');
            optSpn.text('No Alert');
            optBtn.css('background-color','');
            break;
        }
    }else{
      PEP.alarms[vid]={title:decodeURI(plob.videotitle),alert:1};
      $(entry).addClass('alarm once');
      optSpn.text('Alert Once');
      optBtn.css('background-color','#DD0000');
    }
    PEP.loadOptions();
    PEP.setStorage(PEP.alarms);
  });
  PEP.oldAVC(entry,optionList);
};

PEP.oldpoppl = populatePlEntry;
populatePlEntry = function(entry,elem){
  PEP.oldpoppl(entry,elem);
  if(PEP.alarms[elem.videoid] !== undefined){
    if(PEP.alarms[elem.videoid].alert == 1)
      $(entry).addClass('alarm once');
    if(PEP.alarms[elem.videoid].alert == 2)
      $(entry).addClass('alarm');
  }
};

PEP.oldspp = setPlaylistPosition;
setPlaylistPosition = function(to){
  PEP.oldspp(to);
  var vid = to.video.videoid;
  PEP.alarms = PEP.getStorage();
  if(PEP.alarms[vid]!==undefined){
    PEP.sound&&PEP.JAM.play();
    if (typeof desktopSquee !== "undefined" && PEP.ds)
      desktopSquee(PEP.alarms[vid].title + " is about to play!");
    if (PEP.flash)
      PEP.titleFlash(PEP.alarms[vid].title);
    if(PEP.alarms[vid].alert == 1){
      $(ACTIVE.domobj).removeClass('alarm once');
      delete PEP.alarms[vid];
      PEP.loadOptions();
    }
  }
  PEP.setStorage(PEP.alarms);
};

PEP.titleFlash = function(title){
  if (!WINDOW_FOCUS) {
    clearInterval(CHAT_NOTIFY);
    CHAT_NOTIFY = setInterval(function() {
      if (document.title == WINDOW_TITLE) {
        document.title = "Playing "+title;
      }
      else {
        document.title = WINDOW_TITLE;
      }
    }, 1000);
  }
};

PEP.restarPlaylist = function(){
  var pl = PLAYLIST.PEPtoArr();
  var i;
  for(i = 0; i<pl.length; i++){
    var elem = pl[i].domobj;
    $(elem).removeClass('alarm once');
    if(PEP.alarms[pl[i].videoid]!==undefined){
        switch(PEP.alarms[pl[i].videoid].alert){
          case 1:
            $(elem).addClass('alarm once');
            break;
          case 2:
            $(elem).removeClass('once').addClass('alarm');
            break;
        }
    }
  }
};
PEP.restarPlaylist();
/*PEP.bench={};
PEP.bench.begin = function(){
  console.log("Stopping automatic recalcs to observe prediction accuracy");
  PEP.backcalc = PEP.calcEstTimes;
  PEP.calcEstTimes=function(){};
  PEP.benchInt = setInterval(function(){
    PEP.backcalc()
  },1800000);
  socket.on("forceVideoChange",PEP.bench.fvc);
}
PEP.bench.end = function(){
  console.log("Resuming normal functionality");
  clearInterval(PEP.benchInt);
  socket.removeListener("forceVideoChange",PEP.bench.fvc);
  PEP.calcEstTimes=PEP.backcalc;
  PEP.calcEstTimes();
}
PEP.bench.fvc = function(data){
  PEP.bench.now=Date.now()+3000;
  setTimeout(function(){
    console.log((PEP.bench.now-ACTIVE.startTime)/1000.0)}
  ,1000);
};*/
  var oplaylistsize=$("#playlist").height();
  $(document).bind("mouseup.checkplaylistresize",function (e){
    if($("#playlist").height()!==oplaylistsize){
      oplaylistsize = $("#playlist").height();
    }
  });



// vim:ts=2:sw=2:sts=2
