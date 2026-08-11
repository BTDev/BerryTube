//This is a bit tedious. Documentation on creating a proper videoJS plugin looked even more tedious
//While independent of stuff like jquery, it's pretty specific to our/cytube's manifest style
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
    let sublangFieldsetPref = document.createElement('fieldset');
    sublangFieldsetPref.classList.add("vjs-track-settings","vjs-sublang-fieldset-pref");
    let label = document.createElement("legend");
    label.classList.add("vjs-sublang-label-pref");
    label.htmlFor = `vjs-sublang-pref${i}`;
    label.innerText = `Preference ${i+1}`;
    let select = document.createElement("select");
    select.id = `vjs-sublang-pref${i}`;
		select.disabled = !sublangEnable.checked;
    for (let l = 0; l < LANG_ARRAY.length; l++) {
      let option = document.createElement("option");

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


function vjsSubPrefSettingsSave() {
	try {
		var sublangPrefsOld = JSON.parse(localStorage.sublangPrefs);
	}catch(e){
		console.warn("no valid sublang prefs set")
		var sublangPrefsOld = {};
	}
	let sublangPrefs = {
		useLast: this.$('#vjs-sublang-uselast').checked,
		enable: this.$('#vjs-sublang-enable').checked,
		useCC: this.$('#vjs-sublang-usecc').checked,
		pref0: JSON.parse(this.$('#vjs-sublang-pref0').value),
		pref1: JSON.parse(this.$('#vjs-sublang-pref1').value),
		pref2: JSON.parse(this.$('#vjs-sublang-pref2').value)
	}
	//keep lastUsed only if wanted
	if (sublangPrefsOld.lastUsed && sublangPrefs.useLast)
		sublangPrefs.lastUsed = sublangPrefsOld.lastUsed;
	localStorage.sublangPrefs = JSON.stringify(sublangPrefs);
}

//compares two language identifier objects, either missing stuff
//a spaghetti way of finding the closest match.
//*should* weight closer matches in the the case of videos with a
//subs of multiple dialects.
//track-to-weight, ideal values, store the weight, return if filtering
function trackMatchVal(t,ideal, update, filter) {
	let val = 0;
	let idealLang = ideal?.lang?.replace(/[^a-zA-Z ]/g,"").toLowerCase();
	let idealSrclang = ideal?.srclang.toLowerCase() || ideal?.bcp47?.toLowerCase();
	let trackLang = t?.lang?.replace(/[^a-zA-Z ]/g,"").toLowerCase();
	let trackSrclang = t?.srclang?.toLowerCase() || t?.bcp47?.toLowerCase();
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
		val += 1;
	else if (idealSrclang && t.iso2 && idealSrclang == t.iso2)
		val += 1;
	if (update && t.val === 0)
		t.val += val;
	if (filter) {
		return (val>0);
	}
	//full code exists
	/*if (BCP47_OBJ[i.srclang]) {
		let matchLang = BCP47_OBJ[srclang].lang.replace(/[^a-zA-Z ]/g,"").toLowerCase();
		
		if (matchLang == lang) //full name match
			t.val += 3;
		else if (matchLang.match(new RegExp(`^${srclang}`,"i")) )
			t.val += 1; // start of name match
	}
	if (ISO639_2_OBJ[t.iso2.toLowerCase()]) {
		let matchLang = ISO639_2_OBJ[t.iso2.toLowerCase()].lang.replace(/[^a-zA-Z ]/g,"").toLowerCase();
		if (matchLang == lang)
			t.val += 2;
		else if (matchLang.match(new RegExp(`^${srclang}(\W|$)`,"i")) )
			t.val += 1;
	}
	//base code match
	let isomatch = (ISO639_1_OBJ[t.] || ISO639_2_OBJ[t.iso2]);
	if (isomatch) {
		if (isomatch.lang.replace(/\W/g,"").toLowerCase().match()
			?.srclang.match(new RegExp(`^${ISO639_1_OBJ[t.iso1]}(\W|$)`,"i"
		//t.val += 2;
		//base corresponding name match..removing nonword chars.
		if ((ISO639_1_OBJ[t.iso1] || ISO639_2_OBJ[t.iso2])?.lang.replace(/\W/g,"")
				.match(new RegExp(`^${t.lang}(\W|$)`,"i")[0])) {
			t.val += 2
		}
	}*/
}

function sortTrackArray(tlist,pref) {
	let list = structuredClone(tlist).filter((e)=>trackMatchVal(e,pref,true,true));
	return list.sort((a,b)=>{
//		let aval = trackMatchVal(a,ideal);
//		let bval = trackMatchVal(b,ideal);
		if (a.val>b.val) return -1; else return b.val>a.val;
	});
}

function updateChosenLang() {
	const sublangPrefs = window.JSON.parse(localStorage.sublangPrefs);
	const {label, language} = Array.from(this).find((e)=>e.mode=="showing")||{};
	if (!(label || language)) {
		return;
	} else {
		let foundLang = sortTrackArray(LANG_ARRAY,{srclang:language,lang:label})[0];
		console.log(foundLang);
		if (!foundLang) return;
		sublangPrefs.lastUsed = foundLang;
		localStorage.sublangPrefs = window.JSON.stringify(sublangPrefs);
	}
}

function pickTextTrackIndex(tracks) {
	let sublangPrefs={};
	try {
		sublangPrefs = JSON.parse(localStorage.sublangPrefs);
	}catch(e){}
	
	
	let forcedTrackIndex = tracks.findIndex(e=>e.default==true);
	if (forcedTrackIndex == -1) forcedTrackIndex = null;

	let prefArr = tracks.filter(e=>e?.kind.match(/^(subtitles|captions)$/gi)).map((e,i)=>{
		return {
		i:i, useCC:(e.kind=="subtitles"), lang:e.name,
		srclang:e.srclang, iso2:e.iso2, val:0
		}
	});
	
	const lastMatch = sublangPrefs.lastMatch ? sortTrackArray(prefArr,sublangPrefs.lastMatch)[0].i : null;
	let finalIndex = lastMatch;
	
	if (sublangPrefs.enable) {
		let found = null;

		if (sublangPrefs.pref1)
			found = sortTrackArray(prefArr,sublangPrefs.pref1);
		if (!found && sublangPrefs.pref2)
			found = sortTrackArray(prefArr,sublangPrefs.pref2);
		if (!found && sublangPrefs.pref3)
			found = sortTrackArray(prefArr,sublangPrefs.pref3);

		if (sublangPrefs.useCC && found) {
			let cctracks = prefArr.filter((e)=>(
				e.useCC || e?.lang.match(/(SDH|hearing|closed captions)/i)
			));
			if (cctracks && cctracks[0].val > 0) finalIndex = cctracks[0].i;
		} else if (found){
			finalIndex = found[0].i;
		}
	}
	if (!finalIndex) {
		//you still get forced/default subtitles
		finalIndex = forcedTrackIndex;
	}
	return finalIndex;
}	

	//const lang_arr = structuredClone(LANG_ARRAY);
	//lang_arr.filter((e)=>{
		//trackMatchVal(e,{srclang:language,lang:label}, true, true);
	//});
//	const foundlang = lang_array.find((e)=>{
//		return label?.match(new regexp(`^${e.lang}(\w|$)`,"i")) ||
//			language?.match(new regexp(`^${e.iso1}(\w|$)`,"i"));
//	});

