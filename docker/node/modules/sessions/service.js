const crypto = require("crypto");
const bcrypt = require("bcrypt");

const settings = require("../../bt_data/settings");
const nickBlacklist = require("../../bt_data/nick_blacklist");

const { ServiceBase } = require("../base");
const { events } = require("../log");
const { actions } = require("../auth");
const { Session, userTypes } = require("./session");
const { now } = require("../utils");

let nextSessionId = 1;
exports.SessionService = class extends ServiceBase {
	get hasBerry() {
		return !!this.berrySession;
	}

	constructor(services) {
		super(services);
		this.services = services;
		this.io = services.io;
		this.auth = services.auth;
		this.log = services.log;
		this.db = services.db;
		this.isUserBanned = services.isUserBanned;
		this.banUser = services.banUser;
		this.berrySession = null;
		this.setServerState = services.setServerState;

		this.ipAddresses = {};

		this.sessions = [];
		this.sessionsByNick = {};
		this.sessionsById = {};

		this.sockets = [];
		this.socketsById = {};

		this.exposeSocketActions({
			disconnect: this.onSocketDisconnected.bind(this),
			setNick: this.login.bind(this),
		});
	}

	setBerry(sessionOrNull) {
		if (this.berrySession === sessionOrNull) {
			return;
		}

		if (this.berrySession) {
			this.berrySession.emit("setLeader", false);
		}

		this.berrySession = sessionOrNull;

		if (this.berrySession) {
			this.berrySession.emit("setLeader", true);
			this.io.sockets.emit("leaderIs", {
				nick: this.berrySession.nick,
			});
		} else {
			this.io.sockets.emit("leaderIs", {
				nick: false,
			});

			this.setServerState(1);
		}
	}

	setShadowbanForNick(nick, is, isTemp) {
		this.forNick(nick, session => {
			const ips = new Set();
			for (const socket of session.sockets) {
				ips.add(socket.ip);
			}

			for (const ip of ips) {
				this.setShadowbanForIp(ip, is, isTemp);
			}
		});
	}

	setShadowbanForIp(ip, is, isTemp = false) {
		const entry = this.getIpEntry(ip);

		if (entry.shadowban.timer) {
			clearTimeout(entry.shadowban.timer);
		}

		if (isTemp) {
			entry.shadowban.timer = setTimeout(() => {
				this.setShadowbanForIp(ip, false, false);
			}, settings.core.temp_ban_duration);
		}

		entry.shadowban.is = is;
		entry.shadowban.isTemp = isTemp;
		this.sendShadowbanStatusToMods(ip);
	}

	sendShadowbanStatusToMods(ip) {
		const entry = this.getIpEntry(ip);
		const nicks = this.getSessionsForIp(ip)
			.filter(s => s.hasNick)
			.map(s => s.nick);

		if (entry.shadowban.is) {
			this.forCan(actions.CAN_SEE_SHADOWBANS, s =>
				nicks.forEach(nick => {
					s.emit("shadowBan", { nick, temp: entry.shadowban.isTemp });
				}),
			);
		} else {
			this.forCan(actions.CAN_SEE_SHADOWBANS, s =>
				nicks.forEach(nick => {
					s.emit("unShadowBan", {
						nick,
					});
				}),
			);
		}
	}

	getShadowbanInfoForIp(ip) {
		return this.getIpEntry(ip).shadowban;
	}

	getSessionsForIp(ip) {
		const sessions = new Set();
		const entry = this.getIpEntry(ip);
		for (const socket of entry.sockets) {
			sessions.add(socket.session);
		}

		return Array.from(sessions);
	}

	forCan(action, func) {
		for (const session of this.sessions) {
			if (!this.auth.can(session, action)) {
				continue;
			}

			func(session);
		}
	}

	forNick(nick, func, defaultValue = false) {
		const session = this.sessionsByNick[nick.toLowerCase()];
		if (session) {
			return func(session);
		}

		return defaultValue;
	}

	/**
	 * Gets an object that represents an ip adress
	 * @param {string} ip the ip entry to find
	 * @return {IpAddressEntry}
	 */
	getIpEntry(ip) {
		return (
			this.ipAddresses[ip] ||
			(this.ipAddresses[ip] = new IpAddressEntry(ip))
		);
	}

	/**
	 * Connects a raw socket io socket to our sessions system and stuff.
	 * @param {*} ioSocket raw socket object from socket.io
	 * @return {berrySocket | null} the socket if it was accepted, null if rejected
	 */
	fromIoSocket(ioSocket) {
		const ip = ioSocket.handshake.headers["x-forwarded-for"];
		if (!ip) {
			this.log.info(
				events.EVENT_SOCKET,
				"rejecting socket because it has no IP",
			);
			return null;
		}

		const ipEntry = this.getIpEntry(ip);
		if (ipEntry.sockets.length > settings.core.max_connections_per_ip) {
			this.log.info(
				events.EVENT_SOCKET,
				"rejecting socket from {ip} because there are more than {maxConnections} connections",
				{
					ip,
					maxConnections: settings.core.max_connections_per_ip,
				},
			);
			return null;
		}

		const session = new Session(this.services, nextSessionId);
		nextSessionId++;

		const berrySocket = session.addIoSocket(ioSocket);

		this.sessions.push(session);
		this.sessionsById[session.id] = session;

		this.sockets.push(berrySocket);
		this.socketsById[ioSocket.id] = berrySocket;

		ipEntry.addSocket(berrySocket);

		const userCount = this.sessions.length;
		const socketCount = this.sockets.length;

		this.io.sockets.emit("numConnected", { num: userCount });
		this.log.info(
			events.EVENT_SOCKET,
			"socket joined from ip {ip}, total users: {userCount}, total sockets: {socketCount}",
			{ ip, userCount: userCount, socketCount },
		);

		this.sendUserListToSocket(berrySocket);
		return berrySocket;
	}

	removeSession(session, supressLog = false) {
		if (session === this.berrySession) {
			this.setBerry(null);
		}

		const index = this.sessions.indexOf(session);
		if (index === -1) {
			return;
		}

		this.sessions.splice(index, 1);

		delete this.sessionsById[session.id];
		if (session.hasNick) {
			delete this.sessionsByNick[session.nick.toLowerCase()];
		}

		session.disconnect();
		this.io.sockets.emit("numConnected", { num: this.sessions.length });

		if (session.hasNick) {
			this.io.sockets.emit("userPart", {
				nick: session.nick,
			});
		}

		if (!supressLog) {
			const userCount = this.sessions.length;
			const socketCount = this.sockets.length;
			this.log.info(
				events.EVENT_USER_LEFT,
				"{session} left, total users: {userCount}, total sockets: {socketCount}",
				{
					session: session.systemName,
					userCount: userCount,
					socketCount,
				},
			);
		}
	}

	async login(socket, data) {
		const { success, nick, type, meta } = await this.attemptLogin(
			socket,
			data,
		);

		if (!success) {
			return;
		}

		const entry = this.getIpEntry(socket.ip);
		entry.aliases.push(nick);

		// ???
		entry.timestamp = now();

		// now the amgic... attempt to merge this socket into an existing session
		let session = this.sessionsByNick[nick.toLowerCase()];
		if (session) {
			// we need to kill the socket that the session is currently a part of
			const oldSession = socket.session;
			if (oldSession !== session) {
				oldSession.removeSocket(socket);
				if (oldSession.isEmpty) {
					this.removeSession(oldSession, true);
				}

				session.addSocket(socket);
			}
		} else {
			// easy... just promote the session that was created by the socket into a user
			session = socket.session;
			session.login(nick, type, meta);
			this.sessionsByNick[nick.toLowerCase()] = session;

			const publicData = session.publicData;
			const privilegedData = session.privilegedData;

			for (const otherSession of this.sessions) {
				otherSession.emit(
					"userJoin",
					this.auth.can(
						otherSession,
						actions.CAN_SEE_PRIVILEGED_USER_DATA,
					)
						? privilegedData
						: publicData,
				);
			}
		}

		if (this.auth.can(session, actions.CAN_SEE_PRIVILEGED_USER_DATA)) {
			// re-dispatch the user list if we can now see privalged data
			this.sendUserListToSocket(socket);
		}

		if (this.berrySession && session === this.berrySession) {
			this.berrySession.emit("setLeader", true);
		}

		const userCount = this.sessions.length;
		const socketCount = this.sockets.length;
		this.log.info(
			events.EVENT_LOGIN,
			"{session} joined, total users: {userCount}, total sockets: {socketCount}",
			{ session: session.systemName, userCount: userCount, socketCount },
		);
	}

	sendUserListToSocket(socket) {
		const canSeePrivilegedData = this.auth.can(
			socket.session,
			actions.CAN_SEE_PRIVILEGED_USER_DATA,
		);

		const users = [];
		if (canSeePrivilegedData) {
			for (const session of this.sessions) {
				if (session.type <= userTypes.LURKER) {
					continue;
				}

				users.push({
					...session.privilegedData,
					aliases: this.getAliasesFromSession(session),
				});
			}
		} else {
			for (const session of this.sessions) {
				if (session.type <= userTypes.LURKER) {
					continue;
				}

				users.push(session.publicData);
			}
		}

		socket.emit("newChatList", users);

		if (this.berrySession) {
			socket.emit("leaderIs", this.berrySession.nick);
		}
	}

	getAliasesFromSession(session) {
		const aliases = new Set();
		for (const socket of session.sockets) {
			const entry = this.getIpEntry(socket.ip);
			for (const alias of entry.aliases) {
				aliases.add(alias);
			}
		}

		return Array.from(aliases);
	}

	async attemptLogin(socket, data) {
		const that = this;
		const ip = socket.ip;
		let { nick, pass: password } = data;

		if (!ip) {
			return sendFailMessage("No ip for socket, cannot login.", false);
		}

		if (!this.getIpEntry(ip).canLogin(nick)) {
			return sendFailMessage("Too many login attempts", false);
		}

		if (
			!nick.match(/^[0-9a-zA-Z_]+$/) ||
			nick.length < 1 ||
			nick.length > 15
		) {
			return sendFailMessage("Bad nick.");
		}

		if (this.forNick(nick, s => s.type <= userTypes.ANONYMOUS, false)) {
			return sendFailMessage("Nick already taken");
		}

		const existingBan = this.isUserBanned({ ips: [ip], nicks: [nick] });

		const { result } = await this.db.query`
			SELECT
				*
			FROM
				users
			WHERE
				name = ${nick}`;

		if (result.length === 0) {
			if (nickBlacklist.has(nick.toLowerCase())) {
				return sendFailMessage("Username blacklisted");
			}

			if (existingBan) {
				this.banUser({
					ips: [ip],
					nicks: [],
					duration: existingBan.duration,
				});

				socket.session.kick("You have been banned");
				return sendFailMessage("You have been banned");
			}

			return { success: true, type: userTypes.ANONYMOUS, meta: {}, nick };
		} else if (result.length !== 1) {
			return sendFailMessage("Multiple users for same nick. wut.");
		}

		const dbUser = result[0];

		// correct casing
		nick = dbUser.name;

		// since a user was found, we do a different bancheck, this time we pass the nick as
		// opposed to thethe anon bancheck where we did not
		if (existingBan) {
			this.banUser({
				ips: [ip],
				nicks: [nick],
				duration: existingBan.duration,
			});

			socket.session.kick("You have been banned");
			return sendFailMessage("You have been banned");
		}

		if (!password) {
			return sendFailMessage("No password provided.");
		}

		const md5Password = crypto
			.createHash("md5")
			.update(password)
			.digest("hex");

		if (md5Password === dbUser.pass) {
			const newPassword = await bcrypt.hash(
				password,
				settings.core.bcrypt_rounds,
			);

			// this is an old style password, update it
			await this.db.query`
				UPDATE
					users
				SET
					pass = ${newPassword}
				WHERE
					name = ${nick}`;
		} else if (!(await bcrypt.compare(password, dbUser.pass))) {
			return sendFailMessage("Invalid password");
		}

		let meta;

		try {
			meta = JSON.parse(dbUser.meta);
		} catch (e) {
			this.log.error(
				events.EVENT_GENERAL,
				"Failed to parse user meta for {nick}",
				{ nick },
				e,
			);
		}

		meta = typeof meta === "object" && meta !== null ? meta : {};
		return { success: true, type: dbUser.type, meta, nick };

		function sendFailMessage(reason, addToFail = true) {
			if (addToFail) {
				that.getIpEntry(ip).onFailedToLogin(nick);
			}

			that.log.error(
				events.EVENT_LOGIN,
				"{nick} could not log from ip {ip} because {reason}",
				{ ip: socket.ip, nick: data.nick, reason },
			);

			socket.emit("loginError", {
				message: reason,
			});

			return { success: false };
		}
	}

	onSocketDisconnected(socket) {
		const ip = socket.ip;
		if (ip) {
			const ipEntry = this.getIpEntry(ip);
			ipEntry.removeSocket(socket);
		}

		delete this.socketsById[socket.id];

		const index = this.sockets.indexOf(socket);
		if (index !== -1) {
			this.sockets.splice(index, 1);
		}

		const session = socket.session;
		session.removeSocket(socket);
		if (session.isEmpty) {
			this.removeSession(session);
		} else {
			const userCount = this.sessions.length;
			const socketCount = this.sockets.length;

			this.log.info(
				events.EVENT_SOCKET,
				"socket from ip {ip} disconnected from session {session} total users: {userCount}, total sockets: {socketCount}",
				{
					ip,
					userCount: userCount,
					socketCount,
					session: socket.session.systemName,
				},
			);
		}
	}
};

class IpAddressEntry {
	constructor(ip) {
		this.ip = ip;
		this.aliases = [];
		this.failedLoginAttemptByNick = {};
		this.sockets = [];
		this.shadowban = { is: false, isTemp: false, timer: null };

		// ???
		this.timestamp = now();
	}

	addSocket(socket) {
		this.sockets.push(socket);
	}

	removeSocket(socket) {
		const index = this.sockets.indexOf(socket);
		if (index === -1) {
			return;
		}

		this.sockets.splice(index);
	}

	canLogin(nick) {
		const attempt = this.failedLoginAttemptByNick[nick];
		if (!attempt) {
			return true;
		}

		const elapsed = now() - attempt.time;
		if (elapsed <= settings.core.login_fail_duration) {
			return attempt.count < settings.core.max_failed_logins;
		}

		delete this.failedLoginAttemptByNick[nick];
		return true;
	}

	onFailedToLogin(nick) {
		const attempt = this.failedLoginAttemptByNick[nick];
		if (!attempt) {
			this.failedLoginAttemptByNick[nick] = {
				count: 1,
				time: now(),
			};

			return;
		}

		attempt.count++;
		attempt.time = now();
		return;
	}
}
