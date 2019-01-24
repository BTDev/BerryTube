const { sanitize } = require("../security")

exports.PollInstance = class {
	set isObscured(value) {
		this.options.isObscured = value
	}

	get isObscured() {
		return this.options.isObscured
	}
	
	get state() {
		return {
			creator: this.options.creator,
			title: this.options.title,
			options: this.options.options,
			obscure: this.options.isObscured,
			ghost: false,
			pollType: this.options.pollType
		}
	}

	get obscuredState() {
		return this.state
	}
	
	constructor(pollService, {title, options, isObscured, creator, pollType}) {
		this.service = pollService
        this.options = {
			creator: sanitize(creator),
			title: sanitize(title), 
			isObscured: !!isObscured,
			options: options.map(sanitize).filter(f => f),
			pollType
		}
	}

	castVote(options, existingVote = null) {
		return { }
	}

	clearVote(vote) {
	}
}