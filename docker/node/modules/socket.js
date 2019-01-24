exports.socketProps = {
	PROP_VOTE_DATA: "PROP_VOTE_DATA",
	PROP_NICK: "nick"
}

exports.getSocketPropAsync = function(socket, prop) {
	return new Promise((res, rej) => {
		socket.get(prop, (err, value) => {
			if (err) {
				rej(err)
				return
			}

			res(value)
		})
	})
}

exports.setSocketPropAsync = function(socket, prop, value) {
	return new Promise((res, rej) => {
		socket.set(prop, value, (err) => {
			if (err) {
				rej(err)
				return
			}

			res()
		})
	})
}