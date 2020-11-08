const http = require('http');
const parseUrl = require('url').parse;

class EventServer {
	constructor(port) {
		// stores the latest body of each event, so they can be sent to new clients
		this.latests = {};

		this.responses = [];

		this.native = http.createServer();
		this.native.on('request', this.handleRequest.bind(this));
		this.native.listen(port);

		setInterval(() => {
			this._send('keepalive', ': keepalive\n\n');
		}, 1000 * 15);
	}

	handleRequest(req, res) {
		try {
			if (req.method !== 'GET') {
				res.writeHead(405).end('invalid method');
				return;
			}

			const url = parseUrl(req.url, true);
			if (url.pathname === '/sse') {
				res.writeHead(200, {
					'Connection': 'close',
					'Cache-Control': 'no-store',
					'Content-Type': 'text/event-stream; charset=utf-8',
					'X-Accel-Buffering': 'no'
				});
				res.write(': accepted query parameters:\n', 'utf8');
				res.write(':   events=event,names,here (the client will only receive the listed events)\n', 'utf8');
				res.write(':   backlog=no (the client will not receive a backlog of old events upon connecting)\n', 'utf8');
				res.write('\n', 'utf8');

				if (url.query.events) {
					res._btEvents = new Set(url.query.events.split(','));
				}

				if (!['no', 'false', '0'].includes(url.query.backlog)) {
					res.write(': start of backlog\n\n', 'utf8');
					for (const [event, body] of Object.entries(this.latests)) {
						if (body && (!res._btEvents || res._btEvents.has(event))) {
							res.write(body, 'utf8');
						}
					}
					res.write(': end of backlog\n\n', 'utf8');
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
		if (data) {
			const payload = JSON.stringify({
				...data,
				_eventTime: Math.floor(new Date().getTime() / 1000),
			});
			body += 'data: ' + payload.replace(/\n/g, '\ndata: ') + '\n';
		}
		body += '\n';
		if (event) {
			this.latests[event] = body;
		}
		this._send(event, body);
	}

	_send(event, data) {
		this.responses = this.responses.filter((res) => {
			try {
				// videoStatus is sent every 10 seconds, so keepalives are not needed on connections that receive them
				if (event === 'keepalive' && (!res._btEvents || res._btEvents.has('videoStatus'))) {
					return true;
				}
				if (!event || !res._btEvents || res._btEvents.has(event)) {
					res.write(data, 'utf8');
				}
			} catch (e) {
				// client closed or something
				return false;
			}
			return true;
		});
	}
}

exports.EventServer = EventServer;

