import { ensureExists, addPollMessage } from "./bt.js";
import { createElement, prependElement, removeElements, $, clear } from "./lib.js";

const rankColors = ["#4b830d", "#005cb2", "#29434e"];

export class RankedPoll {
    constructor(state, parent) {
        this._onHideClick = this._onHideClick.bind(this);

        addPollMessage(state.creator, state.title);

        const { extended: { options } } = state;

        this.isActive = true;
        const pollElement = this.pollElement =
            createElement(
                "div",
                { className: "ranked-poll__split" },
                createElement(
                    "div",
                    { className: "ranked-poll_input-panel" },
                    createElement(
                        "div",
                        { className: "ranked-poll__option-list" },
                        [
                            ...options.map((option, i) =>
                                createElement(
                                    "div",
                                    { className: "ranked-poll__option" },
                                    createElement(
                                        "button",
                                        { innerText: "1", onClick: () => rankChoice(this, i, 0), className: "ranked-poll__button ranked-poll__1st-button", "data-rank": "0", "data-option-index": i }
                                    ),
                                    createElement(
                                        "button",
                                        { innerText: "2", onClick: () => rankChoice(this, i, 1), className: "ranked-poll__button ranked-poll__2nd-button", "data-rank": "1", "data-option-index": i, disabled: true }
                                    ),
                                    createElement(
                                        "button",
                                        { innerText: "3", onClick: () => rankChoice(this, i, 2), className: "ranked-poll__button ranked-poll__3rd-button", "data-rank": "2", "data-option-index": i, disabled: true }
                                    ),
                                    option.isTwoThirds
                                        ? createElement(
                                            "div",
                                            { className: "ranked-poll__option-text is-two-thirds", innerText: option.text }
                                        )
                                        : createElement(
                                            "div",
                                            { className: "ranked-poll__option-text label", innerText: option.text }
                                        ))),
                            createElement("button", { innerText: "clear votes", onClick: () => clearVotes(this), ref: e => this.clearVotedButton = e, disabled: true, className: "ranked-poll__clear-button" })
                        ])),
                createElement(
                    "div",
                    { className: "ranked-poll__results-panel", ref: e => this.resultsPanel = e }));

        parent.appendChild(pollElement);
        this.update(state)

        const ourChoices = [-1, -1, -1];

        function rankChoice(that, optionIndex, rank) {
            ourChoices[rank] = optionIndex;
            window.socket.emit("votePoll", { optionIndex, rank });
            refreshDisabled(that);
        }

        function clearVotes(that) {
            for (let i = 0; i < ourChoices.length; i++) {
                window.socket.emit("votePoll", { optionIndex: null, rank: i });
                ourChoices[i] = -1;
            }

            refreshDisabled(that);
        }

        function refreshDisabled(that) {
            let maxVotedRank = -1;
            for (let rank = 0; rank < ourChoices.length; rank++) {
                if (ourChoices[rank] < 0)
                    continue;

                maxVotedRank = rank;
            }
            
            that.clearVotedButton.disabled = maxVotedRank == -1;
            
            for (const button of pollElement.querySelectorAll(`.ranked-poll__button`)) {
                const optionIndex = parseInt(button.dataset.optionIndex);
                const rankIndex = parseInt(button.dataset.rank);
                button.disabled = ourChoices.includes(optionIndex) || (maxVotedRank < (rankIndex - 1));
                button.classList.toggle("is-selected", ourChoices[rankIndex] == optionIndex);
            }
        }
    }

    update(state) {
        const { extended: { options, results, votes } } = state;
        
        if (typeof(results) !== "object") {
            this.pollElement.classList.add("ranked-poll--is-obscured");
            this.pollElement.classList.remove("ranked-poll--is-visible");
            return;
        }

        this.pollElement.classList.remove("ranked-poll--is-obscured");
        this.pollElement.classList.add("ranked-poll--is-visible");
        clear(this.resultsPanel);

        results
            .map(({votes, index, rankDistribution, opacity}) => {
                const option = options[index];
                return createElement(
                    "div",
                    { className: "ranked-poll__poll-option-result" },
                    createElement(
                        "div",
                        { className: "ranked-poll__visualizer" },
                        createElement(
                            "div",
                            { className: "ranked-poll__votes", innerText: rankDistribution.reduce((c, v) => c + v, 0) }
                        ),
                        createElement(
                            "div",
                            { className: "ranked-poll__visual-cells" },
                            rankDistribution.map((amount, rank) => 
                                createElement(
                                    "div",
                                    { className: "ranked-poll__visual-cell", style: { flexGrow: amount, backgroundColor: rankColors[rank] } })))
                    ),
                    createElement(
                        "div",
                        { className: "ranked-poll__poll-option-votes", innerText: votes, style: { "opacity": opacity } }
                    ),
                    option.isTwoThirds
                        ? createElement(
                            "div",
                            { className: "ranked-poll__poll-option-text is-two-thirds", innerText: option.text }
                        )
                        : createElement(
                            "div",
                            { className: "ranked-poll__poll-option-text", innerText: option.text }
                        ));
            })
            .forEach(e => this.resultsPanel.appendChild(e));
    }

    close() {
        this.isActive = false;
        this.pollElement.classList.add("ranked-poll--is-closed");
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
