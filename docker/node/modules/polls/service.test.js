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

        // it("can't brain today 1", async function () {
        //     await this.simulatePoll(
        //         ["admin", "create", { ops: ["o1", "op2", "op3", "op4"], obscure: true, pollType: "ranked" }],
        //         ["user1", "cast", { optionIndex: 1, rank: 0 }], ["user1", "cast", { optionIndex: 0, rank: 1 }],
        //         ["user2", "cast", { optionIndex: 2, rank: 0 }], ["user2", "cast", { optionIndex: 0, rank: 1 }],
        //         ["user3", "cast", { optionIndex: 3, rank: 0 }],
        //         ["user4", "cast", { optionIndex: 3, rank: 0 }]
        //     );

        //     expect(this.service.currentPoll.results).to.eql([
        //         {
        //             votes: 2,
        //             index: 0,
        //             isExcluded: false,
        //             rankDistribution: [0, 2, 0],
        //             opacity: 1
        //         },
        //         {
        //             votes: 2,
        //             index: 3,
        //             isExcluded: true,
        //             rankDistribution: [2, 0, 0],
        //             opacity: 1
        //         },
        //         {
        //             votes: 1,
        //             index: 1,
        //             isExcluded: true,
        //             rankDistribution: [1, 0, 0],
        //             opacity: 0.5
        //         },
        //         {
        //             votes: 1,
        //             index: 2,
        //             isExcluded: true,
        //             rankDistribution: [1, 0, 0],
        //             opacity: 0.5
        //         }
        //     ]);
        // });

        // it("can't brain today 2", async function () {
        //     await this.simulatePoll(
        //         ["admin", "create", { ops: ["o1", "op2", "op3", "op4", "op5"], obscure: true, pollType: "ranked" }],
        //         ["user1", "cast", { optionIndex: 1, rank: 0 }], ["user1", "cast", { optionIndex: 0, rank: 1 }],
        //         ["user2", "cast", { optionIndex: 2, rank: 0 }], ["user2", "cast", { optionIndex: 0, rank: 1 }],
        //         ["user3", "cast", { optionIndex: 3, rank: 0 }],
        //         ["user4", "cast", { optionIndex: 3, rank: 0 }],
        //         ["user4", "cast", { optionIndex: 4, rank: 0 }], ["user4", "cast", { optionIndex: 2, rank: 1 }], ["user4", "cast", { optionIndex: 0, rank: 2 }]
        //     );

        //     expect(this.service.currentPoll.results).to.eql([{
        //         votes: 1,
        //         index: 0,
        //         isExcluded: true,
        //         rankDistribution: [0, 2, 1],
        //         opacity: 0.2
        //     },
        //     {
        //         votes: 1,
        //         index: 1,
        //         isExcluded: true,
        //         rankDistribution: [1, 0, 0],
        //         opacity: 0.2
        //     },
        //     {
        //         votes: 2,
        //         index: 2,
        //         isExcluded: false,
        //         rankDistribution: [1, 1, 0],
        //         opacity: 0.2
        //     },
        //     {
        //         votes: 1,
        //         index: 3,
        //         isExcluded: true,
        //         rankDistribution: [1, 0, 0],
        //         opacity: 0.2
        //     },
        //     {
        //         votes: 1,
        //         index: 4,
        //         isExcluded: true,
        //         rankDistribution: [1, 0, 0],
        //         opacity: 0.2
        //     }]);
        // });

        // todo: actually write more tests.
    });
});