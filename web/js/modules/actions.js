import { getConfig } from "./bt.js";
import { PromiseSource } from "./lib.js";

const config = getConfig();

const ACTION_SET_STATE = "ACTION_SET_STATE";
const ACTION_SUBSCRIBE = "ACTION_SUBSCRIBE";
const ACTION_UNSUBSCRIBE = "ACTION_UNSUBSCRIBE";
const ACTION_REQUEST = "ACTION_REQUEST";

export class ActionDispatcher {
	constructor() {
		this.handlers = new Map();
		this.middlewares = [];
	}

	async dispatch(action) {
		const { middlewares, handlers } = this;
		await next(action, 0);

		async function next(action, index) {
			if (index >= middlewares.length) {
				const handler = handlers.get(action.type);
				if (!handler) {
					throw new Error(
						`we do not know how to handle an action of type "${
							action.type
						}"`,
					);
				}

				await Promise.resolve(handler(action));
				return;
			}

			return await Promise.resolve(
				middlewares[index](action, a => next(a || action, index + 1)),
			);
		}
	}

	/**
	 *
	 * @param {(action: object, next: (action) => Promise<void>) => Promise<void>} middleware
	 */
	addMiddleware(middleware) {
		this.middlewares.push(middleware);
	}

	handle(type, handler) {
		if (this.handlers.has(type)) {
			throw new Error(
				`We already have a handler for action of type ${type}`,
			);
		}

		this.handlers.set(type, handler);
	}
}

export class Event {
	constructor(isFiber = false, fiberTimeoutInMilliseconds = 5000) {
		this.callbacks = new Set();
		this.isFiber = isFiber;
		this.fiberTimeoutInMilliseconds = fiberTimeoutInMilliseconds;
		this.lastCall = undefined;
		this.actionQueue = isFiber ? [] : null;
		this.isQueueRunning = false;
	}

	subscribe(callback, initCall = false) {
		this.callbacks.add(callback);
		if (initCall && this.lastCall) {
			callback(...this.lastCall);
		}

		return async () => this.callbacks.delete(callback);
	}

	async dispatch(...args) {
		this.lastCall = args;

		if (!this.isFiber) {
			for (const callback of this.callbacks) {
				callback(...args);
			}
			return;
		}

		this.actionQueue.push(
			...Array.from(this.callbacks).map(c => () => c(...args)),
		);

		if (this.isQueueRunning) {
			return;
		}

		try {
			this.isQueueRunning = true;
			while (this.actionQueue.length) {
				const action = this.actionQueue.shift();

				try {
					const promise = new PromiseSource();
					const timeout = window.setTimeout(() => {
						promise.reject("handler timeout...");
					}, this.fiberTimeoutInMilliseconds);

					Promise.resolve(action()).then(result => {
						window.clearTimeout(timeout);
						promise.resolve(result);
					});

					await promise.promise;
				} catch (e) {
					// eslint-disable-next-line no-console
					console.error(e);
				}
			}
		} finally {
			this.isQueueRunning = false;
		}
	}
}

export class Store {
	constructor() {
		this.stateSet = new Event(true);
		this.state = {};
	}

	update(namespaces) {
		const prevState = this.state;
		this.state = { ...this.state, ...namespaces };
		this.stateSet.dispatch(this.state, prevState, namespaces);
	}
}

/**
 * @param {Window} eventTarget
 * @param {EventTarget} parentTarget
 * @param {Store} store
 * @param {string[]} namespaces
 */
export function updateStoreFromPostMessage(
	eventTarget,
	parentTarget,
	store,
	namespaces,
) {
	const namespaceSet = new Set(namespaces);
	eventTarget.addEventListener("message", ({ origin, data }) => {
		if (origin !== config.origin) {
			return;
		}

		if (typeof data !== "object" || data.type !== ACTION_SET_STATE) {
			return;
		}

		const update = {};
		for (const [name, change] of Object.entries(data.namespaces)) {
			if (!namespaceSet.has(name)) {
				continue;
			}

			update[name] = change;
		}

		if (!Object.keys(update).length) {
			return;
		}

		store.update(update);
	});

	if (parentTarget) {
		parentTarget.postMessage(
			{ type: ACTION_SUBSCRIBE, namespaces },
			config.origin,
		);
	}
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

			source.postMessage(envelope, config.origin);

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
				target.postMessage(envelope, config.origin);
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
 * @param {BroadcastChannel} channel
 * @param {Store} store
 * @param {string[]} namespaces
 */
export function broadcastStateToChannel(channel, store, namespaces) {
	const namespaceSet = new Set(namespaces);
	store.stateSet.subscribe((_state, _prevState, namespaces) => {
		const toSet = {};
		for (const [name, data] of Object.entries(namespaces)) {
			if (!namespaceSet.has(name)) {
				continue;
			}

			toSet[name] = data;
		}

		if (Object.keys(toSet).length) {
			channel.postMessage({
				type: ACTION_SET_STATE,
				namespaces: toSet,
			});
		}
	});
}

/**
 *
 * @param {Window} eventReceiver
 * @param {ActionDispatcher} actions
 * @param {string[]} namespaces
 */
export function handleActionsFromPostMessage(eventRoot, actions, namespaces) {
	const namespaceSet = new Set(namespaces);
	eventRoot.addEventListener("message", ({ origin, data }) => {
		if (origin !== config.origin) {
			return;
		}

		if (typeof data !== "object" || data.type !== ACTION_REQUEST) {
			return;
		}

		if (!namespaceSet.has(data.namespace)) {
			// eslint-disable-next-line no-console
			console.error(
				`We received a request to ${
					data.action.type
				}, but we do not expose the namespace ${data.namespace}`,
			);
			return;
		}

		actions.dispatch(data.action);
	});
}

/**
 *
 * @param {Window} eventReceiver
 * @param {ActionDispatcher} actions
 * @param {string[]} namespaces
 */
export function forwardActionsToPostMessage(eventRoot, actions, namespaces) {
	const namespaceSet = new Set(namespaces);
	actions.addMiddleware((action, next) => {
		if (namespaceSet.has(action.namespace)) {
			const actionEnvelope = {
				type: ACTION_REQUEST,
				action,
			};

			eventRoot.postMessage(actionEnvelope, config.origin);
		} else {
			return next(action);
		}
	});
}
