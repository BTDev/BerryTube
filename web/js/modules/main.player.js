// this is the entrypoint for the player.php popout thinggy
import "./compat.js";
import { getConfig } from "./bt.js";
import { ActionDispatcher } from "./actions.js";
import { PLAYER_ACTION, PLAYER_NAMESPACE } from "./player/index.js";
import { PlayerDOM } from "./player/component.js";
import { PlayerController } from "./player/controller.js";

const config = getConfig();
const actions = new ActionDispatcher(PLAYER_NAMESPACE, sendMessage);
window.addEventListener("message", actions.receiveMessage.bind(actions));

const component = new PlayerDOM(document.querySelector("#root"));
const controller = new PlayerController(component);

controller.stateChanged.subscribe((player, state) => {
	if (player !== controller.current) {
		return;
	}

	actions.dispatch(PLAYER_ACTION.stateSet(state));
});

controller.preferencesChanged.subscribe((player, preferences) => {
	if (player !== controller.current) {
		return;
	}

	actions.dispatch(PLAYER_ACTION.preferencesSet(preferences));
});

actions.addActionHandler(PLAYER_ACTION.SET_STATE, async data => {
	const { state } = data;
	const player = await controller.ensureEnabled(state.video.videotype);
	await player.setState(state);
});

actions.addActionHandler(
	PLAYER_ACTION.SET_PREFERENCES,
	async ({ preferences }) => {
		await controller.current.setPreferences(preferences);
	},
);

actions.addActionHandler(PLAYER_ACTION.REQUEST_STATE, () => {
	return controller.current.getState();
});

function sendMessage(message) {
	parent.postMessage(message, config.origin);
}
