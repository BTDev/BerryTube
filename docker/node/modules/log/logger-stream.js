exports.createStreamLogger = (levelStreams, defaultStream = null) => {
	return ({ level, event, createdAt, formatted }) => {
		const toWriteTo = levelStreams.hasOwnProperty(level)
			? levelStreams[level]
			: defaultStream;

		if (!toWriteTo) return;

		toWriteTo.write(
			`<${createdAt.toUTCString()}> ${event}: ${formatted}\n`,
		);
	};
};
