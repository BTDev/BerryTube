import { LogEvents } from "config";

export class Logger {
	public constructor() {}

	public info(event: typeof LogEvents.Id, format: string, ...args: any[]) {
		throw new Error("Method not implemented.");
	}

	public error(event: typeof LogEvents.Id, format: string, ...args: any[]) {
		throw new Error("Method not implemented.");
	}
}
