//This is a bit tedious. Documentation on creating a proper videoJS plugin looked even more tedious/unclear.
//at some point it could/should be perhaps turned into a proper plugin.
//Kept it independent of stuff like jquery, and named similarly for that reason
//ofc it's pretty specific to our/cytube's manifest style
//and yeah, a bit overkill, but goal was to support every file I had
const SLPREF_DEFAULT = {
	useLast: null,
	lastUsed: null,
	pref1: null,
	pref2: null,
	pref3: null
};
function addSubtitlePrefs(vjs) {
	try {
		var sublangPrefs = JSON.parse(localStorage.sublangPrefs);
	}catch(e){
		console.warn("no valid sublang prefs set");
		var sublangPrefs = {
			useLast: null,
			lastUsed: null,
			pref1: null,
			pref2: null,
			pref3: null
		};
		localStorage.sublangPrefs = JSON.stringify(sublangPrefs);
	}
  const sublangCont = document.createElement('div');
  sublangCont.classList.add("vjs-track-settings-sublang");

  //videojs uses fieldsets for everything, so like, I guess we go with it...
  const sublangFieldsetUseLast = document.createElement('fieldset');
  sublangFieldsetUseLast.classList.add("vjs-track-settings","vjs-sublang-fieldset-uselast");

  const sublangUseLastLabel = document.createElement('label');
  sublangUseLastLabel.innerText = "Use Last Picked Language";
  sublangUseLastLabel.htmlFor = "vjs-sublang-uselast";

  const sublangUseLast = document.createElement('input');
  sublangUseLast.type = "checkbox";
	//if simply unset, default to true;
  sublangUseLast.checked = (sublangPrefs.useLast===false ? false : true);
  sublangUseLast.id = "vjs-sublang-uselast";

  sublangFieldsetUseLast.appendChild(sublangUseLast);
  sublangFieldsetUseLast.appendChild(sublangUseLastLabel);
  
	const sublangFieldsetEnable = document.createElement('fieldset');
  sublangFieldsetEnable.classList.add("vjs-track-settings","vjs-sublang-fieldset-enable");

  const sublangEnableLabel = document.createElement('label');
  sublangEnableLabel.innerText = "Prefer Specific Subtitles(if available)";
  sublangEnableLabel.htmlFor = "vjs-sublang-enable";

  const sublangEnable = document.createElement('input');
  sublangEnable.type = "checkbox";
  sublangEnable.checked = (sublangPrefs.enable==true || false);
  sublangEnable.id = "vjs-sublang-enable";

  sublangFieldsetEnable.appendChild(sublangEnable);
  sublangFieldsetEnable.appendChild(sublangEnableLabel);

  const sublangFieldsetUseCC = document.createElement('fieldset');
  sublangFieldsetUseCC.classList.add("vjs-track-settings","vjs-sublang-fieldset-usecc");

  const sublangUseCCLabel = document.createElement('label');
  sublangUseCCLabel.innerText = "Prefer SDH(Deaf) subs (if available)";
  sublangUseCCLabel.htmlFor = "vjs-sublang-usecc";

  const sublangUseCC = document.createElement('input');
  sublangUseCC.type = "checkbox";
  sublangUseCC.checked = (sublangPrefs.useCC==true || false);
	sublangUseCC.disabled = !sublangEnable.checked;
  sublangUseCC.id = "vjs-sublang-usecc";

  sublangFieldsetUseCC.appendChild(sublangUseCC);
  sublangFieldsetUseCC.appendChild(sublangUseCCLabel);

  sublangCont.appendChild(sublangFieldsetUseLast);
  sublangCont.appendChild(sublangFieldsetEnable);
  sublangCont.appendChild(sublangFieldsetUseCC);

  for (let i = 0; i < 3; i++) {
    const sublangFieldsetPref = document.createElement('fieldset');
    sublangFieldsetPref.classList.add("vjs-track-settings","vjs-sublang-fieldset-pref");
    const label = document.createElement("legend");
    label.classList.add("vjs-sublang-label-pref");
    label.htmlFor = `vjs-sublang-pref${i}`;
    label.innerText = `Preference ${i+1}`;
    const select = document.createElement("select");
    select.id = `vjs-sublang-pref${i}`;
		select.disabled = !sublangEnable.checked;
    for (let l = 0; l < LANG_ARRAY.length; l++) {
      const option = document.createElement("option");
      option.innerText = LANG_ARRAY[l].lang;
      option.value = JSON.stringify(LANG_ARRAY[l]);

      if ( (l == 0 && !sublangEnable.checked) ||
					JSON.stringify(sublangPrefs[`pref${i}`]) == option.value) {
				option.selected = true;
			}
			select.appendChild(option);
    }
    sublangFieldsetPref.appendChild(select);
    sublangFieldsetPref.appendChild(label);
    sublangCont.appendChild(sublangFieldsetPref);
  }
	sublangEnable.addEventListener('input',function(){
		document.getElementById('vjs-sublang-usecc').disabled = !this.checked;
		document.getElementById('vjs-sublang-pref0').disabled = !this.checked;
		document.getElementById('vjs-sublang-pref1').disabled = !this.checked;
		document.getElementById('vjs-sublang-pref2').disabled = !this.checked;
	});

  vjs.textTrackSettings.contentEl_.insertBefore(sublangCont, vjs.textTrackSettings.contentEl_.lastChild);
	vjs.textTrackSettings.on('modalclose',vjsSubPrefSettingsSave);
}
//save the preferences..
function vjsSubPrefSettingsSave() {
	try {
		var sublangPrefsOld = JSON.parse(localStorage.sublangPrefs);
	}catch(e){
		console.warn("no valid sublang prefs set");
		var sublangPrefsOld = {};
	}
	const sublangPrefs = {
		useLast: this.$('#vjs-sublang-uselast').checked,
		enable: this.$('#vjs-sublang-enable').checked,
		useCC: this.$('#vjs-sublang-usecc').checked,
		pref0: JSON.parse(this.$('#vjs-sublang-pref0').value),
		pref1: JSON.parse(this.$('#vjs-sublang-pref1').value),
		pref2: JSON.parse(this.$('#vjs-sublang-pref2').value)
	};
	//keep lastUsed only if wanted
	if (sublangPrefsOld.lastUsed && sublangPrefs.useLast)
		sublangPrefs.lastUsed = sublangPrefsOld.lastUsed;
	localStorage.sublangPrefs = JSON.stringify(sublangPrefs);
}

