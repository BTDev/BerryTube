const { isUrl } = require("../utils");

exports.supportedSourceMediaTypes = new Set(["video/mp4"]);

exports.sanitizeTitle = function(title) {
	if (typeof title !== "string") {
		throw new Error("invalid title, expected string");
	}

	if (title.length > 64) {
		title = title.substring(0, 64);
	}

	return title;
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

exports.sanitizeManifest = function(object) {
	if (typeof object !== "object" || object === null) {
		throw new Error("invalid manifest: expected object");
	}

	const { title, sources, duration } = object;
	if (!Array.isArray(sources)) {
		throw new Error("invalid sources: expected array");
	}

	return {
		title: exports.sanitizeTitle(title),
		duration: exports.sanitizeDuration(duration),
		sources: sources.map(exports.sanitizeSource),
	};
};
