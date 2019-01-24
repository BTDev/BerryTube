import { ensureExists, addPollMessage } from "./bt.js";
import { createElement, prependElement, removeElements, $, clear } from "./lib.js";

export class RankedPoll {
    constructor(state) {
        this._onHideClick = this._onHideClick.bind(this)

        addPollMessage(state.creator, state.title)

        const optionRows = this.optionRows = []

        this.isActive = true
        const pollElement = this.pollElement = createElement(
            "div",
            { className: "poll active ranked-poll" },
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
                                    "div",
                                    { className: "ranked-poll__visualizer" },
                                    createElement(
                                        "div",
                                        { className: "ranked-poll__votes" }
                                    ),
                                    createElement(
                                        "div",
                                        { className: "ranked-poll__visual-cells" }
                                    )
                                ),
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
        // most of the processing here will be offloaded to the server at some point...

        if (!state.rankedVotes) {
            this.pollElement.classList.remove("ranked-poll--is-visible")
            this.pollElement.classList.add("ranked-poll--is-obscured")
            return
        }

        if (typeof (state.rankedVotes) !== "object")
            return

        this.voteCount.innerText = `(${state.rankedVotes.length} vote${state.rankedVotes.length != 1 ? "s" : ""})`

        // returns an X by 3 matrix where X is the amount of options
        // each cell contains how many votes there were for that option at that rank
        const voteDistribution = state.options.map(() => [0, 0, 0])
        for (let voteIndex = 0; voteIndex < state.rankedVotes.length; voteIndex++) {
            const vote = state.rankedVotes[voteIndex].optionIndicies
            for (let rank = 0; rank < vote.length; rank++)
                voteDistribution[vote[rank]][rank]++
        }

        const rankColors = ["#4b830d", "#005cb2", "#29434e"]
        for (let index = 0; index < state.options.length; index++) {
            const optionVotes = voteDistribution[index]
            const visualizer = this.optionRows[index].querySelector(".ranked-poll__visual-cells")
            const voteCountElement = this.optionRows[index].querySelector(".ranked-poll__votes")
            const voutCount = optionVotes.reduce((c, v) => c + v, 0)
            voteCountElement.innerText = voutCount

            clear(visualizer)

            if (voutCount == 0) {
                visualizer.parentElement.classList.add("ranked-poll--is-empty")
            } else {
                visualizer.parentElement.classList.remove("ranked-poll--is-empty")
                optionVotes
                    .map((count, rank) =>
                        count && createElement(
                            "div",
                            { className: "ranked-poll__visual-cell", style: { flexGrow: count, backgroundColor: rankColors[rank] } }))
                    .forEach(e => {
                        if (e)
                            visualizer.appendChild(e)
                    })
            }
        }

        const results = []
        const eliminatedOptionIndicies = []
        
        // keep calculating new runs until we stop eliminating things
        while (true) {
            // add up all first choices
            const optionVotes = state.options.map((_, i) => ({ optionIndex: i, votes: 0 }))

            for (let voteIndex = 0; voteIndex < state.rankedVotes.length; voteIndex++) {
                const vote = state.rankedVotes[voteIndex].optionIndicies

                // get the first choice of this vote excluding eliminated choices
                for (let rank = 0; rank < vote.length; rank++) {
                    if (eliminatedOptionIndicies.includes(vote[rank]))
                        continue

                    optionVotes[vote[rank]].votes++
                    break
                }
            }

            // now eliminate the options with the lowest vote count that isn't 0
            let minVoteCount = Number.MAX_SAFE_INTEGER
            var maxVoteCount = Number.MIN_SAFE_INTEGER
            for (let i = 0; i < optionVotes.length; i++) {
                if (optionVotes[i].votes == 0)
                    continue

                minVoteCount = Math.min(minVoteCount, optionVotes[i].votes)
                maxVoteCount = Math.max(maxVoteCount, optionVotes[i].votes)
            }

            const adjustedMax = maxVoteCount - minVoteCount
            const winners = []
            let didElimiate = false
            let validOptionCount = 0
            let areAllMax = true
            
            for (let i = 0; i < optionVotes.length; i++) {
                const option = optionVotes[i]
                
                if (option.votes == 0)
                    continue
                
                if (option.votes == minVoteCount) {
                    eliminatedOptionIndicies.push(i)
                    didElimiate = true
                }
                    
                if (option.votes == maxVoteCount)
                    winners.push(option.optionIndex)
                else
                    areAllMax = false

                option.opacity = Math.max((option.votes - minVoteCount) / adjustedMax, .2)
                validOptionCount++
            }

            optionVotes.sort((l, r) => r.votes - l.votes)
            
            results.push({ 
                options: optionVotes
            })

            if (!didElimiate || validOptionCount == 1 || areAllMax)
                break;
        }

        clear(this.resultsPanel)
        const resultsPanel = this.resultsPanel
        results.map((poll, i) =>
            createElement(
                "div",
                { className: "ranked-poll__poll-result " + (i == (results.length - 1) ? "ranked-poll__poll--is-expanded" : "") },
                createElement(
                    "div",
                    {
                        className: "ranked-poll__poll-result-header",
                        innerText: `Run ${i + 1}`,
                        onClick: () => expandRun(results.length - i - 1)
                    }
                ),
                createElement(
                    "div",
                    { className: "ranked-poll__poll-result-body" },
                    poll.options.filter(o => o.votes > 0).map(({ optionIndex, votes, opacity }) =>
                        createElement(
                            "div",
                            { className: "ranked-poll__poll-option-result" },
                            createElement(
                                "div",
                                { className: "ranked-poll__poll-option-votes", innerText: votes, style: { "opacity": opacity } }
                            ),
                            createElement(
                                "div",
                                { className: "ranked-poll__poll-option-text", innerText: state.options[optionIndex] }
                            ))))))
            .forEach(e => prependElement(this.resultsPanel, e))

        this.pollElement.classList.add("ranked-poll--is-visible")
        this.pollElement.classList.remove("ranked-poll--is-obscured")

        let lastExpandedRun = -1
        function expandRun(runIndex) {
            for (const element of resultsPanel.querySelectorAll(".ranked-poll__poll-result"))
                element.classList.remove("ranked-poll__poll--is-expanded")

            if (lastExpandedRun == runIndex) {
                lastExpandedRun = -1
                return
            }
                
            const toExpand = resultsPanel.querySelector(`.ranked-poll__poll-result:nth-of-type(${runIndex + 1})`)
            toExpand.classList.add("ranked-poll__poll--is-expanded")
            lastExpandedRun = runIndex
        }
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