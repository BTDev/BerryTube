const { expect } = require("chai");

const { PollService } = require("./service");
const { AuthService } = require("../auth");
const { FakeIo } = require("../socket");

describe("modules", function () {
    describe("Poll Service", function () {
        beforeEach(function () {
            const io = this.io = new FakeIo(
                (eventName, ...args) => { },
                (socket, eventName, ...args) => { }
            );

            const auth = this.auth = new AuthService({ isLeader: () => false });
            const service = this.service = new PollService({ auth, io: this.io });
            const users = this.users = {};

            this.simulatePoll = async (...actions) => {
                for (const [username, type, options] of actions) {
                    let socket = users[username];
                    if (!socket)
                        users[username] = socket = io.createSocket({
                            nick: username,
                            type: username.startsWith("admin") ? 2 : 0,
                            ip: Math.random().toString()
                        });

                    if (type == "create")
                        await service.createPoll(socket, options);
                    else if (type == "cast")
                        await service.castVote(socket, options);
                }
            };
        });

        it("create normal poll with legacy string options", async function () {
            await this.simulatePoll(
                ["admin", "create", { ops: ["op1", "op2", "op3", "op4"], obscure: true, pollType: "normal" }],
                ["user1", "cast", { op: 0 }],
                ["user2", "cast", { op: 0 }],
                ["user3", "cast", { op: 1 }],
                ["user4", "cast", { op: 2 }]
            );

            const state = this.service.currentPoll.state;

            expect(state.options).to.deep
                .equal(["op1", "op2", "op3", "op4"]);

            expect(state.votes).to.deep
                .equal([2, 1, 1, 0]);
        });

        it("create normal poll with new fancy options", async function () {
            await this.simulatePoll(
                ["admin", "create", {
                    ops: [
                        { text: "op1", isTwoThirds: true },
                        { text: "op2" },
                        { text: "op3", isTwoThirds: false },
                        { text: "op4" }
                    ], obscure: true, pollType: "normal"
                }],
                ["user1", "cast", { op: 0 }],
                ["user2", "cast", { op: 0 }],
                ["user3", "cast", { op: 1 }],
                ["user4", "cast", { op: 2 }]
            );

            const state = this.service.currentPoll.state;

            expect(state.options).to.deep
                .equal(["op1 (⅔ required)", "op2", "op3", "op4"]);

            expect(state.votes).to.deep
                .equal([2, 1, 1, 0]);
        });

        it("create ranked poll with new fancy options", async function () {
            await this.simulatePoll(
                ["admin", "create", {
                    ops: [
                        { text: "op1", isTwoThirds: true },
                        { text: "op2" },
                        { text: "op3", isTwoThirds: false },
                        { text: "op4" }
                    ], obscure: true, pollType: "ranked"
                }],
                ["user1", "cast", { optionIndex: 0, rank: 0 }],
                ["user2", "cast", { optionIndex: 0, rank: 0 }],
                ["user3", "cast", { optionIndex: 1, rank: 0 }],
                ["user4", "cast", { optionIndex: 2, rank: 0 }]
            );

            const state = this.service.currentPoll.state
            const results = state.extended.results.map(r => ({ index: r.index }));

            expect(state.extended.options).to.deep
                .equal([
                    { text: "op1", isTwoThirds: true },
                    { text: "op2", isTwoThirds: false },
                    { text: "op3", isTwoThirds: false },
                    { text: "op4", isTwoThirds: false }
                ]);

            expect(state.options).to.deep
                .equal(["op1 (⅔ required)", "op2", "op3", "op4"]);

            expect(results).to.deep
                .equal([
                    { index: 2 },
                    { index: 1 },
                    { index: 0 },
                    { index: 3 }
                ]);
        });

        it("create ranked poll when second runoff wins", async function () {
            await this.simulatePoll(
                ["admin", "create", {
                    ops: [
                        { text: "op1" },
                        { text: "op2" },
                        { text: "op3" },
                        { text: "op4" }
                    ], obscure: true, pollType: "ranked"
                }],
                ["user1", "cast", { optionIndex: 0, rank: 0 }], ["user1", "cast", { optionIndex: 2, rank: 1 }],
                ["user2", "cast", { optionIndex: 1, rank: 0 }], ["user2", "cast", { optionIndex: 2, rank: 1 }],
                ["user3", "cast", { optionIndex: 2, rank: 0 }],
                ["user4", "cast", { optionIndex: 2, rank: 0 }],
                ["user5", "cast", { optionIndex: 3, rank: 0 }],
                ["user6", "cast", { optionIndex: 3, rank: 0 }],
                ["user7", "cast", { optionIndex: 3, rank: 0 }]
            );

            const state = this.service.currentPoll.state;
            const results = state.extended.results.map(r => ({ index: r.index }));

            expect(results).to.deep
                .equal([
                    { index: 2 },
                    { index: 3 },
                    { index: 0 },
                    { index: 1 }
                ]);
        });

        it("create ranked poll when a two thirds option fails", async function () {
            await this.simulatePoll(
                ["admin", "create", {
                    ops: [
                        { text: "Two Thirds Loser", isTwoThirds: true },
                        { text: "Normal Winner" }
                    ], obscure: true, pollType: "ranked"
                }],
                ["user1", "cast", { optionIndex: 0, rank: 0 }],
                ["user2", "cast", { optionIndex: 0, rank: 0 }],
                ["user3", "cast", { optionIndex: 0, rank: 0 }],
                ["user4", "cast", { optionIndex: 0, rank: 0 }],
                ["user5", "cast", { optionIndex: 0, rank: 0 }],
                ["user6", "cast", { optionIndex: 1, rank: 0 }],
                ["user7", "cast", { optionIndex: 1, rank: 0 }],
                ["user8", "cast", { optionIndex: 1, rank: 0 }],
                ["user9", "cast", { optionIndex: 1, rank: 0 }],
            );

            const state = this.service.currentPoll.state;
            const results = state.extended.results.map(r => ({ index: r.index }));

            expect(results).to.deep
                .equal([
                    { index: 1 },
                    { index: 0 }
                ]);
        });

        it("create ranked poll when a two thirds option wins", async function () {
            await this.simulatePoll(
                ["admin", "create", {
                    ops: [
                        { text: "Two Thirds Winner", isTwoThirds: true },
                        { text: "Normal Winner" }
                    ], obscure: true, pollType: "ranked"
                }],
                ["user1", "cast", { optionIndex: 0, rank: 0 }],
                ["user2", "cast", { optionIndex: 0, rank: 0 }],
                ["user3", "cast", { optionIndex: 0, rank: 0 }],
                ["user4", "cast", { optionIndex: 0, rank: 0 }],
                ["user5", "cast", { optionIndex: 0, rank: 0 }],
                ["user6", "cast", { optionIndex: 0, rank: 0 }],
                ["user7", "cast", { optionIndex: 1, rank: 0 }],
                ["user8", "cast", { optionIndex: 1, rank: 0 }],
                ["user9", "cast", { optionIndex: 1, rank: 0 }],
            );

            const state = this.service.currentPoll.state;
            const results = state.extended.results.map(r => ({ index: r.index }));

            expect(results).to.deep
                .equal([
                    { index: 0 },
                    { index: 1 }
                ]);
        });

        it("create ranked poll when a user changes their vote so that a two thirds option wins", async function () {
            await this.simulatePoll(
                ["admin", "create", {
                    ops: [
                        { text: "Two Thirds Winner", isTwoThirds: true },
                        { text: "Normal Winner" }
                    ], obscure: true, pollType: "ranked"
                }],
                ["user1", "cast", { optionIndex: 0, rank: 0 }],
                ["user2", "cast", { optionIndex: 0, rank: 0 }],
                ["user3", "cast", { optionIndex: 0, rank: 0 }],
                ["user4", "cast", { optionIndex: 0, rank: 0 }],
                ["user5", "cast", { optionIndex: 0, rank: 0 }],
                ["user6", "cast", { optionIndex: 1, rank: 0 }],
                ["user7", "cast", { optionIndex: 1, rank: 0 }],
                ["user8", "cast", { optionIndex: 1, rank: 0 }],
                ["user9", "cast", { optionIndex: 1, rank: 0 }],
                ["user6", "cast", { optionIndex: 0, rank: 0 }],
            );

            const state = this.service.currentPoll.state;
            const results = state.extended.results.map(r => ({ index: r.index }));

            expect(results).to.deep
                .equal([
                    { index: 0 },
                    { index: 1 }
                ]);
        });

        it("create ranked poll when a two thirds option wins, but only after a runoff", async function () {
            await this.simulatePoll(
                ["admin", "create", {
                    ops: [
                        { text: "Two Thirds Winner", isTwoThirds: true },
                        { text: "Normal Winner" },
                        { text: "Shitfuck" }
                    ], obscure: true, pollType: "ranked"
                }],
                ["user1", "cast", { optionIndex: 0, rank: 0 }],
                ["user2", "cast", { optionIndex: 0, rank: 0 }],
                ["user3", "cast", { optionIndex: 0, rank: 0 }],
                ["user4", "cast", { optionIndex: 0, rank: 0 }],
                ["user5", "cast", { optionIndex: 0, rank: 0 }],
                ["user6", "cast", { optionIndex: 1, rank: 0 }],
                ["user7", "cast", { optionIndex: 1, rank: 0 }],
                ["user8", "cast", { optionIndex: 1, rank: 0 }],
                ["user9", "cast", { optionIndex: 2, rank: 0 }], ["user9", "cast", { optionIndex: 0, rank: 1 }]
            );

            const state = this.service.currentPoll.state;
            const results = state.extended.results.map(r => ({ index: r.index }));

            expect(results).to.deep
                .equal([
                    { index: 0 },
                    { index: 1 },
                    { index: 2 }
                ]);
        });

        it("create ranked poll when a two thirds option loses, even after a runoff", async function () {
            await this.simulatePoll(
                ["admin", "create", {
                    ops: [
                        { text: "Two Thirds Winner", isTwoThirds: true },
                        { text: "Normal Winner" },
                        { text: "Shitfuck" }
                    ], obscure: true, pollType: "ranked"
                }],
                ["user1", "cast", { optionIndex: 0, rank: 0 }],
                ["user2", "cast", { optionIndex: 0, rank: 0 }],
                ["user3", "cast", { optionIndex: 0, rank: 0 }],
                ["user4", "cast", { optionIndex: 0, rank: 0 }],
                ["user5", "cast", { optionIndex: 0, rank: 0 }],
                ["user6", "cast", { optionIndex: 1, rank: 0 }],
                ["user7", "cast", { optionIndex: 1, rank: 0 }],
                ["user8", "cast", { optionIndex: 1, rank: 0 }],
                ["userA", "cast", { optionIndex: 1, rank: 0 }],
                ["user9", "cast", { optionIndex: 2, rank: 0 }], ["user9", "cast", { optionIndex: 0, rank: 1 }]
            );

            const state = this.service.currentPoll.state;
            const results = state.extended.results.map(r => ({ index: r.index }));

            expect(results).to.deep
                .equal([
                    { index: 1 },
                    { index: 0 },
                    { index: 2 }
                ]);
        });

        it("wtf why", async function () {
            await this.simulatePoll(
                ["admin", "create", {
                    ops: [
                        { text: "Abusen - But it's Ralph Breaks the Internet, but you have to live through an episode of Drumsy (VR Chat guy)" },
                        { text: "Abusen - But it's furabusen with a 50/50 chance of Ducktales/Looney Tunes" },
                        { text: "Abusen - This is a 100% random episode of horse, but it's an edit" }
                    ], obscure: true, pollType: "ranked"
                }],

                // 0, 1, 2
                ["user1A", "cast", { optionIndex: 0, rank: 0 }], ["user1A", "cast", { optionIndex: 1, rank: 1 }], ["user1A", "cast", { optionIndex: 2, rank: 2 }],
                ["user2A", "cast", { optionIndex: 0, rank: 0 }], ["user2A", "cast", { optionIndex: 1, rank: 1 }], ["user2A", "cast", { optionIndex: 2, rank: 2 }],
                ["user3A", "cast", { optionIndex: 0, rank: 0 }], ["user3A", "cast", { optionIndex: 1, rank: 1 }], ["user3A", "cast", { optionIndex: 2, rank: 2 }],
                ["user4A", "cast", { optionIndex: 0, rank: 0 }], ["user4A", "cast", { optionIndex: 1, rank: 1 }], ["user4A", "cast", { optionIndex: 2, rank: 2 }],
                ["user5A", "cast", { optionIndex: 0, rank: 0 }], ["user5A", "cast", { optionIndex: 1, rank: 1 }], ["user5A", "cast", { optionIndex: 2, rank: 2 }],
                ["user6A", "cast", { optionIndex: 0, rank: 0 }], ["user6A", "cast", { optionIndex: 1, rank: 1 }], ["user6A", "cast", { optionIndex: 2, rank: 2 }],

                // 1, 0, 2
                ["user7A", "cast", { optionIndex: 1, rank: 0 }], ["user7A", "cast", { optionIndex: 0, rank: 1 }], ["user7A", "cast", { optionIndex: 2, rank: 2 }],
                ["user8A", "cast", { optionIndex: 1, rank: 0 }], ["user8A", "cast", { optionIndex: 0, rank: 1 }], ["user8A", "cast", { optionIndex: 2, rank: 2 }],
                ["user9A", "cast", { optionIndex: 1, rank: 0 }], ["user9A", "cast", { optionIndex: 0, rank: 1 }], ["user9A", "cast", { optionIndex: 2, rank: 2 }],
                ["user1B", "cast", { optionIndex: 1, rank: 0 }], ["user1B", "cast", { optionIndex: 0, rank: 1 }], ["user1B", "cast", { optionIndex: 2, rank: 2 }],

                // 1, 2, 0
                ["user2B", "cast", { optionIndex: 1, rank: 0 }], ["user2B", "cast", { optionIndex: 2, rank: 1 }], ["user2B", "cast", { optionIndex: 0, rank: 2 }],
                ["user3B", "cast", { optionIndex: 1, rank: 0 }], ["user3B", "cast", { optionIndex: 2, rank: 1 }], ["user3B", "cast", { optionIndex: 0, rank: 2 }],
                ["user4B", "cast", { optionIndex: 1, rank: 0 }], ["user4B", "cast", { optionIndex: 2, rank: 1 }], ["user4B", "cast", { optionIndex: 0, rank: 2 }],
                ["user5B", "cast", { optionIndex: 1, rank: 0 }], ["user5B", "cast", { optionIndex: 2, rank: 1 }], ["user5B", "cast", { optionIndex: 0, rank: 2 }],
                ["user6B", "cast", { optionIndex: 1, rank: 0 }], ["user6B", "cast", { optionIndex: 2, rank: 1 }], ["user6B", "cast", { optionIndex: 0, rank: 2 }],

                // 2, 0, 1
                ["user7B", "cast", { optionIndex: 2, rank: 0 }], ["user7B", "cast", { optionIndex: 0, rank: 1 }], ["user7B", "cast", { optionIndex: 1, rank: 2 }],
                ["user8B", "cast", { optionIndex: 2, rank: 0 }], ["user8B", "cast", { optionIndex: 0, rank: 1 }], ["user8B", "cast", { optionIndex: 1, rank: 2 }],
                ["user9B", "cast", { optionIndex: 2, rank: 0 }], ["user9B", "cast", { optionIndex: 0, rank: 1 }], ["user9B", "cast", { optionIndex: 1, rank: 2 }],

                // 2, 1, 0
                ["user1C", "cast", { optionIndex: 2, rank: 0 }], ["user1C", "cast", { optionIndex: 1, rank: 1 }], ["user1C", "cast", { optionIndex: 0, rank: 2 }],
                ["user2C", "cast", { optionIndex: 2, rank: 0 }], ["user2C", "cast", { optionIndex: 1, rank: 1 }], ["user2C", "cast", { optionIndex: 0, rank: 2 }],
                ["user3C", "cast", { optionIndex: 2, rank: 0 }], ["user3C", "cast", { optionIndex: 1, rank: 1 }], ["user3C", "cast", { optionIndex: 0, rank: 2 }],
                ["user4C", "cast", { optionIndex: 2, rank: 0 }], ["user4C", "cast", { optionIndex: 1, rank: 1 }], ["user4C", "cast", { optionIndex: 0, rank: 2 }]
            );

            const state = this.service.currentPoll.state;
            const results = state.extended.results.map((r, i) => ({ name: state.extended.options[r.index].text, index: r.index, distribution: r.rankDistribution }));

            expect(results).to.deep
                .equal([{
                    name: "Abusen - But it's Ralph Breaks the Internet, but you have to live through an episode of Drumsy (VR Chat guy)",
                    index: 0,
                    distribution: [6, 7, 9]
                },
                {
                    name: "Abusen - But it's furabusen with a 50/50 chance of Ducktales/Looney Tunes",
                    index: 1,
                    distribution: [9, 10, 3]
                }, {
                    name: "Abusen - This is a 100% random episode of horse, but it's an edit",
                    index: 2,
                    distribution: [7, 5, 10]
                }]);
        });
    });
});
