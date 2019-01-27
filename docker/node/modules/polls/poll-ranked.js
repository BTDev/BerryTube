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
			...super.state,
			votes: [],
			rankedVotes: this.votes,
			results: this.results
		};
	}

	get obscuredState() {
		return {
			...this.state,
			rankedVotes: "[](/lpno1)",
			results: "[](/lpno1)"
		};
	}

	constructor(pollService, options, log) {
		super(pollService, options);
		this.votes = [];
		this.log = log;
		this[resultCache] = null;
	}

	castVote({ optionIndex, rank }, existingVote) {
		const sanitizedIndex = parseInt(optionIndex);
		const sanitizedRank = parseInt(rank);

		if (sanitizedRank < 0 || sanitizedRank >= 3)
			throw new Error(`rank must be between 0 and 3`);

		if (sanitizedIndex < 0 || sanitizedIndex >= this.options.options.length)
			throw new Error(`optionIndex must be a valid option index`);

		const vote = existingVote || { optionIndicies: [] };
		if (vote.optionIndicies.includes(optionIndex))
			throw new Error(`You cannot vote for an option twice`);

		vote.optionIndicies[rank] = optionIndex;
		vote.isComplete = vote.optionIndicies.length >= 3;

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
			return

		this.votes.splice(index, 1);
		this[resultCache] = null;
	}

	calculateResults() {
		const { options: { options }, votes } = this;

		const finalVoteCounts = options.map((_, i) => ({votes: 0, index: i, isExcluded: false, rankDistribution: [0, 0, 0], opacity: .2}));
		const hasApplied = this.votes.map(() => [false, false, false]);
		let lastMax;
		
		if (votes.length == 0)
			return finalVoteCounts;

		// first, exclude everything that has 0 votes everywhere
		const optionVoteTotalCount = options.map(() => 0);
		for (const vote of this.votes) {
			for (let rank = 0; rank < vote.optionIndicies.length; rank++) {
				const optionIndex = vote.optionIndicies[rank];
				if (typeof(optionIndex) === "undefined")
					continue;

				optionVoteTotalCount[optionIndex]++;
			}
		}
		
		for (let i = 0; i < optionVoteTotalCount.length; i++) {
			if (optionVoteTotalCount[i])
				continue;

			finalVoteCounts[i].isExcluded = true;
		}

		let round = 0;

		while (true) {			
			// tally up all votes, except for ones that are excluded
			const votesForOption = options.map((_, i) => ({votes: 0, index: i}));

			let minVote = 50000;
			let realMin = 50000;
			let maxVote = 0;
			const hasVoted = this.votes.map(f => false);
			
			for (let voteIndex = 0; voteIndex < this.votes.length; voteIndex++) {
				const vote = this.votes[voteIndex];
				for (let rank = 0; rank < vote.optionIndicies.length; rank++) {
					const optionIndex = vote.optionIndicies[rank];
					if (typeof(optionIndex) === "undefined")
						continue;
					
					const finalVoteObject = finalVoteCounts[optionIndex];
					if (!hasApplied[voteIndex][rank]) {
						finalVoteObject.rankDistribution[rank]++;
						hasApplied[voteIndex][rank] = true;
					}

					if (finalVoteObject.isExcluded)
						continue;

					if (!hasVoted[voteIndex]) {
						votesForOption[optionIndex].votes++;
						hasVoted[voteIndex] = true;
					}
				}
			}

			for (let i = 0; i < votesForOption.length; i++) {
				if (finalVoteCounts[i].isExcluded)
					continue;

				const count = votesForOption[i].votes;
				realMin = Math.min(realMin, count);
				minVote = Math.max(realMin, 1);
				maxVote = Math.max(maxVote, count);
			}

			lastMax = maxVote;

			// copy in the latest vote data into our finalVoteCounts
			for (let i = 0; i < votesForOption.length; i++) {
				const option = votesForOption[i];
				const finalData = finalVoteCounts[i];
				
				if (option.votes == 0) {
					// clear out 0 votes
					if (!finalData.isExcluded) {
						finalData.isExcluded = true;
					}

					continue;
				}

				if (finalData.isExcluded)
					continue;

				if (option.votes == minVote) {
					// exclude the first minVote
					// when we exclude, record how many votes this did have
					finalData.votes = option.votes;
					if (!finalData.isExcluded) {
						finalData.isExcluded = true;
					}
				} else
					finalData.votes = option.votes;
			}

			// we are done if there are only maxes left
			var finished = true;
			for (let i = 0; i < finalVoteCounts.length; i++) {
				const option = finalVoteCounts[i];
				if (option.isExcluded)
					continue;

				if (option.votes == maxVote)
					continue;

				finished = false;
				break;
			}

			if (finished)
				break;

			// as a safegarud...
			if (++round > 300) {
				this.log.error(events.EVENT_RUNAWAY_CODE, "we spent {rounds} rounds on this poll :(", { round });
				throw new Error("Too much loop");
			}
		}

		finalVoteCounts.sort((l, r) => r.votes - l.votes);
		
		// pre-calculate the target opacity
		for (let i = 0; i < finalVoteCounts.length; i++) {
			finalVoteCounts[i].opacity = Math.max(finalVoteCounts[i].votes / lastMax, .2);
		}

		return finalVoteCounts;
	}
}