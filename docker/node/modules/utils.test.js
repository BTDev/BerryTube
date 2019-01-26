const { expect } = require("chai");

const { parseFormat } = require("./utils");

describe("parseFormat", function() {
    it("parses: left {middle} right", function() {
        let parts = []
        parseFormat("left {middle} right", (...args) => parts.push(args));
        expect(parts).to.eql([
            ["constant", "left "],
            ["match", "middle"],
            ["constant", " right"]
        ]);
    });
    
    it("parses: {left} right", function() {
        let parts = []
        parseFormat("{left} right", (...args) => parts.push(args));
        expect(parts).to.eql([
            ["match", "left"],
            ["constant", " right"]
        ]);
    });
    
    it("parses: {left}{left2} right", function() {
        let parts = []
        parseFormat("{left}{left2} right", (...args) => parts.push(args));
        expect(parts).to.eql([
            ["match", "left"],
            ["match", "left2"],
            ["constant", " right"]
        ]);
    });
    
    it("parses: {left} {left2} right", function() {
        let parts = []
        parseFormat("{left} {left2} right", (...args) => parts.push(args));
        expect(parts).to.eql([
            ["match", "left"],
            ["constant", " "],
            ["match", "left2"],
            ["constant", " right"]
        ]);
    });
    
    it("parses: left {right}", function() {
        let parts = []
        parseFormat("left {right}", (...args) => parts.push(args));
        expect(parts).to.eql([
            ["constant", "left "],
            ["match", "right"]
        ]);
    });
    
    it("parses: left {right}{right2}", function() {
        let parts = []
        parseFormat("left {right}{right2}", (...args) => parts.push(args));
        expect(parts).to.eql([
            ["constant", "left "],
            ["match", "right"],
            ["match", "right2"]
        ]);
    });
    
    it("parses: left {right} {right2}", function() {
        let parts = []
        parseFormat("left {right} {right2}", (...args) => parts.push(args));
        expect(parts).to.eql([
            ["constant", "left "],
            ["match", "right"],
            ["constant", " "],
            ["match", "right2"]
        ]);
    });
});