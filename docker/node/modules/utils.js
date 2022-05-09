const url = require("url");

const formatRegex = /\{(\w+)\}/g;
const rawLinkRegex = /(\/)?([^/]*?)\.(mp4|m4v|webm|mov)$/;

/**
 * @argument {string} format the format string; ex: "this is a constant, this is a {match} and {another}"
 * @argument {(type: "constant" | "match", value: string) => {}} onMatch a function that gets invoked for every {match} or constant expression found
 */
exports.parseFormat = function(format, onMatch) {
	let result = null;
	let lastIndex = 0;
	while ((result = formatRegex.exec(format))) {
		const constPart = format.substring(lastIndex, result.index);
		if (constPart.length) {
			onMatch("constant", constPart);
		}

		onMatch("match", result[1]);
		lastIndex = result.index + result[0].length;
	}

	if (lastIndex < format.length - 1) {
		onMatch("constant", format.substring(lastIndex));
	}
};

/**
 * Parses a url to a raw file, and returns information about it.
 * @param { string } rawFileUrl the full URL to the raw file
 * @returns { { title: string } | null }
 */
exports.parseRawFileUrl = function(rawFileUrl) {
	const parts = url.parse(rawFileUrl);
	const { pathname } = parts;

	const match = pathname.match(rawLinkRegex);
	if (!match) {
		return null;
	}

	const [, , title] = match;

	return {
		title,
	};
};

exports.now = function() {
	return new Date().getTime();
};

exports.isUrl = function(maybeUrl) {
	if (typeof maybeUrl !== "string") {
		return false;
	}

	try {
		const parsed = url.parse(maybeUrl);
		return parsed.protocol !== null && parsed.host !== null;
	} catch (e) {
		return false;
	}
};
