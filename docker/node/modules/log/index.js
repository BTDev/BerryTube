const { LogService, levels } = require("./service");

exports.LogService = LogService;
exports.levels = levels;
exports.events = require("./events").events;
exports.consoleLogger = require("./logger-console").consoleLogger;
exports.createStreamLogger = require("./logger-stream").createStreamLogger;

exports.DefaultLog = new LogService();