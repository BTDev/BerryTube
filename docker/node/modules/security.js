exports.sanitize = function(string) {
	if (typeof string !== "string") {
		return "I am a lazy hacker, mock me.";
	}

	return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

exports.generateRandomPassword = function(length = 10) {
	return Math.random()
		.toString(36)
		.slice(-length);
};
