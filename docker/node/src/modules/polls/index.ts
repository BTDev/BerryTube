import { declareEntity, declareAttachment } from "services/entities";
import { shape } from "lib/shapes";
import { RootEntity, BerryEngine } from "engine";
import { declareCommand, declareEvent } from "services/actions";
import { isLeaderOrModerator } from "lib/auth";

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

export const PollOpenedEvent = declareEvent(
	"polls.opened",
	shape({
		kind: "object",
		props: { title: shape({ kind: "string" }) },
	}),
);

export function initializeModule({
	root,
	define,
	actions: { dispatch },
}: BerryEngine) {
	const currentPoll = define(CurrentPollAttachment);
	const normalPolls = define(NormalPollEntity);
	const pollOpened = define(PollOpenedEvent);

	define(OpenNormalPollCommand, async data => {
		const newPoll = normalPolls.create({
			title: data.title,
		});

		currentPoll.set(root, { currentPollEntityId: newPoll.id });
		pollOpened({ title: "Hey" });
	});

	dispatch(OpenNormalPollCommand, { title: "STUFF" }, {});
}
