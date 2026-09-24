const { isUrl } = require("../utils");

exports.supportedSourceMediaTypes = new Set(["video/mp4","video/webm","video/quicktime","video/ogg"]);
exports.supportedAudioTrackTypes = new Set(["audio/mp4","audio/mpeg","audio/webm","audio/m4a","audio/aac","audio/ogg","audio/flac"]);

//"application/octet-stream" = there's no standard MIME type for the various bitmap subtitle formats
exports.supportedTextTrackTypes = new Set(["text/vtt"]);
exports.supportedBitmapTrackTypes = new Set(["application/octet-stream"]);
exports.supportedBitmapTrackFormats = new Set(["vobsub","pgs","dvb","mks"]);

exports.supportedAudioTrackKinds = new Set(["main","alternative","descriptions","main-desc","translation","commentary",""]);

//we don't need the latter 3(yet?), but they're valid
exports.supportedTextTrackKinds = new Set(["subtitles","captions","descriptions","chapters","metadata"]);

exports.sanitizeTitle = function(title) {
	if (typeof title !== "string") {
		throw new Error("invalid title, expected string");
	}

	if (title.length > 64) {
		title = title.substring(0, 64);
	}

	return title;
};

exports.sanitizeThumbnail = function(thumbnail) {
	if (!isUrl(thumbnail) && typeof thumbnail !== "undefined") {
		throw new Error("invalid thumbnail url, expected string");
	}
	return thumbnail;
};

exports.sanitizeDuration = function(duration) {
	if (typeof duration !== "number") {
		throw new Error("invalid duration, expected number");
	}

	if (duration < 1) {
		throw new Error("invalid duration, expected greater than 0");
	}

	return duration;
};

exports.sanitizeSource = function(source, index = "unknown") {
	if (typeof source !== "object") {
		throw new Error(sourceError("expected object"));
	}

	const { url, contentType, quality, bitrate } = source;
	if (!isUrl(url)) {
		throw new Error(sourceError("expected string url"));
	}

	if (typeof contentType !== "string" || !exports.supportedSourceMediaTypes.has(contentType)) {
		throw new Error(
			sourceError(`unsupported media type, expected ${Array.from(exports.supportedSourceMediaTypes).join(", ")}`),
		);
	}

	if (typeof quality !== "number") {
		throw new Error(sourceError("invalid quality, expected number"));
	}

	//if defined it must be a finite positive number. Not currently used, just here for cytube parity.
	if (typeof bitrate !== "undefined" && (typeof bitrate !== "number" || !Number.isFinite(bitrate) || bitrate < 1)) {
		throw new Error("If present, bitrate must be an integer");
	}

	return { url, contentType, quality, bitrate };

	function sourceError(message) {
		return `invalid source at index ${index}: ${message}`;
	}
};


exports.sanitizeAudioTrack = function(audioTrack, index = "unknown") {
	if (typeof audioTrack !== "object") {
		throw new Error(audioTrackError("expected object"));
	}

	const { url, contentType, language, label, kind, channels } = audioTrack;
	if (!isUrl(url)) {
		throw new Error(audioTrackError("expected string url"));
	}

	if (typeof contentType !== "string" || !exports.supportedAudioTrackTypes.has(contentType)) {
		throw new Error(
			audioTrackError(`unsupported audio type, expected ${Array.from(exports.supportedAudioTrackTypes).join(", ")}`),
		);
	}
	
	if (typeof language !== "string") {
		throw new Error(audioTrackError("audio track language must be present and be a string"));
	}
	
	if (typeof label !== "string") {
		throw new Error(audioTrackError("audio track label must be a string"));
	}
	
	//can be empty or missing, but if present should be a valid one.
	if (typeof kind !== "undefined" && (typeof kind !== "string" ||
	 !exports.supportedAudioTrackKinds.has(kind))) {
		throw new Error(audioTrackError("audio kind must be a string if present"));
	}

	//nonstandard, if present it serves as a hint for preferences/UI. # of audio channels (6=5.1, 2=stereo, etc )
	if (typeof channels !== "undefined" && (typeof channels !== "number" || !Number.isInteger(channels))) {
		throw new Error("If present, channels must be an integer");
	}

	return { url, contentType, language, label, kind, channels };

	function audioTrackError(message) {
		return `invalid audio track at index ${index}: ${message}`;
	}
};