//Levenshtein distance, calculates string similarity
//for matching preference language names to whatever's available
//from https://github.com/gustf/js-levenshtein/
const levenshtein = (function() {
	function _min(d0, d1, d2, bx, ay) {
		return d0 < d1 || d2 < d1 ?
			d0 > d2 ?
			d2 + 1 :
			d0 + 1 :
			bx === ay ?
			d1 :
			d1 + 1;
	}
	return function(a, b) {
		if(a === b) {
			return 0;
		}
		if(a.length > b.length) {
			var tmp = a;
			a = b;
			b = tmp;
		}
		var la = a.length;
		var lb = b.length;
		while(la > 0 && (a.charCodeAt(la - 1) === b.charCodeAt(lb - 1))) {
			la--;
			lb--;
		}
		var offset = 0;
		while(offset < la && (a.charCodeAt(offset) === b.charCodeAt(offset))) {
			offset++;
		}
		la -= offset;
		lb -= offset;
		if(la === 0 || lb < 3) {
			return lb;
		}
		var x = 0;
		var y, d0, d1, d2, d3, dd, dy, ay, bx0, bx1, bx2, bx3;
		var vector = [];
		for(y = 0; y < la; y++) {
			vector.push(y + 1);
			vector.push(a.charCodeAt(offset + y));
		}
		var len = vector.length - 1;
		for(; x < lb - 3;) {
			bx0 = b.charCodeAt(offset + (d0 = x));
			bx1 = b.charCodeAt(offset + (d1 = x + 1));
			bx2 = b.charCodeAt(offset + (d2 = x + 2));
			bx3 = b.charCodeAt(offset + (d3 = x + 3));
			dd = (x += 4);
			for(y = 0; y < len; y += 2) {
				dy = vector[y];
				ay = vector[y + 1];
				d0 = _min(dy, d0, d1, bx0, ay);
				d1 = _min(d0, d1, d2, bx1, ay);
				d2 = _min(d1, d2, d3, bx2, ay);
				dd = _min(d2, d3, dd, bx3, ay);
				vector[y] = dd;
				d3 = d2;
				d2 = d1;
				d1 = d0;
				d0 = dy;
			}
		}
		for(; x < lb;) {
			bx0 = b.charCodeAt(offset + (d0 = x));
			dd = ++x;
			for(y = 0; y < len; y += 2) {
				dy = vector[y];
				vector[y] = dd = _min(dy, d0, dd, bx0, vector[y + 1]);
				d0 = dy;
			}
		}
		return dd;
	};
})();
// MIT License
//
// Copyright (c) 2017 Gustaf Andersson
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


//turn all foreign characters to a-z, strip all spaces, for better comparison
function stringSimplify(str) {
	return str?.normalize("NFD")?.replace(/[\u0300-\u036f]/g, "")?.replace(/[^a-zA-Z]/g,"")?.toLowerCase();
}

