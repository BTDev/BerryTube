const { PollInstance } = require("./poll-base");
const { sanitize } = require("../security");
const schulze = require("schulze-method");

const resultCache = Symbol();
exports.RankedPoll = class extends PollInstance {
	get results() {
		if (!this[resultCache]) {
			this[resultCache] = this.calculateResults();
		}

		return this[resultCache];
	}

	get state() {
		return {
			...super.state,
			// legacy protocol
			// @TODO: version protocols properly
			creator: this.options.creator,
			title: this.options.title,
			obscure: this.options.isObscured,
			ghost: false,
			pollType: this.options.pollType,
			options: this.options.options.map(o =>
				o.isTwoThirds ? `${o.text} (⅔ required)` : o.text,
			),
			votes: [],

			extended: {
				maxRankCount: this.options.maxRankCount,
				options: this.options.options,
				results: this.results,
				voteCount: this.votes.length,
			},
		};
	}

	get obscuredState() {
		return {
			...this.state,
			isObscured: true,
			extended: {
				options: this.options.options,
				maxRankCount: this.options.maxRankCount,
			},
		};
	}

	constructor(pollService, id, options, log) {
		super(pollService, id, {
			...options,
			options: options.ops.map(o => ({
				text: sanitize(o.text),
				isTwoThirds: !!o.isTwoThirds,
			})),
			maxRankCount: 4,
		});

		this.votes = [];
		this.log = log;
		this[resultCache] = null;
	}

	castVote({ ballot }, existingVote) {
		const {
			options: { options, maxRankCount },
		} = this;
		const abstainedRank = maxRankCount;

		if (!Array.isArray(ballot)) {
			throw new Error(`Invalid ballot: expected array`);
		}

		if (ballot.length != options.length) {
			throw new Error(
				`Invalid ballot: expected ${
					options.length
				} rankings, but received: ${ballot.length}`,
			);
		}

		const vote = { ballot: ballot.map(Number) };
		for (const ranking of vote.ballot) {
			if (ranking < 1 || ranking > abstainedRank) {
				throw new Error(
					`Invalid ballot: all rankings in the ballot must be between 1 and ${abstainedRank}`,
				);
			}
		}

		const existingIndex = this.votes.indexOf(existingVote);
		const isBallotEmpty = vote.ballot.every(b => b == abstainedRank);

		if (!isBallotEmpty) {
			if (existingIndex !== -1) {
				this.votes[existingIndex] = vote;
			} else {
				this.votes.push(vote);
			}
		} else if (existingIndex !== -1) {
			this.votes.splice(existingIndex, 1);
		}

		this[resultCache] = null;
		return vote;
	}

	clearVote(vote) {
		const index = this.votes.indexOf(vote);
		if (index == -1) {
			return;
		}

		this.votes.splice(index, 1);
		this[resultCache] = null;
	}

	calculateResults() {
		const {
			options: { options, maxRankCount },
			votes,
		} = this;

		if (!options.length) {
			return [];
		}

		const initialDistribution = new Array(maxRankCount + 1);
		for (let rank = 0; rank < initialDistribution.length; rank++) {
			initialDistribution[rank] = 0;
		}

		const finalResults = options.map((_, i) => ({
			index: i,
			isExcluded: false,
			ballots: initialDistribution.slice(),
			rank: maxRankCount + 1,
		}));

		const ballots = new Array(votes.length);
		for (let voteIndex = 0; voteIndex < votes.length; voteIndex++) {
			const ballot = (ballots[voteIndex] = votes[voteIndex].ballot);
			for (
				let optionIndex = 0;
				optionIndex < ballot.length;
				optionIndex++
			) {
				const rank = ballot[optionIndex];
				if (rank != maxRankCount) {
					finalResults[optionIndex].ballots[rank]++;
				}
			}
		}

		const results = schulze.run(options.length, ballots);

		for (let finalRank = 0; finalRank < results.length; finalRank++) {
			const optionsInThisRank = results[finalRank].indexes;
			for (let i = 0; i < optionsInThisRank.length; i++) {
				const optionIndex = optionsInThisRank[i];
				finalResults[optionIndex].rank = finalRank;
			}
		}

		finalResults.sort((l, r) => l.rank - r.rank);

		if (votes.length > 0 && applyTwoThirdsMod()) {
			finalResults.sort((l, r) => l.rank - r.rank);

			// the ranks may have gotten out of sequence, so fix that...
			let currentRank = finalResults[0].rank;
			let lastRank = currentRank;
			for (let i = 0; i < finalResults.length; i++) {
				const res = finalResults[i];

				if (res.rank != lastRank) {
					currentRank++;
					lastRank = currentRank;
				}

				res.rank = currentRank;
			}
		}

		return finalResults;

		function applyTwoThirdsMod() {
			// Two thirds is not really a built in feature of the schulze ranking method... so we're gonna fake it:
			//
			// if a two thirds option made it to first place:
			//   move to 2nd place if fewer than 2/3rds of voters voted for the option in any rank
			//   move to 1st place if more than 2/3rds of voters voted for the option in any rank

			// It's possible that multiple two-thirds options make it to the top, so we're going to pick the "best" one
			// based off of how much interest was shown. If equal interest is shown, it's basically a coinflip \\lpshrug
			const twoThirdsCutoff = (2 / 3) * votes.length;
			const twoThirdResultIndicies = [];

			let twoThirdsResultIndex = -1;
			let twoThirdsInterest = 0;

			for (let i = 0; i < finalResults.length; i++) {
				const res = finalResults[i];
				if (res.rank >= 1) {
					break;
				}

				if (!options[res.index].isTwoThirds) {
					continue;
				}

				twoThirdResultIndicies.push(i);
				const interest = count(
					votes,
					({ ballot }) => ballot[res.index] < maxRankCount,
				);

				if (
					interest < twoThirdsCutoff ||
					interest < twoThirdsInterest
				) {
					continue;
				}

				twoThirdsResultIndex = i;
				twoThirdsInterest = interest;
			}

			if (!twoThirdResultIndicies.length) {
				// there were no two-thirds option in the rank of 1
				return false;
			}

			if (twoThirdResultIndicies.length == finalResults.length) {
				// nothing to do because _everything_ is two thirds!
				return false;
			}

			if (twoThirdsResultIndex === -1) {
				// there were some two-third options in the rank of 1, but none are elgiable
				// so stuff the losing two-third options into a new rank all by themselves
				let firstNonTwoThirdsOptionRank = -1;

				for (let i = 0; i < finalResults.length; i++) {
					const res = finalResults[i];
					if (options[res.index].isTwoThirds) {
						continue;
					}

					firstNonTwoThirdsOptionRank = res.rank;
					break;
				}

				for (let i = 0; i < finalResults.length; i++) {
					if (
						finalResults[i].rank <= firstNonTwoThirdsOptionRank &&
						!options[finalResults[i].index].isTwoThirds
					) {
						finalResults[i].rank = 0;
					} else {
						finalResults[i].rank++;
					}
				}

				for (const res of finalResults) {
					if (res.rank <= 1) {
						continue;
					}

					res.rank++;
				}

				return true;
			}

			for (const res of finalResults) {
				res.rank++;
			}

			finalResults[twoThirdsResultIndex].rank = 0;
			return true;
		}
	}
};

function count(arr, predicate) {
	return arr.reduce((a, c) => a + (predicate(c) ? 1 : 0), 0);
}
