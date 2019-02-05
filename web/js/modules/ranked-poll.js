import { ensureExists, addPollMessage } from "./bt.js";
import { createElement, prependElement, removeElements, $, clear } from "./lib.js";

const rankColors = ["#4b830d", "#005cb2", "#29434e"]

export class RankedPoll {
    constructor(state) {
        this._onHideClick = this._onHideClick.bind(this)

        addPollMessage(state.creator, state.title)

        const optionRows = this.optionRows = []

        this.isActive = true
        const pollElement = this.pollElement = createElement(
            "div",
            { className: `poll active ranked-poll ${state.results == "[](/lpno1)" ? "ranked-poll--is-obscured" : ""}` },
            createElement(
                "div",
                { className: "btn close", innerText: "X", onClick: this._onHideClick }),
            createElement(
                "div",
                { className: "title ranked-poll__title" },
                createElement(
                    "span",
                    { innerText: state.title }),
                createElement(
                    "span",
                    { className: "ranked-poll__vote-count", ref: e => this.voteCount = e })
            ),
            createElement(
                "div",
                { className: "ranked-poll__split" },
                createElement(
                    "div",
                    { className: "ranked-poll_input-panel" },
                    createElement(
                        "div",
                        { className: "ranked-poll__option-list" },
                        state.options.map((option, i) =>
                            createElement(
                                "div",
                                { className: "label ranked-poll__option", ref: e => optionRows.push(e) },
                                createElement(
                                    "button",
                                    { innerText: "1st", onClick: () => rankChoice(i, 0), className: "ranked-poll__1st-button", disabled: true }
                                ),
                                createElement(
                                    "button",
                                    { innerText: "2nd", onClick: () => rankChoice(i, 1), className: "ranked-poll__2nd-button", disabled: true }
                                ),
                                createElement(
                                    "button",
                                    { innerText: "3rd", onClick: () => rankChoice(i, 2), className: "ranked-poll__3rd-button", disabled: true }
                                ),
                                createElement(
                                    "div",
                                    { innerText: option, className: "ranked-poll__option-text" }
                                ))))),
                createElement(
                    "div",
                    { className: "ranked-poll__results-panel", ref: e => this.resultsPanel = e })))

        ensureExists("#pollpane").then(pane => {
            if (!this.isActive)
                return

            prependElement(pane, this.pollElement)

            // enable the first rank
            setRank(0, true)

            this.update(state)
        })

        function setRank(rank, isEnabled) {
            for (const button of pollElement.querySelectorAll(`.ranked-poll__option button:nth-of-type(${rank + 1})`)) {
                if (button.classList.contains("ranked-poll--not-chosen"))
                    continue

                button.disabled = !isEnabled

                if (!isEnabled)
                    button.classList.add("ranked-poll--not-chosen")
            }
        }

        function rankChoice(optionIndex, rank) {
            // enable next rank
            if (rank < 2)
                setRank(rank + 1, true)

            // disable this rank
            setRank(rank, false)

            // mark our row and button as selected....
            const optionRow = optionRows[optionIndex]
            optionRow.classList.add("ranked-poll--is-chosen")

            const selectedButton = optionRow.querySelector(`button:nth-of-type(${rank + 1})`)
            selectedButton.classList.add("ranked-poll--is-chosen")
            selectedButton.classList.remove("ranked-poll--not-chosen")

            // disable all of our buttons so a person can't select twice
            for (const button of optionRow.querySelectorAll("button")) {
                if (button != selectedButton)
                    button.classList.add("ranked-poll--not-chosen")

                button.disabled = true
            }

            // finally, dispatch our vote to the server!
            window.socket.emit("votePoll", { optionIndex, rank });
        }
    }

    update(state) {
        if (typeof(state.results) !== "object") {
            this.pollElement.classList.add("ranked-poll--is-obscured");
            this.pollElement.classList.remove("ranked-poll--is-visible");
            return;
        }

        this.pollElement.classList.remove("ranked-poll--is-obscured");
        this.pollElement.classList.add("ranked-poll--is-visible");
        this.voteCount.innerText = `(${state.rankedVotes.length} vote${state.rankedVotes.length != 1 ? "s" : ""})`;
        clear(this.resultsPanel);

        state.results
            .map(({votes, index, rankDistribution, opacity}) =>
                createElement(
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
                    createElement(
                        "div",
                        { className: "ranked-poll__poll-option-text", innerText: state.options[index] }
                    )))
            .forEach(e => this.resultsPanel.appendChild(e));
    }

    close() {
        this.isActive = false
        this.pollElement.classList.add("ranked-poll--is-closed")
        this._disable()
    }

    _onHideClick() {
        removeElements(this.pollElement)
        this._disable()
    }

    _disable() {
        this.pollElement.classList.add("ranked-poll--is-voted")
    }
}