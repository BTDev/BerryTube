const { getAddress } = require("../security")
const { actions } = require("../auth")
const { getSocketPropAsync, setSocketPropAsync, socketProps } = require("../socket")
const { ServiceBase } = require("../base")

const pollTypes = {
	"normal": require("./poll-normal").NormalPoll,
	"ranked": require("./poll-ranked").RankedPoll
}

const propVoteData = {
	get(socket) { return getSocketPropAsync(socket, socketProps.PROP_VOTE_DATA) },
	set(socket, value) { return setSocketPropAsync(socket, socketProps.PROP_VOTE_DATA, value) }
}

exports.PollService = class extends ServiceBase {
	constructor({ debugLog, auth, adminLog, io }) {
		super({ debugLog })
		this.currentPoll = null
		this.debugLog = debugLog
		this.auth = auth
		this.votedIpAddressMap = {}
		this.adminLog = adminLog
		this.io = io

		this.exposeSocketActions({
			"newPoll": this.createPoll.bind(this),
			"closePoll": this.closeCurrentPoll.bind(this),
			"votePoll": this.castVote.bind(this),
			"disconnect": this.clearVote.bind(this)
		})
	}

	/**
	 * Opens a new poll of arbitrary type
	 * Invoked via the "newPoll" socket action
	 * @param {*} socket socket.io socket that requested this poll be created
	 * @param {any} rawOptions the options to create this poll with
	 */
	async createPoll(socket, rawOptions) {
		const options = {
			title: rawOptions.title || "",
			options: rawOptions.ops || [],
			isObscured: !!rawOptions.obscure,
			pollType: rawOptions.pollType || "normal"
		}
		
		if (!(await this.auth.canDoAsync(socket, actions.ACTION_CREATE_POLL))) {
			this.debugLog("Bad Create Poll.")
			return
		}

		const PollType = pollTypes[options.pollType]
		if (!PollType) {
			this.debugLog("Bad poll type")
			return
		}

		await this.closeCurrentPoll(socket)

		if (!options.options.length) {
			this.debugLog("Bad poll options")
			return
		}

		options.creator = await getSocketPropAsync(socket, socketProps.PROP_NICK)
		options.creator = options.creator || "some guy"
		this.currentPoll = new PollType(this, options)
		this.votedIpAddressMap = {}
		await this.publishToAll("newPoll")
		this.adminLog(socket, { msg: `Created poll '${options.title}'`, type: "site" })
	}

	/**
	 * Closes the currently active poll
	 * Invoked via the "closePoll" socket action
	 * @param {*} socket socket.io socket that requested that this poll be closed
	 */
	async closeCurrentPoll(socket) {
		if (!this.currentPoll)
			return

		if (!(await this.auth.canDoAsync(socket, actions.ACTION_CLOSE_POLL))) {
			this.debugLog("Bad Close Poll.")
			return
		}

		await Promise.all(this.io.sockets.clients().map(c => propVoteData.set(c, null)))
		this.currentPoll.isObscured = false
		await this.publishToAll("clearPoll")
		this.currentPoll = null
		this.votedIpAddressMap = {}
		this.adminLog(socket, { msg: `Closed poll`, type: "site" })
	}

	/**
	 * Casts a vote, with data specific to the current poll's type
	 * Invoked via the "votePoll" socket action
	 * @param {*} socket socket.io socket that requested this vote
	 * @param {*} options the vote data to set - this is different depending on the poll type
	 */
	async castVote(socket, options) {
		if (!this.currentPoll) {
			this.debugLog("Cannot cast vote: no current poll")
			return
		}

		if (!(await this.auth.canDoAsync(socket, actions.ACTION_VOTE_POLL))) {
			this.debugLog("Bad Poll Vote.")
			return
		}

		const ipAddress = getAddress(socket)
		if (ipAddress != "172.20.0.1" && (!ipAddress || this.votedIpAddressMap.hasOwnProperty(ipAddress))) {
			this.debugLog("Cannot cast vote: IP has already voted")
			return // Make sure only one vote per IP is recorded.
		}

		const existingVote = await propVoteData.get(socket)
		if (existingVote && existingVote.isComplete) {
			this.debugLog("Cannot cast vote: socket has already voted")
			return // cannot vote twice
		}

		const newVote = this.currentPoll.castVote(options, existingVote)
		await propVoteData.set(socket, newVote)

		if (newVote.isComplete)
			this.votedIpAddressMap[ipAddress] = true

		await this.publishToAll("updatePoll")
	}

	/**
	 * Unsets all vote information for a socket
	 * Invoked when the socket disconnects
	 * @param {*} socket socket.io to unset votes for
	 */
	async clearVote(socket) {
		const voteData = await propVoteData.get(socket)
		if (!voteData)
			return

		if (!this.currentPoll)
			return

		this.currentPoll.clearVote(voteData)
		await propVoteData.set(socket, null)
		await this.publishToAll("updatePoll")
	}

	/**
	 * Publishes poll data to every client.
	 */
	async publishToAll(eventName, sendClearPoll = true) {
		if (!this.currentPoll) {
			if (sendClearPoll)
				this.io.sockets.emit("clearPoll", { options: [], votes: [] })
			return
		}

		if (this.currentPoll.isObscured)
			await Promise.all(this.io.sockets.clients().map(c => this.publishTo(c, eventName, sendClearPoll)))
		else
			this.io.sockets.emit(eventName, this.currentPoll.state)
	}

	/**
	 * Publishes poll data to the specified socket
	 * @param {*} socket the socket.io socket to send poll data to
	 */
	async publishTo(socket, eventName, sendClearPoll = true) {
		if (!this.currentPoll) {
			if (sendClearPoll)
				socket.emit("clearPoll", { options: [], votes: [] })
			return
		}

		const canSeeVotes = !this.currentPoll.isObscured || (await this.auth.canDoAsync(socket, actions.CAN_SEE_OBSCURED_POLLS))

		socket.emit(eventName, canSeeVotes
			? this.currentPoll.state
			: this.currentPoll.obscuredState)
	}

	onSocketConnected(socket) {
		super.onSocketConnected(socket)
		this.publishTo(socket, "newPoll", false)
	}

	onSocketAuthenticated(socket, type) {
		super.onSocketAuthenticated(socket)
		if (this.currentPoll && this.currentPoll.isObscured && type >= 1)
			this.publishTo(socket, "newPoll", false)
	}
}