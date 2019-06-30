import { BerryEngine } from "engine";
import { GetUserBanInfoQuery } from "./api";

export function initializeModule({
	entities,
	root,
	actions,
	define,
}: BerryEngine) {
	define(GetUserBanInfoQuery, async request => {
		return { isBanned: false, bannedAt: 0, durationInSeconds: 0 };
	});
}
