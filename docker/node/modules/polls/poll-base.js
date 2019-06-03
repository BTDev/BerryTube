const { now } = require("../utils");

// fudge the close time, so the UIs close before the server does
const fudgeFactorInSeconds = 1;

exports.PollInstance = class {
	set isObscured(value) {
		this.options.isObscured = value;
	}

	get isObscured() {
		return this.options.isObscured;
	}

	get state() {
		const timeElapsedInSeconds = (now() - this.startedAt) / 1000;
		return {
			id: this.id,
			isObscured: false,
			closePollInSeconds: this.options.closePollInSeconds || 0,
			timeElapsedInSeconds,
		};
	}

	get obscuredState() {
		return {
			...this.state,
			isObscured: true,
		};
	}

	constructor(pollService, id, options) {
		const { closePollInSeconds } = options;
		this.timeLeftInSeconds = closePollInSeconds + fudgeFactorInSeconds;
		this.isTimedPoll = closePollInSeconds > 0;
		this.startedAt = this.isTimedPoll ? now() : 0;

		this.id = id;
		this.service = pollService;
		this.options = options;
	}

	castVote() {
		return {};
	}

	clearVote() {}

	onTick(elapsedMilliseconds) {
		if (!this.isTimedPoll) {
			return;
		}

		this.timeLeftInSeconds -= elapsedMilliseconds / 1000;
		if (this.timeLeftInSeconds > 0) {
			return;
		}

		this.service.closeCurrentPoll();
	}
};
