export class BaseComponent {
	constructor() {
		this.cleanup = [];
	}

	async render(parent, el) {
		this.dispose();
		this.el = el;
		parent.appendChild(this.el);
		this.cleanup.push(() => {
			
		})
	}

	onCleanup(...funcs) {
		this.cleanup.push(...funcs);
	}

	dispose() {
		for (const cleanup of this.cleanup) {
			cleanup();
		}

		this.cleanup = [];

		if (this.el && this.el.parentNode) {
			this.el.parentNode.removeChild(this.el);
		}
	}
}
