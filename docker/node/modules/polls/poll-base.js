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
	
	constructor(pollService, options) {
		this.service = pollService;
        this.options = options;
	}

	castVote(options, existingVote = null) {
		return { };
	}

	clearVote(vote) {
	}
};