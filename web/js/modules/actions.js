import { PromiseSource } from "./lib.js";
import { getConfig } from "./bt.js";

const config = getConfig();

const ACTION_RESPONSE = "ACTION_RESPONSE";
const ACTION_REQUEST = "ACTION_REQUEST";

export class ActionDispatcher {
	constructor(namespace, postMessage, origin = config.origin) {
		this.namespace = namespace;
		this.innerPostMessage = postMessage;
		this.isQueueActive = false;
		this.nextRequestId = 1;
		this.actions = {};
		this.actionTypes = {};
		this.queue = null;
		this.origin = origin;
	}

	addActionHandler(type, handler) {
		this.actionTypes[type] = handler;
	}

	dispatch(action, timeoutInMilliseconds = 5000) {
		const wrapped = {
			id: this.nextRequestId,
			action,
			promise: new PromiseSource(),
		};

		this.actions[wrapped.id] = wrapped;

		wrapped.timeoutTimeout = window.setTimeout(() => {
			wrapped.promise.reject(new Error("action timed out"));
			delete this.actions[wrapped.id];
		}, timeoutInMilliseconds);

		this.innerPostMessage({
			namespace: this.namespace,
			type: ACTION_REQUEST,
			id: wrapped.id,
			timestamp: new Date().getTime(),
			action,
		});

		return wrapped.promise;
	}

	async receiveMessage({ origin, data }) {
		if (origin !== this.origin) {
			return;
		}

		if (typeof data !== "object" || data.namespace !== this.namespace) {
			return;
		}

		if (data.type === ACTION_RESPONSE) {
			// this is a response to an action that we sent
			const action = this.actions[data.id];
			if (!action) {
				// eslint-disable-next-line no-console
				console.error(`we received a message for an invalid action`);
				return;
			}

			delete this.actions[data.id];
			if (data.isOk) {
				action.promise.resolve(data.result);
			} else {
				action.promise.reject(data.error);
			}
		} else {
			// this is a request to do something
			const type = data.action.type;
			const handler = this.actionTypes[type];
			if (!handler) {
				// eslint-disable-next-line no-console
				console.error(
					`we do not support handling actions of type ${type}`,
				);

				this.innerPostMessage({
					namespace: this.namespace,
					type: ACTION_RESPONSE,
					id: data.id,
					timestamp: new Date().getTime(),
					isOk: false,
					error: "not supported",
				});

				return;
			}

			try {
				const result = await handler(data.action);
				this.innerPostMessage({
					namespace: this.namespace,
					type: ACTION_RESPONSE,
					id: data.id,
					timestamp: new Date().getTime(),
					isOk: true,
					result,
				});
			} catch (e) {
				this.innerPostMessage({
					namespace: this.namespace,
					type: ACTION_RESPONSE,
					isOk: false,
					id: data.id,
					timestamp: new Date().getTime(),
					error: e.message || e.toString(),
				});
			}
		}
	}
}
