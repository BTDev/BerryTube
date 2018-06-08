var xup = (function(){
  
  var self = {};
  var names = [];
  var namewrap = false;
  var keyphrase = "x";
  
  self.selectRandom = function(){
    return names[Math.floor(Math.random() * names.length)];
  }
  
  self.showWindow = function(){
    
    names = [];
    
    var parent = $("body").dialogWindow({
      title:"X-Ups",
      uid:"xups",
      center:true
    });
    
    var upperSec = $("<div/>").appendTo(parent);
    var w_keyPraseInput = $("<div/>").appendTo(upperSec);
    
    $("<div/>").text("Keyphrase").appendTo(w_keyPraseInput);  
    
    var keyPraseInput = $("<input/>").val(keyphrase).appendTo(w_keyPraseInput).width(200).css({
      margin:"0 auto",
      display: "block"
    });
    keyPraseInput.on("input",function(e){
      keyphrase = keyPraseInput.val();
    })
      
    $("<hr/>").appendTo(upperSec);    
    
    var randoBtn = $("<button/>").text("Select Random").appendTo(upperSec).width(200).css({
      'height': '40px',
      'font-size': '18px',
    });
    var randoField = $("<div/>").appendTo(upperSec).css({
      'text-align': 'center',
      'color': 'blue',
      'font-weight': 'bold',
      'height': '2em',
      'line-height': '2em',
    });
    randoBtn.click(function(){
      randoField.text(self.selectRandom());
    });
    
    namewrap = $("<div/>").appendTo(parent);
    
    var lowerSec = $("<div/>").appendTo(parent);
    var lblCollectingNames = $("<div/>").text("collecting names...").css("font-size","10px").appendTo(lowerSec)
    
    self.renderNames();    
  }
  
  self.renderNames = function(){
    $(namewrap).empty();
    names.forEach(function(elem){
      var line = $("<div/>").text(elem);
      $(namewrap).append(line);
    });
  }
  
  self.addName = function(name){
    if(names.indexOf(name) === -1){
      names.push(name);
      self.renderNames();
    }
  }
  
  self.vetMsg = function(name,msg){
    if((msg.toLowerCase()).includes(keyphrase.toLowerCase())) self.addName(name);
  }
  
	self.init = function(){
		if(!window.MISC_CONTROL){
			setTimeout(function(){
				self.init();
			},100);
			return;
		}
		
		btEvents.on("chat",function(data){
			self.vetMsg(data.msg.nick,data.msg.msg);
		});  

		var showBtn = $('<div/>').addClass("misc").addClass("btn").text("X-up's").prependTo(window.MISC_CONTROL);
		showBtn.click(function(){
			self.showWindow();
		});
	}
	
  self.init();
  
  return self;
  
})();

