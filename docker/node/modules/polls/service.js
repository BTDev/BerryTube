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
		this.uniqueVoterMap = {partyUsers:{},partyCookies:{},ips:{}};
		this.io = services.io;
		this.sessions = services.sessions;

		this.exposeSocketActions({
			newPoll: this.createPoll.bind(this),
			updatePoll: this.updatePoll.bind(this),
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
			throw new Error("unauthorized");
		}

		const PollType = pollTypes[options.pollType];
		if (!PollType) {
			throw new Error("bad poll type");
		}

		await this.closeCurrentPoll(socket);

		options.creator = socket.session.nick;
		options.creator = options.creator || "some guy";
		this.currentPoll = new PollType(this, this.nextPollId++, options, this.log);
		this.uniqueVoterMap = {partyUsers:{},partyCookies:{},ips:{}};
		await this.publishToAll("newPoll");

		this.log.info(
			events.EVENT_ADMIN_CREATED_POLL,
			`{mod} opened poll {title} ${closePollInSeconds > 0 ? "(will close in {pollTimeout} seconds)" : ""}`,
			{
				mod: getSocketName(socket),
				title: options.title,
				type: "site",
				pollTimeout: closePollInSeconds,
			},
		);
	}

	/**
	 * Updates a poll
	 * Invoked via the "updatePoll" socket action
	 * @param {*} socket socket.io socket that requested this poll be created
	 * @param {any} options the new options to set
	 */
	async updatePoll(socket, { id, closePollInSeconds }) {
		if (!this.auth.can(socket.session, actions.ACTION_CREATE_POLL)) {
			throw new Error("unauthorized");
		}

		if (!this.currentPoll || this.currentPoll.id !== id) {
			return;
		}

		if (typeof closePollInSeconds === "number") {
			this.currentPoll.closePollInSeconds = closePollInSeconds;
			await this.publishToAll("updatePoll");

			this.log.info(
				events.EVENT_ADMIN_UPDATED_POLL,
				`{mod} updated poll {title}: close in ${closePollInSeconds} seconds`,
				{
					mod: getSocketName(socket),
					title: this.currentPoll.options.title,
					type: "site",
					pollTimeout: closePollInSeconds,
				},
			);
		}
	}

	/**
	 * Closes the currently active poll
	 * Invoked via the "closePoll" socket action
	 * @param {*} socket socket.io socket that requested that this poll be closed
	 */
	async closeCurrentPoll(socket = null) {
		if (!this.currentPoll) {
			return;
		}

		if (socket && !this.auth.can(socket.session, actions.ACTION_CLOSE_POLL)) {
			throw new Error("unauthorized");
		}

		const title = this.currentPoll.options.title;
		const mod = getSocketName(socket);
		const logData = { mod, title, type: "site" };

		this.currentPoll.isObscured = false;

		//clear the party
		for (const ip in this.sessions.ipAddresses) {
			this.sessions.ipAddresses[ip].partyRoom.currentVotes = 0;
		}

		try {
			await this.publishToAll("clearPoll");
		} catch (e) {
			// Under some circumstances, publishToAll may fail. We don't want that preventing the poll from being closed, otherwise poisoned polls will prevent new polls
			// from being created until a server restart.
			this.log.error(
				events.EVENT_GENERAL,
				"{mod} closed poll {title}, but there were some errors when we published clearPoll",
				logData,
				e,
			);
		}

		try {
			this.sessions.sessions.forEach(session => delete session[propVoteData]);
		} catch (e) {
			// make sure potential errors above don't prevent us from closing the poll for reals
			this.log.error(
				events.EVENT_GENERAL,
				"{mod} closed poll {title}, but there were some errors when we cleard socket data",
				logData,
				e,
			);
		}

		this.currentPoll = null;
		this.uniqueVoterMap = {};

		this.log.info(events.EVENT_ADMIN_CLOSED_POLL, "{mod} closed poll {title}", logData);
	}

	//cludgy
	canPartyRoomVote(ip, justChecking = false) {
		const pr = this.sessions.ipAddresses[ip].partyRoom;
		const maxxed = (pr.currentVotes >= pr.maxVotes);
		//current logic would allow an extra vote from IP, so throw an error if vote is actually being attempted
		//needs tidying
		if (maxxed && !justChecking)
			throw new Error("Party room has reached its vote cap" );
		return (pr.duration !== 0 && !maxxed);
	}

	voterID(socket) {
		const ip = socket.ip;
		if (!ip) {
			throw new Error("Could not determine IP address of socket");
		}
		const uniq = {key:"ips",val:ip,name:"IP"};
		if (this.canPartyRoomVote(ip)) {
			//maybe later implement specific-user limitations for indefinites?
			if (socket.session.hasNick && socket.session.type >= 0) {
				uniq.key = "partyUsers";
				uniq.val = socket.session.nick;
				uniq.name = "Party User";
			} else if (socket.browserCookie && this.sessions.ipAddresses[ip].partyRoom.duration > 0) {
				//cookie differentiation might abused more, if provided to indefinite(-1) "party rooms"
				//so they'll be limited to nicks
				uniq.key = "partyCookies";
				uniq.val = socket.browserCookie;
				uniq.name = "Party Cookie";
			}
		}
		return uniq;
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
			throw new Error("unauthorized");
		}

		const uniq = this.voterID(socket);
		if (this.uniqueVoterMap[uniq.key].hasOwnProperty(uniq.val) &&
			this.uniqueVoterMap[uniq.key][uniq.val] != socket.id
		) {
			throw new Error(`${uniq.name} "${uniq.val}" has already voted`);
		} 

		const existingVote = socket.session[propVoteData];
		if (existingVote && existingVote.isComplete) {
			throw new Error("session has already voted");
		}

		const newVote = this.currentPoll.castVote(options, existingVote);
		socket.session[propVoteData] = newVote;

		this.uniqueVoterMap[uniq.key][uniq.val] = socket.id;
		if (this.canPartyRoomVote(socket.ip))
			this.sessions.ipAddresses[socket.ip].partyRoom.currentVotes++;
		await this.publishToAll("updatePoll", true);
	}

	/**
	 * Unsets all vote information for a socket
	 * Invoked when the socket disconnects
	 * @param {*} socket socket.io to unset votes for
	 */
	async clearVote(socket) {
		//okay, thought I could use the vote.php referrer for vote retention, but that doesn't seem to show in the socket's headers
		if(socket.retainVote) return;
		const ipAddress = socket.ip;
		const voteData = socket.session[propVoteData];
		if (!voteData) {
			return;
		} else if (ipAddress) { //we don't want to be subtracting if the vote never happened.
			const uniq = this.voterID(socket);
			if (this.canPartyRoomVote(ipAddress))
				this.sessions.ipAddresses[ipAddress].partyRoom.currentVotes--;
			delete this.uniqueVoterMap[uniq.key][uniq.val];
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

					return doPublish ? this.publishTo(session, eventName) : Promise.resolve();
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

		const canSeeVotes = !this.currentPoll.isObscured || this.auth.can(session, actions.CAN_SEE_OBSCURED_POLLS);

		session.emit(eventName, canSeeVotes ? this.currentPoll.state : this.currentPoll.obscuredState);
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
			if (this.currentPoll && this.currentPoll.isObscured && socket.session.type >= 1) {
				this.publishTo(socket.session, "newPoll");
			}
		});
	}
};
