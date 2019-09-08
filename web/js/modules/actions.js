import { PromiseSource } from "./lib.js";
import { getConfig } from "./bt.js";

const config = getConfig();

const ACTION_SET_STATE = "ACTION_SET_STATE";
const ACTION_SUBSCRIBE = "ACTION_SUBSCRIBE";
const ACTION_UNSUBSCRIBE = "ACTION_UNSUBSCRIBE";
const ACTION_REQUEST = "ACTION_REQUEST";
const ACTION_RESPONSE = "ACTION_RESPONSE";

export class ActionDispatcher {
	constructor() {
		this.handlers = new Map();
	}

	async dispatch(action) {
		const handler = this.handlers.get(action.type);
		if (!handler) {
			throw new Error(
				`we do not know how to handle an action of type "${
					action.type
				}"`,
			);
		}

		await handler();
	}
}

export class Event {
	constructor() {
		this.callbacks = new Set();
	}

	subscribe(callback) {
		this.callbacks.add(callback);
		return () => this.callbacks.delete(callback);
	}

	dispatch(...args) {
		for (const callback of this.callbacks) {
			callback(...args);
		}
	}
}

export class Store {
	constructor() {
		this.stateSet = new Event();
		this.state = {};
	}

	update(namespaces) {
		this.state = { ...this.state, ...namespaces };
		this.stateSet(namespaces, this.state);
	}
}

/**
 * @param {Window} eventReceiver
 * @param {Store} store
 * @param {string[]} namespaces
 */
export function updateStoreFromPostMessage(eventReceiver, store, namespaces) {
	const namespaceSet = new Set(namespaces);
	eventReceiver.addEventListener("message", ({ origin, data }) => {
		if (origin !== config.origin) {
			return;
		}

		if (typeof data !== "object" || data.type !== ACTION_SET_STATE) {
			return;
		}

		const update = {};
		for (const [name, data] of Object.entries(data.namespaces)) {
			if (!namespaceSet.has(name)) {
				continue;
			}

			update[name] = data;
		}

		if (!Object.keys(update).length) {
			return;
		}

		store.update(update);
	});

	eventReceiver.postMessage({ type: ACTION_SUBSCRIBE, namespaces });
}

/**
 * @param {Window} eventReceiver
 * @param {Store} store
 * @param {string[]} namespaces
 */
export function provideStoreToPostMessage(eventReceiver, store, namespaces) {
	/**
	 * The set of namespaces that we export
	 * @var {Set<string>[]}
	 */
	const allowedNamespaces = new Set(namespaces);

	/**
	 * A map of sources to an array of namespaces that source subscribes to
	 * @var {WeakMap<EventSource, string[]>}
	 */
	const subscribedSources = new WeakMap();

	/**
	 * A map of namespaces to a list of EventSources that must be notified when that namespace changes.
	 * @var {Map<string, EventSource[]>}
	 */
	const subscriptions = new Map();

	eventReceiver.addEventListener("message", ({ origin, data, source }) => {
		if (origin !== config.origin) {
			return;
		}

		if (typeof data !== "object") {
			return;
		}

		if (data.type === ACTION_SUBSCRIBE) {
			if (subscribedSources.has(source)) {
				throw new Error(`Source attempted to subscribe twice!`);
			}

			const subscribedTo = [];
			for (const namespace of data.namespaces) {
				if (!allowedNamespaces.has(namespace)) {
					// eslint-disable-next-line no-console
					console.error(
						`Cannot subscribe to namespace ${namespace} because we do not provide it`,
					);

					continue;
				}

				let namespaceSubscriptions = subscriptions.get(namespace);
				if (!namespaceSubscriptions) {
					subscriptions.set(namespace, (namespaceSubscriptions = []));
				}

				namespaceSubscriptions.push(source);
				subscribedTo.push(namespace);
			}

			subscribedSources.set(source, subscribedTo);

			const envelope = { type: ACTION_SET_STATE, namespaces: {} };
			for (const namespace of subscribedTo) {
				envelope.namespaces[namespace] = store.state[namespace];
			}

			source.addEventListener("unload", () => {
				// eslint-disable-next-line no-console
				console.info(
					`source ${source} unsubscribed from ${subscribedTo.join(
						", ",
					)}`,
				);

				unsubscribeSource(source);
			});

			source.postMessage(envelope);

			// eslint-disable-next-line no-console
			console.info(
				`source ${source} subscribed to ${subscribedTo.join(", ")}`,
			);
		} else if (data.type === ACTION_UNSUBSCRIBE) {
			unsubscribeSource(source);
		} else {
			return;
		}
	});

	store.stateSet.subscribe(changed => {
		for (const [namespace, data] of Object.entries(changed)) {
			const targets = subscriptions.get(namespace);
			if (!targets) {
				continue;
			}

			const envelope = {
				type: ACTION_SET_STATE,
				namespaces: { [namespace]: data },
			};

			for (const target of targets) {
				target.postMessage(envelope);
			}
		}
	});

	function unsubscribeSource(source) {
		const item = subscribedSources.get(source);
		if (!item) {
			// eslint-disable-next-line no-console
			console.warn(
				`Source attempted to unsubscribe, but we do not have any active subscriptions for it`,
			);

			return;
		}

		for (const namespace of item) {
			const namespaceSubscriptions = subscriptions.get(namespace);
			subscriptions.set(namespaceSubscriptions.filter(s => s === source));
		}

		subscribedSources.delete(source);
	}
}

/**
 *
 * @param {ActionDispatcher} actions
 * @param {Window} eventRoot
 * @param {string[]} namespaces
 */
export function forwardActionsToPostMessage(actions, eventRoot, namespaces) {
	actions.handleNamespaces(namespaces, action => {
		const actionEnvelope = {
			type: ACTION_REQUEST,
			action,
		};

		eventRoot.postMessage(actionEnvelope);
	});
}
