const { PollInstance } = require("./poll-base");

exports.NormalPoll = class extends PollInstance {
	get state() {
		return {
			creator: this.options.creator,
			title: this.options.title,
			obscure: this.options.isObscured,
			ghost: false,
			pollType: this.options.pollType,
			options: this.options.options.map(o => o.isTwoThirds ? `${o.text} (2/3ds)` : o.text),
			votes: this.votes.reduce(
				(arr, vote) => {
					arr[vote.optionIndex]++
					return arr
				},
				this.options.options.map(_ => 0))
		};
	}

	get obscuredState() {
		return {
			...this.state,
			votes: this.options.options.map(_ => "?")
		};
	}

	constructor(pollService, options) {
		super(pollService, options);
		this.votes = [];
	}

	castVote({ op }) {
		const vote = { optionIndex: op, isComplete: true };
		this.votes.push(vote);
		return vote;
	}

	clearVote(vote) {
		const index = this.votes.indexOf(vote);
		if (index == -1)
			return;

		this.votes.splice(index, 1);
	}
};