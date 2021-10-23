import { createElement, removeElements, clear, getOrdinal } from "./lib.js";

const rankColors = ["#4b830d", "#005cb2", "#29434e", "#444"];

// the amount of ranks to let the user select

export class RankedPoll {
	constructor(state, mountElement) {
		this._onHideClick = this._onHideClick.bind(this);

		const optionRows = (this.optionRows = []);
		const {
			extended: { options, maxRankCount },
		} = state;

		this.isActive = true;
		let clearVotedButton;
		const pollElement = (this.pollElement = createElement(
			"div",
			{ className: "ranked-poll__split" },
			createElement(
				"div",
				{ className: "ranked-poll_input-panel" },
				createElement("div", { className: "ranked-poll__option-list" }, [
					...options.map((option, optionIndex) =>
						createElement(
							"div",
							{
								className: "ranked-poll__option",
								ref: e => optionRows.push(e),
							},
							[
								...range(maxRankCount).map(rank => {
									const isAbstain = rank + 1 == maxRankCount;
									const el = createElement("button", {
										innerText: !isAbstain ? getOrdinal(rank + 1) : "-",
										onClick: onRankButtonClicked,
										className: `ranked-poll__button ${isAbstain ? "is-abstain" : ""}`,
										"data-rank": rank,
										"data-option-index": optionIndex,
									});
									el.style.setProperty("--rank-color", rankColors[rank]);
									return el;
								}),
								createElement("div", {
									className: `ranked-poll__option-text label ${option.isTwoThirds &&
										"is-two-thirds"}`,
									innerText: option.text,
								}),
							],
						),
					),
					createElement("button", {
						innerText: "clear votes",
						onClick: clearVotes,
						ref: e => (clearVotedButton = e),
						disabled: true,
						className: "ranked-poll__clear-button",
					}),
				]),
			),
			createElement("div", {
				className: "ranked-poll__results-panel",
				ref: e => (this.resultsPanel = e),
			}),
		));

		const ballot = new Array(options.length).fill(maxRankCount, 0, options.length);

		mountElement.appendChild(pollElement);
		updateButtons();
		this.update(state);

		function onRankButtonClicked() {
			const optionIndex = parseInt(this.dataset.optionIndex);
			const rank = parseInt(this.dataset.rank);
			const targetRank = rank + 1;

			if (ballot[optionIndex] !== targetRank) {
				ballot[optionIndex] = rank + 1;
			} else {
				ballot[optionIndex] = maxRankCount;
			}

			window.socket.emit("votePoll", { ballot });
			updateButtons();
		}

		function clearVotes() {
			for (let i = 0; i < ballot.length; i++) {
				ballot[i] = maxRankCount;
			}

			window.socket.emit("votePoll", { ballot });
			updateButtons();
		}

		function updateButtons() {
			let maxVotedRank = 0;
			for (let i = 0; i < ballot.length; i++) {
				const rank = ballot[i];
				if (rank == maxRankCount) {
					continue;
				}

				maxVotedRank = Math.max(maxVotedRank, rank);
			}

			clearVotedButton.disabled = !ballot.some(b => b != maxRankCount);

			for (const button of pollElement.querySelectorAll(`.ranked-poll__button`)) {
				const optionIndex = parseInt(button.dataset.optionIndex);
				const rankIndex = parseInt(button.dataset.rank);
				button.classList.toggle("is-selected", ballot[optionIndex] - 1 == rankIndex);
			}
		}
	}

	update(state) {
		const {
			extended: { options, results },
		} = state;

		if (typeof results !== "object") {
			this.pollElement.classList.add("is-obscured");
			return;
		}

		let maxRank = 0;
		for (let i = 0; i < results.length; i++) {
			maxRank = Math.max(maxRank, results[i].rank + 1);
		}

		this.pollElement.classList.remove("is-obscured");

		clear(this.resultsPanel);

		results
			.map(({ index, ballots, rank }) => {
				const opacity = 1 - rank / maxRank;
				const option = options[index];

				return createElement(
					"div",
					{ className: "ranked-poll__poll-option-result" },
					createElement(
						"div",
						{ className: "ranked-poll__visualizer" },
						createElement("div", {
							className: "ranked-poll__votes",
							innerText: ballots.reduce((c, v) => c + v, 0),
						}),
						createElement(
							"div",
							{ className: "ranked-poll__visual-cells" },
							ballots.map((amount, rank) =>
								createElement("div", {
									className: "ranked-poll__visual-cell",
									style: {
										flexGrow: amount,
										backgroundColor: rankColors[rank - 1],
									},
								}),
							),
						),
					),
					createElement("div", {
						className: "ranked-poll__poll-option-votes",
						innerText: rank + 1,
						style: { opacity },
					}),
					createElement("div", {
						className: `ranked-poll__poll-option-text render-emotes ${option.isTwoThirds &&
							"is-two-thirds"}`,
						innerText: option.text,
					}),
				);
			})
			.forEach(e => this.resultsPanel.appendChild(e));
	}

	close() {
		this.isActive = false;
		this.pollElement.classList.add("is-closed");
		this._disable();
	}

	_onHideClick() {
		removeElements(this.pollElement);
		this._disable();
	}

	_disable() {
		this.pollElement.classList.add("ranked-poll--is-voted");
	}
}

function range(count) {
	const arr = new Array(count);
	for (let i = 0; i < count; i++) {
		arr[i] = i;
	}

	return arr;
}
