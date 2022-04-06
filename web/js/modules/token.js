export class TokenManager extends EventTarget {
    #token = null;
    #listeners = [];

    constructor() {
        super();
        window.addEventListener('message', ({ data, source, origin }) => {
            if (data?.action === 'getToken') {
                this.#listeners.push({ source, origin });
                source.postMessage({ action: 'setToken', token: this.#token }, origin);
            }
        });
    }

    get() {
        return this.#token;
    }

    set(token) {
        this.#token = token;
        this.dispatchEvent(new CustomEvent('token', { detail: { token: this.#token } }));
        for (const { source, origin } of this.#listeners) {
            source.postMessage({ action: 'setToken', token: this.#token }, origin);
        }
    }
}
