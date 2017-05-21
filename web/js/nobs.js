(function(){
  
	var oldinput = false;

	var enabled = function(){
		// Dear people who read the source code, in the spirit of april fools
		// I hope you will not go around ruining the fun for anyone else with
		// some kind of addon or tip to bypass.
		var x = document.getElementById("no-backspace");
		if(!x) return true; // no key = pain
		return (x.getAttribute('value') === 'true');
	}
	
	function checkForAltered(e){

		if(!enabled()) {
			oldinput = false;
			return;
		}
		
		var el = e.target;

		if(oldinput && el.value.indexOf(oldinput) != 0){
			e.preventDefault();
			el.value = oldinput;
		} else {
			oldinput = el.value;
		}

	}

	function resetLock(e) { 
		if(e.keyCode == 13) { oldinput = false; } 
		if(e.keyCode == 9) { oldinput = e.target.value; } 
	}

	var activate = function(){
		var input = document.getElementById('chatinput');
		if(!input){
			setTimeout(activate,300);
			return;
		}
		input.addEventListener("input", checkForAltered);
		input.addEventListener("keyup", resetLock);
	}
	activate();

  
})();


