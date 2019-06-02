export function ensureExists(selector) {
	return new Promise(res => {
		window.whenExists(selector, el => res(el[0]));
	});
}
