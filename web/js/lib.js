// fix performance issue in new jQuery UI
(function($){
	$.ui.sortable.prototype._setHandleClassName = function(){
		this.element.find( ".ui-sortable-handle" ).removeClass( "ui-sortable-handle" );
		$.each( this.items, function() {
                (this.instance.options.handle
                 ? this.item.find( this.instance.options.handle )
                 : this.item
                ).addClass('ui-sortable-handle');
        });
	};
})(jQuery);

(function($){
	$.fn.timeOut = function(duration,callback) {
		return this.each(function() {
			var me = $(this);
			me.css('position','relative');
			me.css('cursor','pointer');
			var resolution = 100;
			var height = me.height();
			var d = height / duration * resolution;
			var timer = $('<div/>').appendTo(me);
			timer.css('position','absolute');
			timer.css('background',me.css('color'));
			timer.css('bottom','0');
			timer.addClass("timerTicker");
			timer.height(height);
			timer.width(me.width());
			var x = 0;
			function timeOut(){
				clearInterval(x);
				if(callback)callback();
				timer.remove();
				me.unbind('click');
				me.css('cursor','default');
			}
			var x = setInterval(function(){
				height -= d;
				if(height <= 0){
					timeOut();
				} else {
					timer.height(height);
				}
			},resolution);
			$(this).click(function(){
				timeOut();
			});
			console.log(height);
		});
	};
})(jQuery);

(function($){
	$.fn.confirmClick = function(callback) {
		return this.each(function() {
			var btn = $(this);
			var origText = $(btn).children("span").text();
			btn.revert = function(){
				$(btn).removeClass("confirm",200,function(){
					$(btn).css('width','');
					$(btn).children("span").text(origText);
				});
			};
			$(btn).dblclick(function(){
				if(callback)callback();
				btn.revert();
			});
			$(btn).click(function(){
				if($(btn).hasClass("confirm")){
					$(btn).dblclick();
				} else {
					$(btn).data("w",$(btn).width());
					$(btn).addClass("confirm",200,function(){
						$(btn).width($(btn).data("w"));
						$(btn).children("span").text("Really?");
						setTimeout(function(){
							btn.revert();
						},3000);
					});
				}
			});
		});
	};
})(jQuery);

(function ($) {
	$.fn.superSelect = function (data) {
		return this.each(function () {
			const $this = $(this);
			const $dropdown = $("<div/>").attr("id", "dd-jquery").appendTo("body");

			$(data.options).each(function (_i, $option) {
				$dropdown.append(
					$("<div />").addClass("super-select__option").append(
						$($option)
							.clone()
							.click(function () {
								if (data.callback)
									data.callback($option);
		
								$dropdown.remove();
							})));
			});

			$dropdown
				.addClass("super-select")
				.css({ top: $this.offset().top, left: $this.offset().left })
				.show("blind");
		});
	};
})(jQuery);

(function($){
	$.fn.dialogWindow = function(data) {

		var parent = $('body');
		var myData = {
			title: "New Window",
			uid: false,
			offset:{
				top:0,
				left:0
			},
			onClose: false,
			center:false,
			toolBox:false,
			initialLoading:false,
			scrollable:false
		};
		for(var i in data){
			myData[i] = data[i];
		}

		//Tweak data
		myData.title = myData.title.replace(/ /g,'&nbsp;');

		//get handle to window list.
		var windows = $(parent).data('windows');
		if(typeof windows == "undefined"){
			$(parent).data('windows',[]);
			windows = $(parent).data('windows');
		}

		// Remove old window if new uid matches an old one.
		if(myData.uid != false){
			$(windows).each(function(key,val){
				if($(val).data('uid') == myData.uid){
					val.close();
				}
			});
		}

		// Create Window
		var newWindow = $('<div/>').appendTo(parent);
		newWindow.addClass("dialogWindow");
		if (myData.scrollable) {
			newWindow.addClass('scrollableDialog');
		}
		newWindow.data('uid',myData.uid);
		newWindow.css('z-index','999');
		newWindow.close = function(){
			var windows = $(parent).data('windows');
			windows.splice(windows.indexOf(this),1);
			$(this).fadeOut('fast',function(){
				$(this).remove();
			});
			if(myData.onClose)myData.onClose();
		};
		newWindow.setLoaded = function(){
			$(newWindow).find(".loading").remove();
		};
		newWindow.winFocus = function(){
			var highestWindow = false;
			var highestWindowZ = 0;
			var windows = $(parent).data('windows');
			for(var i in windows){
				if($(windows[i]) == $(this)) continue;
				var hisZ = $(windows[i]).css('z-index');
				if(hisZ > highestWindowZ){
					highestWindow = $(windows[i]);
					highestWindowZ = parseInt(hisZ);
				}
			}
			if($(highestWindow) !== $(this)){
				var newval = (highestWindowZ+1);
				$(this).css('z-index',newval);
			}
		};
		newWindow.mousedown(function(){
			newWindow.winFocus();
		});

		windows.push(newWindow);

		if(myData.toolBox){
			$(document).bind("mouseup.rmWindows",function (e){
				var container = newWindow;
				if (container.has(e.target).length === 0){
					container.close();
					$(document).unbind("mouseup.rmWindows");
				}
			});
		}

		if(!myData.toolBox){
			// Toolbar
			var toolBar = $('<div/>').addClass("dialogToolbar").prependTo(newWindow);
			newWindow.draggable({
				handle:toolBar,
				start: function() {
				},
				stop: function() {
				}
			});

			// Title
			var titleBar = $('<div/>').addClass("dialogTitlebar").appendTo(toolBar).html(myData.title);

			// Close Button
			var closeBtn = $('<div/>').addClass("close").appendTo(toolBar);
			closeBtn.click(function(){
				newWindow.close();
			});

			//break
			$('<div/>').css("clear",'both').appendTo(toolBar);
		}

		var contentArea = $('<div/>').appendTo(newWindow).addClass("dialogContent");
		contentArea.window = newWindow;

		// Position window
		if(myData.center){
			newWindow.center();
		} else {
			newWindow.offset(myData.offset);
		}

		// Handle block for loading.
		if(data.initialLoading){
			var block = $('<div/>').addClass("loading").prependTo(newWindow);
		}
		newWindow.winFocus();
		newWindow.fadeIn('fast');

		return contentArea;
	};
})(jQuery);

jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft()) + "px");
    return this;
};

function whenExists(objSelector,callback){
	var guy = $(objSelector);
	if(guy.length <= 0){
		setTimeout(function(){
			whenExists(objSelector,callback);
		},100);
	} else {
		callback(guy);
	}
}

function getVal(name){
	return $(document).data(name);
}
function setVal(name,val){
	return $(document).data(name,val);
}

function waitForFlag(flagname,callback){
	var flag = getVal(flagname);
	if(!flag){
		setTimeout(function(){
			waitForFlag(flagname,callback);
		},100);
	} else {
		callback();
	}
}

function waitForNegativeFlag(flagname, callback) {
	var flag = getVal(flagname);
	if (flag) {
		setTimeout(function() {
			waitForNegativeFlag(flagname,callback);
		}, 100);
	}
	else {
		callback();
	}
}
