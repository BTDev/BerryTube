const { getAddress, sanitize } = require("../security");
const { actions } = require("../auth");
const { getSocketPropAsync, setSocketPropAsync, socketProps, getSocketName } = require("../socket");
const { ServiceBase } = require("../base");
const { events } = require("../log/events");

const pollTypes = {
	"normal": require("./poll-normal").NormalPoll,
	"ranked": require("./poll-ranked").RankedPoll
};

const propVoteData = {
	get(socket) { return getSocketPropAsync(socket, socketProps.PROP_VOTE_DATA); },
	set(socket, value) { return setSocketPropAsync(socket, socketProps.PROP_VOTE_DATA, value); }
};

exports.PollService = class extends ServiceBase {
	constructor({ auth, io, log }) {
		super({ log, log });
		this.currentPoll = null;
		this.auth = auth;
		this.votedIpAddressMap = {};
		this.io = io;

		this.exposeSocketActions({
			"newPoll": this.createPoll.bind(this),
			"closePoll": this.closeCurrentPoll.bind(this),
			"votePoll": this.castVote.bind(this),
			"disconnect": this.clearVote.bind(this)
		});
	}

	/**
	 * Opens a new poll of arbitrary type
	 * Invoked via the "newPoll" socket action
	 * @param {*} socket socket.io socket that requested this poll be created
	 * @param {any} rawOptions the options to create this poll with
	 */
	async createPoll(socket, rawOptions) {
		const options = {
			...rawOptions,
			title: sanitize(rawOptions.title || ""),
			isObscured: !!rawOptions.obscure,
			pollType: rawOptions.pollType || "normal"
		};
		
		if (!(await this.auth.canDoAsync(socket, actions.ACTION_CREATE_POLL)))
			throw new Error("unauthoirzed");

		const PollType = pollTypes[options.pollType];
		if (!PollType)
			throw new Error("bad poll type");

		await this.closeCurrentPoll(socket);

		options.creator = await getSocketPropAsync(socket, socketProps.PROP_NICK);
		options.creator = options.creator || "some guy";
		this.currentPoll = new PollType(this, options, this.log);
		this.votedIpAddressMap = {};
		await this.publishToAll("newPoll");

		this.log.info(
			events.EVENT_ADMIN_CREATED_POLL, 
			"{mod} opened poll {title} on {type}", { 
				mod: await getSocketName(socket), 
				title: options.title,
				type: "site"});
	}

	/**
	 * Closes the currently active poll
	 * Invoked via the "closePoll" socket action
	 * @param {*} socket socket.io socket that requested that this poll be closed
	 */
	async closeCurrentPoll(socket) {
		if (!this.currentPoll)
			return;

		if (!(await this.auth.canDoAsync(socket, actions.ACTION_CLOSE_POLL)))
			throw new Error("unauthoirzed");

		const title = this.currentPoll.options.title;
		const logData = { mod: await getSocketName(socket), title, type: "site" };

		this.currentPoll.isObscured = false;
		
		try {
			await this.publishToAll("clearPoll");
		} catch(e) {
			// Under some circumstances, publishToAll may fail. We don't want that preventing the poll from being closed, otherwise poisoned polls will prevent new polls
			// from being created until a server restart.
			this.log.error(events.EVENT_GENERAL, "{mod} closed poll {title} on {type}, but there were some errors when we published clearPoll", logData, e);
		}
		
		try {
			await Promise.all(this.io.sockets.clients().map(c => propVoteData.set(c, null)));
		} catch (e) {
			// make sure potential errors above don't prevent us from closing the poll for reals
			this.log.error(events.EVENT_GENERAL, "{mod} closed poll {title} on {type}, but there were some errors when we cleard socket data", logData, e);
		}
		
		this.currentPoll = null;
		this.votedIpAddressMap = {};

		this.log.info(events.EVENT_ADMIN_CLOSED_POLL, "{mod} closed poll {title} on {type}", logData);
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

		if (!(await this.auth.canDoAsync(socket, actions.ACTION_VOTE_POLL)))
			throw new Error("unauthoirzed");

		const ipAddress = getAddress(socket);
		if (!ipAddress)
			throw new Error("Could not determine IP address of socket");

		if (ipAddress != "172.20.0.1" && this.votedIpAddressMap.hasOwnProperty(ipAddress) && this.votedIpAddressMap[ipAddress] != socket.id)
			throw new Error("IP has already voted");

		const existingVote = await propVoteData.get(socket);
		if (existingVote && existingVote.isComplete) 
			throw new Error("socket has already voted");

		const newVote = this.currentPoll.castVote(options, existingVote);
		await propVoteData.set(socket, newVote);

		this.votedIpAddressMap[ipAddress] = socket.id;
		await this.publishToAll("updatePoll");
	}

	/**
	 * Unsets all vote information for a socket
	 * Invoked when the socket disconnects
	 * @param {*} socket socket.io to unset votes for
	 */
	async clearVote(socket) {
		const ipAddress = getAddress(socket);
		if (ipAddress)
			delete this.votedIpAddressMap[ipAddress];

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
	async publishToAll(eventName) {
		if (!this.currentPoll) {
			return;
		}

		if (this.currentPoll.isObscured)
			await Promise.all(this.io.sockets.clients().map(c => this.publishTo(c, eventName)));
		else
			this.io.sockets.emit(eventName, this.currentPoll.state);
	}

	/**
	 * Publishes poll data to the specified socket
	 * @param {*} socket the socket.io socket to send poll data to
	 */
	async publishTo(socket, eventName) {
		if (!this.currentPoll) {
			return;
		}

		const canSeeVotes = !this.currentPoll.isObscured || (await this.auth.canDoAsync(socket, actions.CAN_SEE_OBSCURED_POLLS));

		socket.emit(eventName, canSeeVotes
			? this.currentPoll.state
			: this.currentPoll.obscuredState);
	}

	onSocketConnected(socket) {
		super.onSocketConnected(socket);
		this.publishTo(socket, "newPoll");
	}

	onSocketAuthenticated(socket, type) {
		super.onSocketAuthenticated(socket);
		if (this.currentPoll && this.currentPoll.isObscured && type >= 1)
			this.publishTo(socket, "newPoll");
	}
};
