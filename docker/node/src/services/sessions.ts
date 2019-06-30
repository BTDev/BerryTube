import { ServiceBase } from "./base";
import { Origin } from "lib/auth";

export interface Socket {
	readonly name: string;
	readonly origin: Origin;
	readonly session: Session;
}

export class SocketControl implements Socket {
	public constructor(
		public readonly session: Session,
		public readonly name: string,
		public readonly origin: Origin,
	) {}

	public dispose() {}
}

export interface Session {}

export interface SocketParameters {
	origin: Origin;
	emit(eventName: string, data: any): void;
}

export class SessionControl implements Session {
	public createSocket(params: SocketParameters): SocketControl {
		return null as any;
	}
}

export class SessionRepository extends ServiceBase {
	public createSession(): SessionControl {
		return null as any;
	}
}
