//This is a bit tedious. Documentation on creating a proper videoJS plugin looked even more tedious/unclear.
//at some point it could/should be perhaps turned into a proper plugin.
//Kept it independent of stuff like jquery, and mimiced naming style for that reason
//ofc it's pretty specific to our/cytube's manifest style
//and yeah, a bit overkill, but damn lang names can vary between files.
const SLPREF_DEFAULT = {
	useLast: true,
	lastUsed: null,
	useCC: false,
	pref1: null,
	pref2: null,
	pref3: null
};
function getOrResetPrefs() {
	let sublangPrefs = structuredClone(SLPREF_DEFAULT);
	try {
		sublangPrefs = JSON.parse(localStorage.sublangPrefs);
	}catch(e){
		console.warn("no valid sublang prefs set");
		localStorage.sublangPrefs = JSON.stringify(sublangPrefs); //reset if bugged
	}
	return sublangPrefs;
}

function addCheckField(name, labelTxt, state, disabled) {
  //videojs uses fieldsets for everything, so like, I guess we go with it...
  const field = document.createElement('fieldset');
  field.classList.add("vjs-track-settings",`vjs-sublang-fieldset-${name}`);
  const label = document.createElement('label');
  label.innerText = labelTxt;
  label.htmlFor = `vjs-sublang-${name}`;
	const input = document.createElement('input');
  input.type = "checkbox";
  input.checked = state;
	if (typeof disabled == 'boolean')
		input.disabled = disabled;
  input.id = `vjs-sublang-${name}`;
	field.appendChild(input);
	field.appendChild(label);
	return field;
}

