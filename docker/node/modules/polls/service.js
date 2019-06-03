const { sanitize } = require("../security");
const { actions } = require("../auth");
const { getSocketName } = require("../sessions");
const { ServiceBase } = require("../base");
const { events } = require("../log/events");

const pollTypes = {
	normal: require("./poll-normal").NormalPoll,
	ranked: require("./poll-ranked").RankedPoll,
};

const propVoteData = Symbol("#propVoteData");

exports.PollService = class extends ServiceBase {
	constructor(services) {
		super(services);
		this.nextPollId = 1;
		this.currentPoll = null;
		this.auth = services.auth;
		this.votedIpAddressMap = {};
		this.io = services.io;
		this.sessions = services.sessions;

		this.exposeSocketActions({
			newPoll: this.createPoll.bind(this),
			closePoll: this.closeCurrentPoll.bind(this),
			votePoll: this.castVote.bind(this),
			disconnect: this.clearVote.bind(this),
		});
	}

	/**
	 * Opens a new poll of arbitrary type
	 * Invoked via the "newPoll" socket action
	 * @param {*} socket socket.io socket that requested this poll be created
	 * @param {any} rawOptions the options to create this poll with
	 */
	async createPoll(socket, rawOptions) {
		const closePollInSeconds = parseInt(rawOptions.closePollInSeconds || 0);
		const options = {
			...rawOptions,
			title: sanitize(rawOptions.title || ""),
			isObscured: !!rawOptions.obscure,
			pollType: rawOptions.pollType || "normal",
			closePollInSeconds,
		};

		if (!this.auth.can(socket.session, actions.ACTION_CREATE_POLL)) {
			throw new Error("unauthoirzed");
		}

		const PollType = pollTypes[options.pollType];
		if (!PollType) {
			throw new Error("bad poll type");
		}

		await this.closeCurrentPoll(socket);

		options.creator = socket.session.nick;
		options.creator = options.creator || "some guy";
		this.currentPoll = new PollType(
			this,
			this.nextPollId++,
			options,
			this.log,
		);
		this.votedIpAddressMap = {};
		await this.publishToAll("newPoll");

		this.log.info(
			events.EVENT_ADMIN_CREATED_POLL,
			`{mod} opened poll {title} on {type} ${
				closePollInSeconds > 0
					? "(will close in {pollTimeout} seconds)"
					: ""
			}`,
			{
				mod: getSocketName(socket),
				title: options.title,
				type: "site",
				pollTimeout: closePollInSeconds,
			},
		);
	}

	/**
	 * Closes the currently active poll
	 * Invoked via the "closePoll" socket action
	 * @param {*} socket socket.io socket that requested that this poll be closed
	 */
	async closeCurrentPoll(socket = null) {
		if (!this.currentPoll) return;

		if (socket && !this.auth.can(socket.session, actions.ACTION_CLOSE_POLL))
			throw new Error("unauthoirzed");

		const title = this.currentPoll.options.title;
		const mod = getSocketName(socket);
		const logData = { mod, title, type: "site" };

		this.currentPoll.isObscured = false;

		try {
			await this.publishToAll("clearPoll");
		} catch (e) {
			// Under some circumstances, publishToAll may fail. We don't want that preventing the poll from being closed, otherwise poisoned polls will prevent new polls
			// from being created until a server restart.
			this.log.error(
				events.EVENT_GENERAL,
				"{mod} closed poll {title} on {type}, but there were some errors when we published clearPoll",
				logData,
				e,
			);
		}

		try {
			this.sessions.sessions.forEach(
				session => delete session[propVoteData],
			);
		} catch (e) {
			// make sure potential errors above don't prevent us from closing the poll for reals
			this.log.error(
				events.EVENT_GENERAL,
				"{mod} closed poll {title} on {type}, but there were some errors when we cleard socket data",
				logData,
				e,
			);
		}

		this.currentPoll = null;
		this.votedIpAddressMap = {};

		this.log.info(
			events.EVENT_ADMIN_CLOSED_POLL,
			"{mod} closed poll {title} on {type}",
			logData,
		);
	}

	/**
	 * Casts a vote, with data specific to the current poll's type
	 * Invoked via the "votePoll" socket action
	 * @param {*} socket socket.io socket that requested this vote
	 * @param {*} options the vote data to set - this is different depending on the poll type
	 */
	async castVote(socket, options) {
		if (!this.currentPoll) {
			throw new Error("no current poll");
		}

		if (!this.auth.can(socket.session, actions.ACTION_VOTE_POLL)) {
			throw new Error("unauthoirzed");
		}

		const ipAddress = socket.ip;
		if (!ipAddress) {
			throw new Error("Could not determine IP address of socket");
		}

		if (
			ipAddress != "172.20.0.1" &&
			this.votedIpAddressMap.hasOwnProperty(ipAddress) &&
			this.votedIpAddressMap[ipAddress] != socket.id
		) {
			throw new Error("IP has already voted");
		}

		const existingVote = socket.session[propVoteData];
		if (existingVote && existingVote.isComplete) {
			throw new Error("session has already voted");
		}

		const newVote = this.currentPoll.castVote(options, existingVote);
		socket.session[propVoteData] = newVote;

		this.votedIpAddressMap[ipAddress] = socket.id;
		await this.publishToAll("updatePoll", true);
	}

	/**
	 * Unsets all vote information for a socket
	 * Invoked when the socket disconnects
	 * @param {*} socket socket.io to unset votes for
	 */
	async clearVote(socket) {
		const ipAddress = socket.ip;
		if (ipAddress) {
			delete this.votedIpAddressMap[ipAddress];
		}

		const voteData = socket.session[propVoteData];
		if (!voteData) {
			return;
		}

		if (!this.currentPoll) {
			return;
		}

		this.currentPoll.clearVote(voteData);
		delete socket.session[propVoteData];
		await this.publishToAll("updatePoll");
	}

	/**
	 * Publishes poll data to every client.
	 */
	async publishToAll(eventName, publishOnlyToAuthorizedSockets = false) {
		if (!this.currentPoll) {
			return;
		}

		if (this.currentPoll.isObscured) {
			await Promise.all(
				this.sessions.sessions.map(session => {
					const doPublish =
						!this.currentPoll.isObscured ||
						!publishOnlyToAuthorizedSockets ||
						this.auth.can(session, actions.CAN_SEE_OBSCURED_POLLS);

					return doPublish
						? this.publishTo(session, eventName)
						: Promise.resolve();
				}),
			);
		} else {
			this.io.sockets.emit(eventName, this.currentPoll.state);
		}
	}

	/**
	 * Publishes poll data to the specified socket
	 * @param {*} session the session to send poll data to
	 */
	async publishTo(session, eventName) {
		if (!this.currentPoll) {
			return;
		}

		const canSeeVotes =
			!this.currentPoll.isObscured ||
			this.auth.can(session, actions.CAN_SEE_OBSCURED_POLLS);

		session.emit(
			eventName,
			canSeeVotes
				? this.currentPoll.state
				: this.currentPoll.obscuredState,
		);
	}

	onTick(elapsedMilliseconds) {
		if (!this.currentPoll) {
			return;
		}

		this.currentPoll.onTick(elapsedMilliseconds);
	}

	onSocketConnected(socket) {
		super.onSocketConnected(socket);

		this.publishTo(socket.session, "newPoll");

		socket.addOnAuthenticatedHandler(() => {
			if (
				this.currentPoll &&
				this.currentPoll.isObscured &&
				socket.session.type >= 1
			) {
				this.publishTo(socket.session, "newPoll");
			}
		});
	}
};
