/* eslint-disable no-console */
const { levels } = require("./service.js");

exports.consoleLogger = ({ level, formatted, error, event, createdAt }) => {
	formatted = `<${createdAt.toUTCString()}> ${event}: ${formatted}`;

	if (level == levels.LEVEL_ERROR) {
		console.error(formatted);

		if (error) {
			if (error.stack) {
				console.error(error.stack);
			} else {
				console.error(`error: ${error}`);
			}
		}
	} else {
		console.log(formatted);

		if (error) {
			if (error.stack) {
				console.log(error.stack);
			} else {
				console.log(`error: ${error}`);
			}
		}
	}
};