function addSubtitlePrefs(vjs) {
	const sublangPrefs = getOrResetPrefs();
  
	const sublangCont = document.createElement('div');
  sublangCont.classList.add("vjs-track-settings-sublang");
	//if simply unset, default to true;
  const sublangFieldsetUseLast = addCheckField("uselast",
		"Use Last Picked Language", (sublangPrefs.useLast===false ? false : true),
		false);
  const sublangFieldsetEnable = addCheckField("enable",
		"Prefer Specific Subtitles(if available)", (sublangPrefs.enable==true || false),
		false);
  const sublangFieldsetUseCC = addCheckField("usecc",
		"Prefer SDH(Deaf) subs (if available)", sublangPrefs.useCC==true || false,
	!sublangPrefs.enable);
  
  sublangCont.appendChild(sublangFieldsetUseLast);
  sublangCont.appendChild(sublangFieldsetEnable);
  sublangCont.appendChild(sublangFieldsetUseCC);

	const prefs = [];
  for (let i = 0; i < 3; i++) {
    const sublangFieldsetPref = document.createElement('fieldset');
    sublangFieldsetPref.classList.add("vjs-track-settings","vjs-sublang-fieldset-pref");
    const label = document.createElement("legend");
    label.classList.add("vjs-sublang-label-pref");
    label.htmlFor = `vjs-sublang-pref${i}`;
    label.innerText = `Preference ${i+1}`;
    prefs.push(document.createElement("select"));
    prefs[i].id = `vjs-sublang-pref${i}`;

    for (let l = 0; l < LANG_ARRAY.length; l++) {
      const option = document.createElement("option");
      option.innerText = LANG_ARRAY[l].lang;
      option.value = JSON.stringify(LANG_ARRAY[l]);

      if ( (l == 0 && !sublangFieldsetEnable.firstChild.checked) ||
					JSON.stringify(sublangPrefs[`pref${i}`]) == option.value) {
				option.selected = true;
			}
			prefs[i].appendChild(option);
    }
		
		prefs[i].disabled = !sublangFieldsetEnable.firstChild.checked ||
			(i>0 && prefs[i-1].selectedIndex == 0);
		//overly fancy select disabling
		prefs[i].addEventListener('change', function(e) {
			if (i<2) {
				if (prefs[i].selectedIndex == 0) {
					if (prefs[i+1].selectedIndex == 0)
						prefs[i+1].disabled = true;
					else {
						prefs[i].selectedIndex = prefs[i+1].selectedIndex;
						prefs[i+1].selectedIndex = 0;
						prefs[i+1].disabled = false;
					}
				} else
					prefs[i+1].disabled = false;
				prefs[i+1].dispatchEvent(new Event("change"));
			}
		});
    sublangFieldsetPref.appendChild(prefs[i]);
    sublangFieldsetPref.appendChild(label);
    sublangCont.appendChild(sublangFieldsetPref);
  }
	sublangFieldsetEnable.firstChild.addEventListener('input',function(){
		document.getElementById('vjs-sublang-usecc').disabled = !this.checked;
		for (let i = 0; i < 3; i++) {
			prefs[i].disabled = !this.checked;
		}
		if (this.checked)
			prefs[0].dispatchEvent(new Event("change"));
	});
  vjs.textTrackSettings.contentEl_.insertBefore(sublangCont, vjs.textTrackSettings.contentEl_.lastChild);
	vjs.textTrackSettings.on('modalclose',vjsSubPrefSettingsSave);
}
//save the preferences..
function vjsSubPrefSettingsSave() {
	const sublangPrefsOld = getOrResetPrefs();
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

//turn all foreign characters to a-z, strip all spaces, for better comparison
function stringSimplify(str) {
	return str?.normalize("NFD")?.replace(/[\u0300-\u036f]/g, "")?.replace(/[^a-zA-Z]/g,"")?.toLowerCase();
}

//a spaghetti way of narrowing down to likely options
//previously did some weighting, now just a filter w/ some redundant bits
function trackMatchVal(track,ideal) {
	const idealLang = stringSimplify(ideal?.lang);
	const idealSrclang = ideal?.srclang?.toLowerCase() || ideal?.bcp47?.toLowerCase();
	const trackLang = stringSimplify(track?.lang);
	const trackSrclang = track?.srclang?.toLowerCase() || track?.bcp47?.toLowerCase();
	if (trackLang && idealLang && trackLang == idealLang || //exact match
		idealLang?.match(new RegExp(`^${trackLang}.+`,"i")) || //partial either way
		trackLang?.match(new RegExp(`^${idealLang}.+`,"i")) ||  
		trackSrclang && idealSrclang && trackSrclang == idealSrclang ||
		idealSrclang?.match(new RegExp(`^${trackSrclang}.+`,"i")) ||
		trackSrclang?.match(new RegExp(`^${idealSrclang}.+`,"i")) ||
		trackSrclang && ideal.iso2 && track.Srclang == ideal.iso2 ||
		idealSrclang && track.iso2 && idealSrclang == track.iso2)
		return true;
	return false;
}

//returns a sorter for ranking closest to a given language name string
function levenshteinSort(comp) {
	const complang = comp.lang.replace(/(sdh|cc)/i,'');
	return function(a,b){
		const alang = a.lang.replace(/(sdh|cc)/i,''); //ignore sdh/cc, use lang name
		const blang = b.lang.replace(/(sdh|cc)/i,'');
		const alev = levenshtein(stringSimplify(complang),stringSimplify(alang));
		const blev = levenshtein(stringSimplify(complang),stringSimplify(blang));
		if (alev < blev) return -1; else return (blev < alev)*1;//lower = closer match
	};
}

//filters to only langs with some amount of matching props
function filterSortBestTracks(tlist,pref) {
	const list = structuredClone(tlist).filter((e)=>trackMatchVal(e,pref));
	return list.sort(levenshteinSort(pref));;
}

//finds the closest match to update the last preference
function updateChosenLang() {
	const sublangPrefs = getOrResetPrefs();
	const presentTracks = Array.from(this);
	const activeTrack = presentTracks.find((e)=>e.mode=="showing");
	if (typeof activeTrack === "undefined") { //none active
		if (presentTracks.length > 0) { //some present, must be disabled
			delete sublangPrefs.lastUsed; //clear the last used
			localStorage.sublangPrefs = JSON.stringify(sublangPrefs);
		}
		return;
	} else {
		const {label, language, src} = activeTrack;
		const manifest = ACTIVE.meta.manifest;
		const allTracks = (manifest.textTracks||[]).concat(manifest.bitmapTracks||[]);
		//most accurate way to be sure if it's a "true" forced one, since we use "default"
		//to set the starting track, sometimes different.
		const manifestMatch = allTracks.find(t=>t.url==src);
		//if a forced track is chosen, don't update last used
		if (manifestMatch?.default === true) return;
		const best = filterSortBestTracks(LANG_ARRAY,{srclang:language,lang:label});
		if (best.length == 0) return;
		sublangPrefs.lastUsed = best[0]; //store the closest match from main list
		localStorage.sublangPrefs = JSON.stringify(sublangPrefs);
	}
}

//check the last used, then preferences, else use "forced"/default one, if any
function pickTextTrackIndex(tracks) {
	const sublangPrefs = JSON.parse(localStorage.sublangPrefs);

	const searchObjs = tracks.map((e,i)=>{
		return {i:i, isCC:(e.kind=="captions"), lang:e.name, srclang:e.srclang};
	});

	let lastMatches = [];
	if (sublangPrefs.useLast && sublangPrefs.lastUsed) {
		//sort by some matching/similar tags, then find the closest name
		lastMatches = filterSortBestTracks(searchObjs,sublangPrefs.lastUsed);
	}
	
	let found = [];
	if (sublangPrefs.enable) {
		if (sublangPrefs.pref0?.lang !== 'None') {
			const list = filterSortBestTracks(searchObjs,sublangPrefs.pref0);
			found = found.concat(list);
		}
		if (sublangPrefs.pref1?.lang !== 'None') {
			const list = filterSortBestTracks(searchObjs,sublangPrefs.pref1);
			found = found.concat(list);
		}
		if (sublangPrefs.pref2?.lang !== 'None') {
			const list = filterSortBestTracks(searchObjs,sublangPrefs.pref2);
			found = found.concat(list);
		}
	}

	let finalIndex = null;
	if (lastMatches.length > 0) //put the last-used matches at the end as backup
		found = found.concat(lastMatches);
	if (sublangPrefs.useCC && found.length > 0) {
		const firstCC = found.find(t=>t.isCC);
		if (firstCC)
			finalIndex = firstCC.i;
	} else if (found.length > 0) {
		finalIndex = found[0].i;
	}
	let forcedTrackIndex = tracks.findIndex(e=>e.default);
	if (forcedTrackIndex == -1) forcedTrackIndex = null;
	if (finalIndex === null && Number.isInteger(forcedTrackIndex))
		finalIndex = forcedTrackIndex;//forced tracks are forced
	return finalIndex;
}	


//icons for audio and sub menus. text/overlay sub icons, stereo/surround icons
function makeIcon(icon) {
  const iconEl = document.createElement('i');
	iconEl.classList.add('icon',`icon-btplay-${icon}`,'menu-icon-right');
	return iconEl;
}

//yes this adds to the audio menu....can split it off later.
function addMenuIcons(vjs) {
	const manifest = ACTIVE.meta.manifest;
	const allTracks = (manifest.textTracks||[]).concat(manifest.bitmapTracks||[]);
	vjs.controlBar.subsCapsButton.menu.$$('li:is(.vjs-subtitles-menu-item, .vjs-captions-menu-item)>.vjs-menu-item-text').forEach((e,i)=>{
		if (allTracks[i]?.bitmapType) {
			e.insertBefore(makeIcon('disc'),e.firstElementChild);
		} else {
			e.insertBefore(makeIcon('text'),e.firstElementChild);
		}
	});
	vjs.controlBar.audioTrackButton.menu.$$('li.vjs-menu-item>.vjs-menu-item-text').forEach((e,i)=>{
		console.log(e);
		if (e.firstChild.textContent.match(/(5)\.(1|0)/i)) {
			e.insertBefore(makeIcon('51'),e.firstElementChild);
		} else if (e.firstChild.textContent.match(/(7)\.(1|0)/i)) {
			e.insertBefore(makeIcon('71'),e.firstElementChild);
		}	else if (e.firstChild.textContent.match(/(2 ?ch|2\.0|stereo)/i)){
			e.insertBefore(makeIcon('stereo'),e.firstElementChild);
		}
	});
}