//compares two language identifier objects, either missing stuff
//a spaghetti way of narrowing down to likely options
//just trying to cover literally every language in every file
//available to test with.
//args: track to check, ideal values
//previously used for sorting/weighting, now just a filter
function trackMatchVal(t,ideal) {
	let val = 0;
	const idealLang = stringSimplify(ideal?.lang);
	const idealSrclang = ideal?.srclang?.toLowerCase() || ideal?.bcp47?.toLowerCase();
	const trackLang = stringSimplify(t?.lang);
	const trackSrclang = t?.srclang?.toLowerCase() || t?.bcp47?.toLowerCase();
	if (trackLang && idealLang && trackLang == idealLang) //exact match
		val += 2;
	else if (idealLang?.match(new RegExp(`^${trackLang}.+`,"i"))
					  || trackLang?.match(new RegExp(`^${idealLang}.+`,"i")) ) //partial match 
		val += 1;
	if (trackSrclang && idealSrclang && trackSrclang == idealSrclang)
		val += 2;
	else if (idealSrclang?.match(new RegExp(`^${trackSrclang}.+`,"i"))
					  || trackSrclang?.match(new RegExp(`^${idealSrclang}.+`,"i")) )
		val += 1;
	if (trackSrclang && ideal.iso2 && t.Srclang == ideal.iso2)
		val += 2;
	else if (idealSrclang && t.iso2 && idealSrclang == t.iso2)
		val += 2;
	return (val>0);
}

//returns a sorter for ranking closest to a given language name string
function levenshteinSort(comp) {
	const complang = comp.lang.replace(/(sdh|cc)/i,'');
	return function(a,b){
		//remove sdh/cc and focus on the lang name
		const alang = a.lang.replace(/(sdh|cc)/i,'');
		const blang = b.lang.replace(/(sdh|cc)/i,'');
		const alev = levenshtein(stringSimplify(complang),stringSimplify(alang));
		const blev = levenshtein(stringSimplify(complang),stringSimplify(blang));
		if (alev < blev) return -1; else return (blev < alev)*1;
	};
}

//filters to only langs with some amount of matching props
function filterTrackArray(tlist,pref) {
	const list = structuredClone(tlist).filter((e)=>trackMatchVal(e,pref));
	return list;
}

//finds the closest match to update the last preference
function updateChosenLang() {
	const sublangPrefs = window.JSON.parse(localStorage.sublangPrefs);
	const presentTracks = Array.from(this);
	const activeTrack = presentTracks.find((e)=>e.mode=="showing");
	if (typeof activeTrack === "undefined") {
		//none active
		if (presentTracks.length) {
			//but some are present, so they set it to no captions
			delete sublangPrefs.lastUsed;
			localStorage.sublangPrefs = window.JSON.stringify(sublangPrefs);
		}
		return;
	} else {
		const {label, language} = activeTrack;
		const available = filterTrackArray(LANG_ARRAY,{srclang:language,lang:label});
		const best = available.sort(levenshteinSort({srclang:language,lang:label}));
		if (best.length == 0) return;
		sublangPrefs.lastUsed = best[0];
		localStorage.sublangPrefs = window.JSON.stringify(sublangPrefs);
	}
}

//first compare the last used, then check preferences, and if still nothing,
//force it to the "forced"/default one, if any
function pickTextTrackIndex(tracks) {
	let sublangPrefs = structuredClone(SLPREF_DEFAULT);
	try {
		sublangPrefs = JSON.parse(localStorage.sublangPrefs);
	}catch(e){
		//reset if something is wrong
		localStorage.sublangPrefs = JSON.stringify(SLPREF_DEFAULT);
	}

	//anything not subs or caps isn't for display
	const useable = tracks.filter(e=>e?.kind.match(/^(subtitles|captions)$/gi)).map((e,i)=>{
		return {
			i:i, isCC:(e.kind=="captions"), lang:e.name,
			srclang:e.srclang, iso2:e.iso2, val:0
		};
	});

	let lastMatches;
	if (sublangPrefs.lastUsed) {
		//sort by some matching/similar tags, then find the closest name
		lastMatches = filterTrackArray(useable,sublangPrefs.lastUsed);
		lastMatches.sort(levenshteinSort(sublangPrefs.lastUsed));
	}
	
	let found = [];
	if (sublangPrefs.enable) {
		if (sublangPrefs.pref0?.lang !== 'None') {
			const list = filterTrackArray(useable,sublangPrefs.pref0);
			found = found.concat(list.sort(levenshteinSort(sublangPrefs.pref0)));
		}
		if (sublangPrefs.pref1?.lang !== 'None') {
			const list = filterTrackArray(useable,sublangPrefs.pref1);
			found = found.concat(list.sort(levenshteinSort(sublangPrefs.pref1)));
		}
		if (sublangPrefs.pref2?.lang !== 'None') {
			const list = filterTrackArray(useable,sublangPrefs.pref2);
			found = found.concat(list.sort(levenshteinSort(sublangPrefs.pref2)));
		}
	}

	let finalIndex = null;
	//put the ones that match the last used after those that match the preferences
	if (lastMatches)
		found = found.concat(lastMatches);
	if (sublangPrefs.useCC && found.length > 0) {
		const firstCC = found.find(t=>t.isCC);
		if (firstCC)
			finalIndex = firstCC.i;
	} else if (found.length) {
		finalIndex = found[0].i;
	}
	//
	let forcedTrackIndex = tracks.findIndex(e=>e.default);
	if (forcedTrackIndex == -1) forcedTrackIndex = null;
	if (finalIndex === null && Number.isInteger(forcedTrackIndex)) {
		//you still get forced/default subtitles if set
		finalIndex = forcedTrackIndex;
	}
	return finalIndex;
}	