function trackError(message) {
	return `invalid track at index ${index}: ${message}`;
}
function sanitizeSubTrack(track, index = "unknown") {
	if (typeof track !== "object") {
		throw new Error(trackError("expected object"));
	}

	const { url, contentType, name, srclang, kind} = track;

	const isDefault = track.default;
	if (!isUrl(url)) {
		throw new Error(trackError("expected string url"));
	}
	
	//omission allowed
	if ( (typeof kind !== "string" || !exports.supportedTextTrackKinds.has(kind)) && typeof kind !== "undefined") {
		throw new Error(
			trackError(`unsupported track kind, expected ${Array.from(exports.supportedTextTrackKinds).join(", ")}`),
		);
	}

	//omission allowed
	if (typeof srclang !== "string" && typeof srclang !== "undefined") {
		throw new Error(
			trackError(`invalid srclang, expected a string`),
		);
	}

	if (typeof name !== "string") {
		throw new Error(
			trackError(`invalid name(label), expected a string`),
		);
	}

	//omission allowed
	if (typeof isDefault !== "boolean" && typeof isDefault !== "undefined") {
		throw new Error(
			trackError(`invalid value for "default", expected a boolean`),
		);
	}

	return { url, contentType, name, srclang, kind, default:isDefault};

}

exports.sanitizeTextTrack = function(track, index = "unknown") {
	track = sanitizeSubTrack(track,index);
	const contentType = track.contentType;
	//cytube spec allows for text track content type, but it's actually not a valid attribute for text tracks...we can do without, but users
	//seeking cross compatibility can't.
	if (typeof contentType !== "undefined" && (typeof contentType !== "string" || !exports.supportedTextTrackTypes.has(contentType))) {
		throw new Error(
			trackError(`unsupported track type, got "${contentType}" expected ${Array.from(exports.supportedTextTrackTypes).join(", ")}`),
		);
	}
	return track;
}

exports.sanitizeBitmapTrack = function(track, index = "unknown") {
	const { bitmapType, idxUrl }	= track;
	track = sanitizeSubTrack(track,index);
	const contentType = track.contentType;
	if (typeof contentType !== "undefined" && (typeof contentType !== "string" || !exports.supportedBitmapTrackTypes.has(contentType))) {
		throw new Error(
			trackError(`unsupported bitmapTrack type, got "${contentType}" expected ${Array.from(exports.supportedBitmapTrackTypes).join(", ")}`),
		);
	}

	//for support of in-browser parsing of bitmap subs: pgs, dvdsub idx/sub bitmap subs, and dvdsubs packaged in matroska.
	//clientside library can actually auto-detect, but it feels dirty to rely solely that
	if ((typeof bitmapType !== "string" || !exports.supportedBitmapTrackFormats.has(bitmapType))) {
		throw new Error(
			trackError(`Unsupported bitmapTrack format, got "${bitmapType}" expected ${Array.from(exports.supportedBitmapTrackFormats).join(", ")}`),
		);
	}
	if (bitmapType !== "vobsub" && idxUrl) {
		throw new Error(trackError("idxUrl is only for vobsub subs"));
	}

	if (bitmapType === "vobsub" && (!idxUrl || !isUrl(idxUrl))) {
		throw new Error(trackError("expected string idxUrl with bitmapType vobsub"));
	}
	track.bitmapType = bitmapType;
	track.idxUrl = idxUrl;
	return track;
}

exports.sanitizeManifest = function(object) {
	if (typeof object !== "object" || object === null) {
		throw new Error("invalid manifest: expected object");
	}

	const { title, sources, duration, audioTracks, textTracks, bitmapTracks, thumbnail} = object;
	if (typeof sources !== 'undefined' && !Array.isArray(sources)) {
		throw new Error("invalid sources: expected array");
	}
	if (typeof audioTracks !== 'undefined' && !Array.isArray(audioTracks)) {
		throw new Error("invalid audioTracks: expected array");
	}
	if (typeof textTracks !== 'undefined' && !Array.isArray(textTracks)) {
		throw new Error("invalid textTracks: expected array");
	}
	if (typeof bitmapTracks !== 'undefined' && !Array.isArray(bitmapTracks)) {
		throw new Error("invalid bitmapTracks: expected array");
	}
	if (!sources && !audioTracks) {
		throw new Error("invalid manifest: must have video and/or audio tracks");
	}

	return {
		title: exports.sanitizeTitle(title),
		duration: exports.sanitizeDuration(duration),
		thumbnail: exports.sanitizeThumbnail(thumbnail),
		sources: sources?.map(exports.sanitizeSource)||undefined,
		audioTracks: audioTracks?.map(exports.sanitizeAudioTrack)||undefined,
		textTracks: textTracks?.map(exports.sanitizeTextTrack)||undefined,
		bitmapTracks: bitmapTracks?.map(exports.sanitizeBitmapTrack)||undefined,
	};
};
