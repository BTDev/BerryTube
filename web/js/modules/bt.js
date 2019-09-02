export function ensureExists(selector) {
	return new Promise(res => {
		window.whenExists(selector, el => res(el[0]));
	});
}

let config = null;

/**
 * @returns {{ origin: string }}
 */
export function getConfig() {
	if (config !== null) {
		return config;
	}

	if (window.BT) {
		return (config = window.BT);
	}

	return (config = {
		origin: window.ORIGIN,
	});
}
