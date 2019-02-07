exports.socketProps = {
	PROP_VOTE_DATA: "PROP_VOTE_DATA",
	PROP_NICK: "nick"
};

exports.getSocketPropAsync = function (socket, prop) {
	return new Promise((res, rej) => {
		socket.get(prop, (err, value) => {
			if (err) {
				rej(err)
				return
			};

			res(value);
		});
	});
};

exports.setSocketPropAsync = function (socket, prop, value) {
	return new Promise((res, rej) => {
		socket.set(prop, value, (err) => {
			if (err) {
				rej(err);
				return;
			}

			res();
		});
	});
};

exports.getSocketName = async function (socket) {
	if (!socket)
		return "Server";

	const currentNick = await exports.getSocketPropAsync(socket, exports.socketProps.PROP_NICK);
	return currentNick || "Server";
};

class FakeSocket {
	constructor(data, onEmitSocket) {
		this.data = data || {};
		this.onEmitSocket = onEmitSocket;
		this.handshake = {
			headers: {
				"x-forwarded-for": data.ip
			}
		};
	}

	get(prop, callback) {
		callback(null, this.data[prop]);
	}

	set(prop, value, callback) {
		this.data[prop] = value;
		callback();
	}

	emit(eventName, ...args) {
		this.onEmitSocket(this, eventName, ...args);
	}
}

exports.FakeIo = class {
	constructor(onBroadcast, onEmitSocket) {
		this.sockets = [];
		this.sockets.emit = this.emit.bind(this);
		this.sockets.clients = () => this.sockets;
		this.onBroadcast = onBroadcast;
		this.onEmitSocket = onEmitSocket;
	}

	emit(eventName, ...args) {
		this.onBroadcast(eventName, ...args);
	}

	createSocket(data) {
		const socket = new FakeSocket(data, this.onEmitSocket);
		this.sockets.push(socket);
		return socket;
	}
};