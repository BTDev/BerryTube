const { PollInstance } = require("./poll-base");
const { sanitize } = require("../security");
const { events } = require("../log");
const schulze = require("schulze-method");

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
				maxRankCount: this.options.maxRankCount,
				options: this.options.options,
				results: this.results,
				voteCount: this.votes.length
			}
		};
	}

	get obscuredState() {
		return {
			...this.state,
			extended: { 
				options: this.options.options,
				maxRankCount: this.options.maxRankCount
			}
		};
	}

	constructor(pollService, options, log) {
		super(pollService, { 
			...options, 
			options: options.ops.map(o => ({ 
				text: sanitize(o.text), 
				isTwoThirds: !!o.isTwoThirds 
			})),
			maxRankCount: 4
		});

		this.votes = [];
		this.log = log;
		this[resultCache] = null;
	}

	castVote({ ballot }, existingVote) {
		const { options: { options, maxRankCount } } = this;
		const abstainedRank = maxRankCount + 1;
		
		if (!Array.isArray(ballot))
			throw new Error(`Invalid ballot: expected array`);
		
		if (ballot.length != options.length)
			throw new Error(`Invalid ballot: expected ${options.length} rankings, but received: ${ballot.length}`);

		const vote = { ballot: ballot.map(Number) };
		for (const ranking of vote.ballot)
			if (ranking < 1 || ranking > abstainedRank)
				throw new Error(`Invalid ballot: all rankings in the ballot must be between 1 and ${abstainedRank}`)

		const existingIndex = this.votes.indexOf(existingVote);
		if (existingIndex !== -1)
			this.votes[existingIndex] = vote;
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
		const { options: { options, maxRankCount }, votes } = this;

		const initialDistribution = new Array(maxRankCount + 1);
		for (let rank = 0; rank < initialDistribution.length; rank++)
			initialDistribution[rank] = 0;

		const finalResults = options
			.map((_, i) => ({
				index: i,
				isExcluded: false,
				ballots: initialDistribution.slice(),
				rank: maxRankCount + 1
			}));

		for (let voteIndex = 0; voteIndex < votes.length; voteIndex++) {
			const ballot = votes[voteIndex].ballot;
			for (let optionIndex = 0; optionIndex < ballot.length; optionIndex++) {
				const rank = ballot[optionIndex];
				if (rank != maxRankCount)
					finalResults[optionIndex].ballots[rank]++;
			}
		}

		const ballots = this.votes.map(v => v.ballot);
		const results = schulze.run(options.length, ballots);

		for (let finalRank = 0; finalRank < results.length; finalRank++) {
			const optionsInThisRank = results[finalRank].indexes;
			for (let i = 0; i < optionsInThisRank.length; i++) {
				const optionIndex = optionsInThisRank[i];
				finalResults[optionIndex].rank = finalRank;
			}
		}

		finalResults.sort((l, r) => l.rank - r.rank);
		return finalResults;
	}
};
