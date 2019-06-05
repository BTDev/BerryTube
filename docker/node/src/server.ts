import { readdirSync } from "fs";
import { BerryEngine } from "engine";

const engine = new BerryEngine();

const moduleNames = readdirSync("./modules");
for (const moduleName of moduleNames) {
	try {
		// tslint:disable-next-line: no-var-requires
		const { initializeModule } = require(`./modules/${moduleName}`);
		if (!initializeModule) {
			throw new Error(`initializeModule method not declared`);
		}

		initializeModule(engine);
	} catch (e) {
		// tslint:disable-next-line: no-console
		console.error(`there was an error initializing module ${moduleName}`);
		throw e;
	}
}
