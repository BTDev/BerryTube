  var tts = new (function(){
    var debug = false;
    var fallback = false;
    var ttsQueue = [];
    var isQueue = false;
    var isOn = false;
    var currentlyPlaying;
    var button;

    function ttsMaiS(data){
      var msg = data.msg.msg;
      var strippedText = $('<span>'+msg+'</span>').text();
      var reg = /https?:\/\/([\w\d\.]+).*/;
      var noLinks = strippedText.replace(reg, function(v, p){
        return p;
      });
      readShit(noLinks);
      if(debug){
        console.log('TTS DEBUG: '+noLinks);
      }
    }

    function readShit(shit){
      if(isQueue){
        speak(shit, null, queuePlayer);
      }else{
        speak(shit);
      }
    }
    window.readShit = readShit;
    function queuePlayer( wav ){

      if( wav != null){
        ttsQueue.push(wav);
      }

      if( ttsQueue.length > 0 && currentlyPlaying == null ){
        currentlyPlaying = new Audio("data:audio/x-wav;base64,"+ttsQueue.shift());
        $(currentlyPlaying).on('ended' ,function(){
          currentlyPlaying = null;
          queuePlayer();
        });
        currentlyPlaying.play();
      }
    }

    function clearQueue(){
      ttsQueue = [];
      if(currentlyPlaying){
        currentlyPlaying.pause();
        $(currentlyPlaying).remove();
        currentlyPlaying = null;
      }
    }
    window.clearQueue = clearQueue;

    function ttsToggle(){
      if(isQueue){
        clearQueue();
      }else{
        if(isOn){
          ttStop();
        }else{
          ttStart();
        }
      }

    }
    function ttStart(){
      isOn = true;
      button.css('background-image','url(plugins/tts/sound.png)');
      socket.on('chatMsg',ttsMaiS);
    }
    function ttStop(){

      isOn = false;
      button.css('background-image','url(plugins/tts/nosound.png)');
      socket.removeListener('chatMsg', ttsMaiS);
    }

    function toggleQueue(ev){
      if(!isOn) return;
      isQueue = !isQueue;
      if(isQueue)
        button.css('background-image','url(plugins/tts/soundQ.png)');
      else
        button.css('background-image','url(plugins/tts/sound.png)');

      ev.preventDefault();
    }

    function toggleDebug(ev){
      debug = !debug;
      $(this).css('border-width', debug ? '0 1px 0 1px' : '0');
      ev.preventDefault();
    }

    function setupTTS(){
      setupButton();
    }
    function setupButton(){
      var buttonHtml = '<div title="tts" id="mbalpha" class="settings" style="background-image:url(plugins/tts/nosound.png);float: left;border-width:0 ;border-style:solid;box-sizing: border-box;border-color: red;"></div>';
      button = $(buttonHtml)
        .prependTo(
          $('#chatControls')
          .css('position','relative')
        )
        .on('click', ttsToggle)
        .on('contextmenu', toggleQueue);
    }

    $('head').append('<script type="text/js-worker"> importScripts("https://rawgit.com/kripken/speak.js/master/speakGenerator.js"); onmessage = function(event) {  postMessage(generateSpeech(event.data.text, event.data.args));};</script>');

    $.getScript('https://rawgit.com/kripken/speak.js/master/speakGenerator.js', function(){
      $.getScript('plugins/tts/speakClient.js', setupTTS);
    });
  })()
