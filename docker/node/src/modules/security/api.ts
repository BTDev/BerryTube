import { declareQuery } from "services/actions";
import { shape, StringArrayShape } from "lib/shapes";

export const BanShape = shape({
	kind: "object",
	props: {
		isBanned: shape({ kind: "boolean" }),
		durationInSeconds: shape({ kind: "number" }),
		bannedAt: shape({ kind: "number" }),
	},
});

export const GetUserBanInfoQuery = declareQuery(
	"getUserBanInformation",
	shape({
		kind: "object",
		props: {
			nicks: StringArrayShape,
			origins: StringArrayShape,
		},
	}),
	shape(BanShape),
	() => true,
);
