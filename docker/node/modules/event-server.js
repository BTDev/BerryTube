const http = require('http');
const url = require('url');

class EventServer {
	constructor(port) {
		// events appearing in this object are sent to new clients when they connect
		this.latests = {
			videoChange: null,
			drinkCount: null
		};

		this.responses = [];

		this.native = http.createServer();
		this.native.on('request', this.handleRequest.bind(this));
		this.native.listen(port);

		setInterval(this.keepalive.bind(this), 1000 * 15);
	}

	handleRequest(req, res) {
		try {
			if (req.method !== 'GET') {
				res.writeHead(405).end('invalid method');
				return;
			}

			if (req.url === '/sse') {
				res.writeHead(200, {
					'Connection': 'close',
					'Cache-Control': 'no-store',
					'Content-Type': 'text/event-stream; charset=utf-8',
					'X-Accel-Buffering': 'no'
				}).write(': connected\n');
				for (const body of Object.values(this.latests)) {
					if (body) {
						res.write(body, 'utf8');
					}
				}
				this.responses.push(res);
				return;
			}

			res.writeHead(404).end('not found');
		} catch (e) {
			// client closed or something
		}
	}

	emit(event, data) {
		let body = '';
		if (event) {
			body += 'event: ' + event + '\n';
		}
		if (data != null) {
			if (typeof data === 'object') {
				data = JSON.stringify(data);
			} else if (typeof data !== 'string') {
				data = '' + data;
			}
			body += 'data: ' + data.replace(/\n/g, '\ndata: ') + '\n';
		}
		body += '\n';
		if (event && this.latests.hasOwnProperty(event)) {
			this.latests[event] = body;
		}
		this._send(body);
	}

	keepalive() {
		this._send(': keepalive\n');
	}

	_send(data) {
		this.responses = this.responses.filter((res) => {
			try {
				res.write(data, 'utf8');
			} catch (e) {
				// client closed or something
				return false;
			}
			return true;
		});
	}
}

exports.EventServer = EventServer;

