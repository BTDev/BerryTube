const { getAddress } = require("../security");
const { actions, $auth } = require("../auth");
const { getSocketPropAsync, setSocketPropAsync, socketProps, getSocketName } = require("../socket");
const { use } = require("../socket-actions");
const { ServiceBase } = require("../base");
const { events, $log } = require("../log");

const pollTypes = {
	"normal": require("./poll-normal").NormalPoll,
	"ranked": require("./poll-ranked").RankedPoll
};

const propVoteData = {
	get(socket) { return getSocketPropAsync(socket, socketProps.PROP_VOTE_DATA); },
	set(socket, value) { return setSocketPropAsync(socket, socketProps.PROP_VOTE_DATA, value); }
};

exports.PollService = class extends ServiceBase {
	constructor(services) {
		super(services);
		this.currentPoll = null;
		this.auth = services.auth;
		this.io = services.io;
		this.votedIpAddressMap = {};
	}

	getSocketApi() {
		return {
			[actions.ACTION_CREATE_POLL]: use(
				$auth([actions.ACTION_CREATE_POLL]),
				$log(events.EVENT_ADMIN_CREATED_POLL, (socket, d) => [
					"{mod} created poll {title} on {type}",
					{ mod: getSocketName(socket), title: d.title, type: "site" }
				]),
				this.createPoll.bind(this)),

			[actions.ACTION_CLOSE_POLL]: use(
				$auth([actions.ACTION_CLOSE_POLL]),
				$log(events.EVENT_ADMIN_CLOSED_POLL, (socket, d) => [
					"{mod} closed poll {title} on {type}",
					{ mod: getSocketName(socket), title: d.title, type: "site" }
				]),
				this.closeCurrentPoll.bind(this)),

			[actions.ACTION_VOTE_POLL]: use(
				$auth([actions.ACTION_VOTE_POLL]),
				this.castVote.bind(this)),

			"disconnect": this.clearVote.bind(this)
		};
	}

	/**
	 * Opens a new poll of arbitrary type
	 * Invoked via the "newPoll" socket action
	 * @param {any} rawOptions the options to create this poll with
	 * @param {*} socket socket.io socket that requested this poll be created
	 */
	async createPoll(socket, rawOptions) {
		const options = {
			title: rawOptions.title || "",
			options: rawOptions.ops || [],
			isObscured: !!rawOptions.obscure,
			pollType: rawOptions.pollType || "normal"
		};

		const PollType = pollTypes[options.pollType]
		if (!PollType)
			throw new Error("bad poll type");

		await this.closeCurrentPoll(socket);

		if (!options.options.length)
			throw new Error("no options");

		options.creator = await getSocketPropAsync(socket, socketProps.PROP_NICK);
		options.creator = options.creator || "some guy";
		this.currentPoll = new PollType(this, options, this.log);
		this.votedIpAddressMap = {};
		await this.publishToAll("newPoll");
	}

	/**
	 * Closes the currently active poll
	 * Invoked via the "closePoll" socket action
	 * @param {*} socket socket.io socket that requested that this poll be closed
	 */
	async closeCurrentPoll(socket) {
		if (!this.currentPoll)
			return;

		const title = this.currentPoll.options.title;
		const logData = { mod: await getSocketName(socket), title, type: "site" };

		try {
			await Promise.all(this.io.sockets.clients().map(c => propVoteData.set(c, null)));
		} catch (e) {
			// make sure potential errors above don't prevent us from closing the poll for reals
			this.log.error(events.EVENT_GENERAL, "{mod} closed poll {title} on {type}, but there were some errors when we cleard socket data", logData, e)
		}

		this.currentPoll.isObscured = false;
		this.currentPoll = null;
		this.votedIpAddressMap = {};

		try {
			await this.publishToAll("clearPoll");
		} catch (e) {
			// Under some circumstances, publishToAll may fail. We don't want that preventing the poll from being closed, otherwise poisoned polls will prevent new polls
			// from being created until a server restart.
			this.log.error(events.EVENT_GENERAL, "{mod} closed poll {title} on {type}, but there were some errors when we published clearPoll", logData, e)
		}
	}

	/**
	 * Casts a vote, with data specific to the current poll's type
	 * Invoked via the "votePoll" socket action
	 * @param {*} socket socket.io socket that requested this vote
	 * @param {*} options the vote data to set - this is different depending on the poll type
	 */
	async castVote(socket, options) {
		if (!this.currentPoll)
			throw new Error("no current poll");

		const ipAddress = getAddress(socket);
		if (ipAddress != "172.20.0.1" && (!ipAddress || this.votedIpAddressMap.hasOwnProperty(ipAddress)))
			throw new Error("IP has already voted");

		const existingVote = await propVoteData.get(socket)
		if (existingVote && existingVote.isComplete)
			throw new Error("socket has already voted");

		const newVote = this.currentPoll.castVote(options, existingVote);
		await propVoteData.set(socket, newVote);

		if (newVote.isComplete)
			this.votedIpAddressMap[ipAddress] = true;

		await this.publishToAll("updatePoll");
	}

	/**
	 * Unsets all vote information for a socket
	 * Invoked when the socket disconnects
	 * @param {*} socket socket.io to unset votes for
	 */
	async clearVote(socket) {
		const voteData = await propVoteData.get(socket);
		if (!voteData)
			return;

		if (!this.currentPoll)
			return;

		this.currentPoll.clearVote(voteData);
		await propVoteData.set(socket, null);
		await this.publishToAll("updatePoll");
	}

	/**
	 * Publishes poll data to every client.
	 */
	async publishToAll(eventName, sendClearPoll = true) {
		if (!this.currentPoll) {
			if (sendClearPoll)
				this.io.sockets.emit("clearPoll", { options: [], votes: [] });
			return;
		}

		if (this.currentPoll.isObscured)
			await Promise.all(this.io.sockets.clients().map(c => this.publishTo(c, eventName, sendClearPoll)));
		else
			this.io.sockets.emit(eventName, this.currentPoll.state);
	}

	/**
	 * Publishes poll data to the specified socket
	 * @param {*} socket the socket.io socket to send poll data to
	 */
	async publishTo(socket, eventName, sendClearPoll = true) {
		if (!this.currentPoll) {
			if (sendClearPoll);
			socket.emit("clearPoll", { options: [], votes: [] });
			return
		}

		const canSeeVotes = !this.currentPoll.isObscured || (await this.auth.canDoAsync(socket, actions.CAN_SEE_OBSCURED_POLLS));

		socket.emit(eventName, canSeeVotes
			? this.currentPoll.state
			: this.currentPoll.obscuredState);
	}

	onSocketConnected(socket) {
		super.onSocketConnected(socket);
		this.publishTo(socket, "newPoll", false);
	}

	onSocketAuthenticated(socket, type) {
		super.onSocketAuthenticated(socket);
		if (this.currentPoll && this.currentPoll.isObscured && type >= 1)
			this.publishTo(socket, "newPoll", false);
	}
}