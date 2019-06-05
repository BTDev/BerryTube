// tslint:disable: no-console
// tslint:disable: no-var-requires
// tslint:disable: no-eval

import { readdirSync } from "fs";
import { BerryEngine } from "engine";
import { Settings } from "config";

const engine = new BerryEngine();

process.on("uncaughtException", function(err: any) {
	console.error(`Uncaught ${err.code}: ${err.message}`);
	console.error(err.stack);

	try {
		const isIgnored = err.code === "ECONNRESET" || err.code === "EPIPE";

		engine.log.error(
			"EVENT_PROC_UNHANDLED_EXCEPTION",
			"unhandled process exception {code}: {message}. Ignoring: {isIgnored}",
			err && err.code,
			err && err.message,
			isIgnored,
			err,
		);

		if (isIgnored) {
			return;
		}
	} catch (err) {
		/* the error has already been printed, so just fall out and exit */
	}

	process.exit(1);
});

const moduleNames = readdirSync("./modules");
for (const moduleName of moduleNames) {
	try {
		const { initializeModule } = require(`./modules/${moduleName}`);
		if (!initializeModule) {
			throw new Error(`initializeModule method not declared`);
		}

		initializeModule(engine);
	} catch (e) {
		console.error(`there was an error initializing module ${moduleName}`);
		throw e;
	}
}

engine.log.info(
	"EVENT_SERVER_STATUS",
	"server version {version} started",
	Settings.Version,
);

process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", function(chunk) {
	try {
		eval(chunk);
	} catch (e) {
		engine.log.error(
			"EVENT_REPL",
			"error invoking repl script: {script}",
			chunk,
			e,
		);
	}
});
