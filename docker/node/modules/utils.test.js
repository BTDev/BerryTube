const { expect } = require("chai");

const { parseFormat, parseRawFileUrl, tryDecodeURIComponent } = require("./utils");

describe("parseFormat", function() {
	it("parses: left {middle} right", function() {
		let parts = [];
		parseFormat("left {middle} right", (...args) => parts.push(args));
		expect(parts).to.eql([
			["constant", "left "],
			["match", "middle"],
			["constant", " right"],
		]);
	});

	it("parses: {left} right", function() {
		let parts = [];
		parseFormat("{left} right", (...args) => parts.push(args));
		expect(parts).to.eql([
			["match", "left"],
			["constant", " right"],
		]);
	});

	it("parses: {left}{left2} right", function() {
		let parts = [];
		parseFormat("{left}{left2} right", (...args) => parts.push(args));
		expect(parts).to.eql([
			["match", "left"],
			["match", "left2"],
			["constant", " right"],
		]);
	});

	it("parses: {left} {left2} right", function() {
		let parts = [];
		parseFormat("{left} {left2} right", (...args) => parts.push(args));
		expect(parts).to.eql([
			["match", "left"],
			["constant", " "],
			["match", "left2"],
			["constant", " right"],
		]);
	});

	it("parses: left {right}", function() {
		let parts = [];
		parseFormat("left {right}", (...args) => parts.push(args));
		expect(parts).to.eql([
			["constant", "left "],
			["match", "right"],
		]);
	});

	it("parses: left {right}{right2}", function() {
		let parts = [];
		parseFormat("left {right}{right2}", (...args) => parts.push(args));
		expect(parts).to.eql([
			["constant", "left "],
			["match", "right"],
			["match", "right2"],
		]);
	});

	it("parses: left {right} {right2}", function() {
		let parts = [];
		parseFormat("left {right} {right2}", (...args) => parts.push(args));
		expect(parts).to.eql([
			["constant", "left "],
			["match", "right"],
			["constant", " "],
			["match", "right2"],
		]);
	});
});

describe("parseRawFileUrl", function() {
	it("parses link with single level", function() {
		const ret = parseRawFileUrl("https://nlaq.blob.core.windows.net/triangle-THING.mp4");
		expect(ret.title).to.equal("triangle-THING");
	});

	it("parses link with single level with empty querystring", function() {
		const ret = parseRawFileUrl("https://nlaq.blob.core.windows.net/triangle-THING.mp4?");
		expect(ret.title).to.equal("triangle-THING");
	});

	it("parses link with single level with non-empty querystring", function() {
		const ret = parseRawFileUrl("https://nlaq.blob.core.windows.net/triangle-THING.mp4?stuff=whoa&and=hey");
		expect(ret.title).to.equal("triangle-THING");
	});

	it("parses link with azure SAS token", function() {
		const ret = parseRawFileUrl(
			"https://nlaq.blob.core.windows.net/media/triangle-THING.mp4?sp=r&st=2019-02-10T10:41:13Z&se=2019-02-10T18:41:13Z&spr=https&sv=2018-03-28&sig=HceZIUkAG7VebuEunEJxdBlbk0Zk2Z6nDNP5u8fP%2FS4%3D&sr=b",
		);
		expect(ret.title).to.equal("triangle-THING");
	});

	it("parses link without azure SAS token", function() {
		const ret = parseRawFileUrl("https://nlaq.blob.core.windows.net/media/triangle-THING.mp4");
		expect(ret.title).to.equal("triangle-THING");
	});

	it("parses link with empty querystring", function() {
		const ret = parseRawFileUrl("https://nlaq.blob.core.windows.net/media/triangle-THING.mp4?");
		expect(ret.title).to.equal("triangle-THING");
	});

	it("rejects an invalid url", function() {
		const ret = parseRawFileUrl("https://nlaq.blob.core.windows.net/media/there-is-no-mp4-here!");
		expect(ret).to.be.null;
	});

	it("rejects a completely invalid url", function() {
		const ret = parseRawFileUrl("THIS IS NOT EVEN CLOSE TO BEING A url.mp4 !!");
		expect(ret).to.be.null;
	});
});

describe("tryDecodeURIComponent", function() {
	it("leaves non-encoded string untouched", function() {
		const ret = tryDecodeURIComponent("foobar");
		expect(ret).to.equal("foobar");
	});

	it("decodes an encoded string", function() {
		const ret = tryDecodeURIComponent("Any%25%20Speedrun");
		expect(ret).to.equal("Any% Speedrun");
	});

	it("doesn't throw on invalid encoding", function() {
		const ret = tryDecodeURIComponent("Any% Speedrun");
		expect(ret).to.equal("Any% Speedrun");
	});
});