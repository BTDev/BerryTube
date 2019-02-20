const { sanitize } = require("../security");

exports.PollInstance = class {
	set isObscured(value) {
		this.options.isObscured = value;
	}

	get isObscured() {
		return this.options.isObscured;
	}
	
	get state() {
		return { };
	}

	get obscuredState() {
		return this.state;
	}
	
	constructor(pollService, {title, options, isObscured, creator, pollType}) {
		this.service = pollService;
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
			pollType
		};
	}

	castVote(options, existingVote = null) {
		return { };
	}

	clearVote(vote) {
	}
};