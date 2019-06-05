import { StaticTable } from "./static-table";

export type OriginType = "ipv4" | "ipv6" | "process";

export type Origin = {
	type: OriginType;
	value: string;
};

export const UserTypes = new StaticTable([
	{ id: -2, name: "Lurker" },
	{ id: -1, name: "Greyname" },
	{ id: 0, name: "User" },
	{ id: 1, name: "Moderator" },
	{ id: 2, name: "Administrator" },
	{ id: 10, name: "System" },
]);

export const UserTypeNames = {
	Lurker: UserTypes.map[-2],
	Greyname: UserTypes.map[-1],
	User: UserTypes.map[0],
	Moderator: UserTypes.map[1],
	Administrator: UserTypes.map[2],
	System: UserTypes.map[10],
};

export interface AuthInfo {
	readonly name: string;
	readonly type: typeof UserTypes.Id;
	readonly isLeader: boolean;
}

export type CanDo = (auth: AuthInfo) => boolean;

export function isLeaderOrModerator({ isLeader, type }: AuthInfo) {
	return isLeader || type > UserTypeNames.Moderator.id;
}
