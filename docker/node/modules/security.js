const crypto = require('crypto');

exports.sanitize = function(string) {
	if (typeof string !== "string") {
		return "I am a lazy hacker, mock me.";
	}

	return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

exports.generateRandomPassword = function(length = 20) {
	const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	return Array.from(crypto.randomBytes(length)).map(b => chars[b % chars.length]).join('');
};
