const { expect } = require("chai");

const { PollService } = require("./service");
const { AuthService } = require("../auth");
const { FakeIo } = require("../socket");

describe("modules", function() {
	describe("Poll Service", function() {
		beforeEach(function() {
			const io = (this.io = new FakeIo(
				(_eventName, ..._args) => {},
				(_socket, _eventName, ..._args) => {},
			));

			const auth = (this.auth = new AuthService({
				isLeader: () => false,
			}));
			const service = (this.service = new PollService({
				auth,
				io: this.io,
			}));
			const users = (this.users = {});

			this.simulatePoll = async (...actions) => {
				for (const [username, type, options] of actions) {
					let socket = users[username];
					if (!socket) {
						users[username] = socket = io.createSocket({
							nick: username,
							type: username.startsWith("admin") ? 2 : 0,
							ip: Math.random().toString(),
						});
					}

					if (type == "create") {
						await service.createPoll(socket, options);
					} else if (type == "cast") {
						await service.castVote(socket, options);
					}
				}
			};
		});

		it("create normal poll with legacy string options", async function() {
			await this.simulatePoll(
				[
					"admin",
					"create",
					{
						ops: ["op1", "op2", "op3", "op4"],
						obscure: true,
						pollType: "normal",
					},
				],
				["user1", "cast", { op: 0 }],
				["user2", "cast", { op: 0 }],
				["user3", "cast", { op: 1 }],
				["user4", "cast", { op: 2 }],
			);

			const state = this.service.currentPoll.state;

			expect(state.options).to.deep.equal(["op1", "op2", "op3", "op4"]);

			expect(state.votes).to.deep.equal([2, 1, 1, 0]);
		});

		it("create normal poll with new fancy options", async function() {
			await this.simulatePoll(
				[
					"admin",
					"create",
					{
						ops: [
							{ text: "op1", isTwoThirds: true },
							{ text: "op2" },
							{ text: "op3", isTwoThirds: false },
							{ text: "op4" },
						],
						obscure: true,
						pollType: "normal",
					},
				],
				["user1", "cast", { op: 0 }],
				["user2", "cast", { op: 0 }],
				["user3", "cast", { op: 1 }],
				["user4", "cast", { op: 2 }],
			);

			const state = this.service.currentPoll.state;

			expect(state.options).to.deep.equal([
				"op1 (⅔ required)",
				"op2",
				"op3",
				"op4",
			]);

			expect(state.votes).to.deep.equal([2, 1, 1, 0]);
		});
	});
});
