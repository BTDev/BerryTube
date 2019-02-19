const _ = require("lodash");
const { expect } = require("chai");
const dequal = require("deep-equal");
const { delayAsync, Socket, events } = require("../lib");

describe("an admin, a mod, and six users walk into a bar", function () {
    function resetUsers() {
        this.users.forEach(u => u.reset());
    }
    
    before(async function () {
        this.timeout(10000);

        this.admin = new Socket("10.0.0.2", "AdminPerson", "AdminPersonAdminPerson");
        this.mod = new Socket("10.0.0.3", "ModPerson", "ModPersonModPerson");

        // anon
        this.userAnon1 = new Socket("10.0.0.4");
        this.userAnon2 = new Socket("10.0.0.5");

        // gray name
        this.userGray1 = new Socket("10.0.0.6", "GrayPerson1");
        this.userGray2 = new Socket("10.0.0.7", "GrayPerson2");

        // registered user
        this.userReg1 = new Socket("10.0.0.8", "UserPerson1", "UserPerson1UserPerson1");
        this.userReg2 = new Socket("10.0.0.9", "UserPerson2", "UserPerson2UserPerson2");

        this.users = [
            this.admin,
            this.mod,
            this.userAnon1,
            this.userAnon2,
            this.userGray1,
            this.userGray2,
            this.userReg1,
            this.userReg2
        ];

        this.modmins = [
            this.admin,
            this.mod,
        ];

        this.nonModmins = [
            this.userAnon1,
            this.userAnon2,
            this.userGray1,
            this.userGray2,
            this.userReg1,
            this.userReg2
        ];

        await Promise.all(this.users.map(u => u.connectAsync()));
        await delayAsync(500);
    });

    after(async function () {
        for (const socket of this.users)
            await socket.disconnect();
    });

    describe("the admin sends", function () {
        describe("a basic message", function () {
            after(resetUsers);

            const message = "FIRST MESSAGE";

            before(async function () {
                this.admin.emit("chat", {
                    msg: message,
                    metadata: {}
                });

                await delayAsync(250);
            });

            it("and everyone receives it", function () {
                this.users.forEach(u => u.expect("chatMsg", (_, { msg: { msg, nick } }) =>
                    msg == message && nick == this.admin.nick));
            });
        });

        describe("an rcv", function () {
            after(resetUsers);

            const message = "SECOND MESSAGE";

            before(async function () {
                this.admin.emit("chat", {
                    msg: `/rcv ${message}`,
                    metadata: {}
                });

                await delayAsync(250);
            });

            it("and everyone receives it", function () {
                this.users.forEach(u => u.expect("chatMsg", (_, { msg: { msg, nick, emote } }) =>
                    msg == message && nick == this.admin.nick && emote == "rcv"));
            });
        });
    });

    describe("the mod opens a normal, obscured, poll", function () {
        const pollTitle = "TEST POLL 1";
        const pollTitle2 = "TEST POLL 2";
        const pollOptions = ["o1", "o2", "o3"];
        const pollOptions2 = ["o4", "o5", "o6"];

        async function makePoll1() {
            this.mod.emit("newPoll", {
                title: pollTitle,
                obscure: 1,
                pollType: "normal",
                ops: pollOptions
            });

            await delayAsync(250);
        }

        async function makePoll2() {
            this.mod.emit("newPoll", {
                title: pollTitle2,
                obscure: 1,
                pollType: "normal",
                ops: pollOptions2
            });

            await delayAsync(250);
        }

        async function closePoll() {
            this.admin.emit("closePoll");
            await delayAsync(250);
        }
        
        describe("five users vote", async function () {
            before(makePoll1);
            after(closePoll);
            after(resetUsers);

            before(async function () {
                this.admin.emit("votePoll", { op: 1 });
                this.mod.emit("votePoll", { op: 1 });
                this.userGray1.emit("votePoll", { op: 2 });
                this.userGray2.emit("votePoll", { op: 2 });
                this.userReg1.emit("votePoll", { op: 2 });
                this.userReg2.emit("votePoll", { op: 2 });
                await delayAsync(250);
            });

            it("all updatePolls for normal users are obscured", async function () {
                this.nonModmins.forEach(m => m.expectAll("updatePoll", (_, { votes }) =>
                    votes.every(v => v == "?")));
            });


            it("all updatePolls for modmin users are available", async function () {
                this.modmins.forEach(m => m.expectSequence(
                    "updatePoll",
                    (_, { votes }) => dequal(votes, [0, 1, 0]),
                    (_, { votes }) => dequal(votes, [0, 2, 0]),
                    (_, { votes }) => dequal(votes, [0, 2, 1]),
                    (_, { votes }) => dequal(votes, [0, 2, 2]),
                    (_, { votes }) => dequal(votes, [0, 2, 3]),
                    (_, { votes }) => dequal(votes, [0, 2, 4])));
            });

            describe("the admin closes the poll", function () {
                before(closePoll);

                it("all users get the final poll results", function () {
                    this.users.forEach(u => 
                        u.expect("clearPoll", (_, { votes }) => dequal(votes, [0, 2, 4])));
                });
            });
        });
        
        describe("the mod opens another poll", async function () {
            before(makePoll1);
            before(makePoll2);

            it("all users receive the newPoll", function() {
                this.users.forEach(u => 
                    u.expect("newPoll", (_, { title }) => title == pollTitle2));
            });

            it("all users receive the clearPoll", function() {
                this.users.forEach(u => 
                    u.expect("clearPoll", (_, { votes }) => dequal(votes, [0, 0, 0])));
            });
        });
    });
});