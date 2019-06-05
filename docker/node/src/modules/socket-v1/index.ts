import { BerryEngine } from "engine";
import { OpenNormalPollCommand } from "modules/polls";

export function initializeModule({ entities, root, actions }: BerryEngine) {
	actions.dispatch(OpenNormalPollCommand, { title: "Hey" }, {});
}
