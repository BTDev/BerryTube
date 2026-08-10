const { isUrl } = require("../utils");

exports.supportedSourceMediaTypes = new Set(["video/mp4","audio/mp4","audio/aac","audio/mpeg","video/webm","audio/webm","video/av1"]);
exports.supportedTrackTypes = new Set(["text/vtt"]);
//we don't need the latter 3(yet?), but they're valid
exports.supportedTrackKinds = new Set(["subtitles","captions","descriptions","chapters","metadata"]);

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

	const { url, contentType, quality } = source;
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

	return { url, contentType, quality };

	function sourceError(message) {
		return `invalid source at index ${index}: ${message}`;
	}
};


exports.sanitizeTrack = function(track, index = "unknown") {
	if (typeof track !== "object") {
		throw new Error(trackError("expected object"));
	}

	const { url, contentType, name, srclang, kind, iso2} = track;
	const isDefault = track.default;
	if (!isUrl(url)) {
		throw new Error(trackError("expected string url"));
	}

	if (typeof contentType !== "string" || !exports.supportedTrackTypes.has(contentType)) {
		throw new Error(
			trackError(`unsupported track type, got "${contentType}" expected ${Array.from(exports.supportedTrackTypes).join(", ")}`),
		);
	}

	//omission allowed
	if ( (typeof kind !== "string" || !exports.supportedTrackKinds.has(kind)) && typeof kind !== "undefined") {
		throw new Error(
			trackError(`unsupported track kind, expected ${Array.from(exports.supportedTrackKinds).join(", ")}`),
		);
	}

	//omission allowed
	if (typeof srclang !== "string" && typeof srclang !== "undefined") {
		throw new Error(
			trackError(`invalid srclang, expected a string`),
		);
	}

	//not a normal field, but useful since ffmpeg doesn't show 2-character ISO 369-1 codes
	//serves as a intermediar since not everyone might map em to to srclang
	//omission allowed
	if (typeof iso2 !== "string" && typeof iso2 !== "undefined") {
		throw new Error(
			trackError(`invalid iso-369-2 string, expected a string`),
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

	//omission allowed
	if (typeof forced !== "boolean" && typeof forced !== "undefined") {
		throw new Error(
			trackError(`invalid value for "forced", expected a boolean`),
		);
	}

	return { url, contentType, name, srclang, kind, default:isDefault};

	function trackError(message) {
		return `invalid track at index ${index}: ${message}`;
	}
};

exports.sanitizeManifest = function(object) {
	if (typeof object !== "object" || object === null) {
		throw new Error("invalid manifest: expected object");
	}

	const { title, sources, duration, textTracks, thumbnail} = object;
	if (!Array.isArray(sources)) {
		throw new Error("invalid sources: expected array");
	}
	if (!Array.isArray(textTracks)) {
		throw new Error("invalid textTracks: expected array");
	}

	return {
		title: exports.sanitizeTitle(title),
		duration: exports.sanitizeDuration(duration),
		thumbnail: exports.sanitizeThumbnail(thumbnail),
		sources: sources.map(exports.sanitizeSource),
		textTracks: textTracks.map(exports.sanitizeTrack),
	};
};
