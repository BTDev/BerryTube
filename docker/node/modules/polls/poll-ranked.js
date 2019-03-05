const { PollInstance } = require("./poll-base");
const { events } = require("../log");

const resultCache = Symbol();
exports.RankedPoll = class extends PollInstance {
	get results() {
		if (!this[resultCache])
			this[resultCache] = this.calculateResults();

		return this[resultCache];
	}
	
	get state() {
		return {
			// legacy protocol
			// @TODO: version protocols properly
			creator: this.options.creator,
			title: this.options.title,
			obscure: this.options.isObscured,
			ghost: false,
			pollType: this.options.pollType,
			options: this.options.options.map(o => o.isTwoThirds ? `${o.text} (⅔ required)` : o.text),
			votes: [],

			extended: {
				options: this.options.options,
				results: this.results,
				votes: this.votes
			}
		};
	}

	get obscuredState() {
		return {
			...this.state,
			extended: { options: this.options.options }
		};
	}

	constructor(pollService, options, log) {
		super(pollService, options);
		this.votes = [];
		this.log = log;
		this[resultCache] = null;
	}

	castVote({ optionIndex, rank }, existingVote) {
		const vote = existingVote || { optionIndicies: [] };
		const sanitizedRank = parseInt(rank);

		if (sanitizedRank < 0 || sanitizedRank >= 3)
			throw new Error(`rank must be between 0 and 3`);

		const sanitizedIndex = parseInt(optionIndex);
		if (sanitizedIndex < 0 || sanitizedIndex >= this.options.options.length)
			throw new Error(`optionIndex must be a valid option index`);

		if (optionIndex !== null) {
			const existingIndex = vote.optionIndicies.findIndex(o => o == optionIndex);
			if (existingIndex != -1 && existingIndex != rank)
				throw new Error(`You cannot vote for an option twice`);
		}

		vote.optionIndicies[rank] = optionIndex;

		if (existingVote)
			this.votes[this.votes.indexOf(existingVote)] = vote;
		else
			this.votes.push(vote);

		this[resultCache] = null;
		return vote;
	}

	clearVote(vote) {
		const index = this.votes.indexOf(vote);
		if (index == -1)
			return;

		this.votes.splice(index, 1);
		this[resultCache] = null;
	}

	calculateResults() {
		const { options: { options }, votes } = this;

		const finalOptions = options
			.map((_, i) => ({
				index: i, 
				isExcluded: false, 
				rankDistribution: [0, 0, 0],
				opacity: .2
			}));

		for (let voteIndex = 0; voteIndex < votes.length; voteIndex++) {
			const vote = votes[voteIndex];
			for (let rankIndex = 0; rankIndex < vote.optionIndicies.length; rankIndex++) {
				const optionIndex = vote.optionIndicies[rankIndex];
				if (typeof(optionIndex) !== "undefined") {
					finalOptions[optionIndex].rankDistribution[rankIndex]++;
				}
			}
		}
		
		

		return finalResults;
	}
};
