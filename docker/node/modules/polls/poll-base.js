const { sanitize } = require("../security");
const { now } = require("../utils");

const fudgeFactorInSeconds = 2

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
			timeLeftInSeconds: Math.max(0, this.options.closePollInSeconds - timeElapsedInSeconds - fudgeFactorInSeconds),
			creator: this.options.creator,
			title: this.options.title,
			obscure: this.options.isObscured,
			ghost: false,
			pollType: this.options.pollType,
			options: this.options.options.map(o => o.isTwoThirds ? `${o.text} (⅔ required)` : o.text),
			closePollInSeconds: this.options.closePollInSeconds
		};
	}

	get obscuredState() {
		return this.state;
	}
	
	constructor(pollService, {title, options, isObscured, creator, pollType, closePollInSeconds}) {
		this.service = pollService;
		
		// fudge the close time, so the UIs close before the server does
		this.timeLeftInSeconds = closePollInSeconds + fudgeFactorInSeconds;
		this.isTimedPoll = closePollInSeconds > 0;
		this.startedAt = now();

		this.options = {
			creator: sanitize(creator),
			title: sanitize(title), 
			isObscured: !!isObscured,
			options: options.map(op => {
				if (typeof(op) === "string")
					op = { text: op, isTwoThirds: false };
				
				op.text = sanitize(op.text);
				if (!op.text)
					return null;

				op.isTwoThirds = Boolean(op.isTwoThirds);
				return op;
			}).filter(f => f),
			pollType,
			closePollInSeconds
		};
	}

	castVote(options, existingVote = null) {
		return { };
	}

	clearVote(vote) {
	}

	onTick(elapsedMilliseconds) {
		if (!this.isTimedPoll)
			return;

		this.timeLeftInSeconds -= (elapsedMilliseconds / 1000);
		if (this.timeLeftInSeconds > 0)
			return;

		this.service.closeCurrentPoll();
	}
};
