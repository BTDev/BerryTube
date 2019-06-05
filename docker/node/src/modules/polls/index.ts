import { declareEntity, declareAttachment } from "services/entities";
import { shape, VoidShape } from "lib/shapes";
import { RootEntity, BerryEngine } from "engine";
import { declareCommand, declareQuery, declareEvent } from "lib/actions";
import { UserTypes, UserTypeNames, isLeaderOrModerator } from "lib/auth";

export const CurrentPollAttachment = declareAttachment(
	[RootEntity],
	"poll",
	shape({
		kind: "object",
		props: {
			currentPollEntityId: shape({ kind: "number", isNullable: true }),
		},
	}),
	{
		currentPollEntityId: 1,
	},
);

export const NormalPollEntity = declareEntity(
	"poll.normal",
	shape({
		kind: "object",
		props: {
			title: shape({ kind: "string" }),
		},
	}),
	{ title: "[unknown]" },
);

export const RankedPollEntity = declareEntity(
	"poll.ranked",
	shape({
		kind: "object",
		props: {
			title: shape({ kind: "string" }),
		},
	}),
	{ title: "[unknown]" },
);

export const OpenNormalPollCommand = declareCommand(
	"polls.open.normal",
	NormalPollEntity.shape,
	isLeaderOrModerator,
);

export const PollOpened = declareEvent(
	"polls.opened",
	shape({
		kind: "object",
		props: { title: shape({ kind: "string" }) },
	}),
);

export function initializeModule({ entities, root, actions }: BerryEngine) {
	const currentPoll = entities.defineAttachment(CurrentPollAttachment);

	const normalPolls = entities.define(NormalPollEntity);
	const rankedPolls = entities.define(RankedPollEntity);

	const pollOpened = actions.define(PollOpened);

	actions.define(OpenNormalPollCommand, async data => {
		const newPoll = normalPolls.create({
			title: data.title,
		});

		currentPoll.set(root, { currentPollEntityId: newPoll.id });
		pollOpened({ title: "Hey" });
	});

	actions.dispatch(OpenNormalPollCommand, { title: "STUFF" }, {});
}
