const { expect } = require("chai");
const { LogService, levels, events } = require("./index");

describe("modules", function() {
	describe("Log Service", function() {
		beforeEach(function() {
			this.service = new LogService();
			this.service.now = () => "NOW";
			this.messages = [];
			this.service.addLogger(msg => this.messages.push(msg));
		});

		it("filters out debug", function() {
			this.service.defaultLevel = levels.LEVEL_INFORMATION;
			this.service.debug(events.EVENT_VIDEO_CHANGE, "message");
			expect(this.messages.length).to.equal(0);
		});

		it("filters out information", function() {
			this.service.defaultLevel = levels.LEVEL_ERROR;
			this.service.info(events.EVENT_VIDEO_CHANGE, "message");
			expect(this.messages.length).to.equal(0);
		});

		it("doesn't filter out error", function() {
			this.service.defaultLevel = levels.LEVEL_ERROR;
			this.service.error(events.EVENT_VIDEO_CHANGE, "message");
			expect(this.messages.length).to.equal(1);
		});

		it("sends message without data", function() {
			this.service.error(events.EVENT_VIDEO_CHANGE, "THIS IS A TEST");
			expect(this.messages).to.eql([
				{
					level: 3,
					event: events.EVENT_VIDEO_CHANGE,
					format: "THIS IS A TEST",
					data: null,
					error: null,
					formatted: `THIS IS A TEST`,
					createdAt: "NOW",
				},
			]);
		});

		it("sends message with data", function() {
			this.service.error(events.EVENT_VIDEO_CHANGE, "THIS IS {data} A TEST", { data: 123 });
			expect(this.messages).to.eql([
				{
					level: 3,
					event: events.EVENT_VIDEO_CHANGE,
					format: "THIS IS {data} A TEST",
					data: { data: 123 },
					error: null,
					formatted: `THIS IS 123 A TEST`,
					createdAt: "NOW",
				},
			]);
		});

		it("sends an error", function() {
			this.service.error(events.EVENT_VIDEO_CHANGE, "THIS IS {data} A TEST", { data: 123 }, new Error());
			expect(this.messages[0].error).to.instanceof(Error);
		});
	});
});
