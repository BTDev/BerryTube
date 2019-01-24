const {PollInstance} = require("./poll-base")

exports.RankedPoll = class extends PollInstance {
	get state() {
		return {
			...super.state,
			votes: [],
			rankedVotes: this.votes
		}
	}

	get obscuredState() {
		return {
			...this.state,
			rankedVotes: "[](/lpno1)"
		}
	}

	constructor(pollService, options) {
		super(pollService, options)
		this.votes = []
	}

	castVote({optionIndex, rank}, existingVote) {
		const sanitizedIndex = parseInt(optionIndex)
		const sanitizedRank = parseInt(rank)

		if (sanitizedRank < 0 || sanitizedRank >= 3)
			throw new Error(`rank must be between 0 and 3`)

		if (sanitizedIndex < 0 || sanitizedIndex >= this.options.options.length)
			throw new Error(`optionIndex must be a valid option index`)

		const vote = existingVote || {optionIndicies: []}
		if (vote.optionIndicies.includes(optionIndex))
			throw new Error(`You cannot vote for an option twice`)

		vote.optionIndicies[rank] = optionIndex
		vote.isComplete = vote.optionIndicies.length >= 3

		if (existingVote)
			this.votes[this.votes.indexOf(existingVote)] = vote
		else
			this.votes.push(vote)

		return vote
	}

	clearVote(vote) {
		const index = this.votes.indexOf(vote)
		if (index == -1)
			return

		this.votes.splice(index, 1)
	}
}