const { ServiceBase } = require("../base");
const { getSocketName } = require("../socket");
const { actions, $auth } = require("../auth");
const { $log } = require("../log");
const { events } = require("../log");

exports.ToggleService = class extends ServiceBase {
    get state() {
        const state = Object
            .keys(this.toggles)
            .reduce((ret, key) => {
                const toggle = this.toggles[key];
                ret[key] = { label: toggle.label, state: toggle.value };
                return ret;
            }, {})

        return state;
    }
    
    constructor(services) {
        super(services);
        this.io = services.io;
        this.auth = services.auth;
        this.kickForIllegalActivity = services.kickForIllegalActivity;
        this.toggles = {};
        this.listeners = [];
    }
    
	getSocketApi() {
		return {
			[actions.ACTION_SET_TOGGLEABLE]: use(
				$auth([actions.ACTION_SET_TOGGLEABLE]),
				$log(events.EVENT_ADMIN_SET_TOGGLEABLE, (socket, data) => [
					"{mod} set {toggleable} to {state} on {type}",
                    { mod: getSocketName(socket), toggleable: data.name, type: "site", state: Boolean(data.state) }
				]),
				(_, data) => this.setAsync(data))
		};
	}

    addListener(onToggleSetListener) {
        this.listeners.push(onToggleSetListener);

        return () => {
            const index = this.listeners.indexOf(onToggleSetListener);
            if (index === -1)
                return;

            this.listeners.splice(index, 1);
        };
    }

    add(id, label, defaultValue, convert) {
        if (this.toggles.hasOwnProperty(id))
            throw new Error(`You cannot add a toggle twice: ${id}.`);
        
        const value = convert(defaultValue);
        this.toggles[id] = { id, label, value, convert, defaultValue: value };
        this.publishToAll();
        this.listeners.forEach(l => l(id, value));
    }

    get(id) {
        if (!this.toggles.hasOwnProperty(id)) {
            this.log.error(events.GET_TOGGLEABLE, "No such toggleable {toggleable} found", { toggleable: id });
            return false;
        }

        return this.toggles[id].value;
    }

    async setAsync({name: id, state}) {
        if (!this.toggles.hasOwnProperty(id))
            throw new Error(`Toggle ${id} not found`);

        const toggle = this.toggles[id];
        toggle.value = (typeof(state) !== "undefined")
            ? toggle.convert(state)
            : this.toggles[id].defaultValue;

        this.publishToAll();
        this.listeners.forEach(l => l(id, toggle.value));
    }

    publishToAll() {
        this.io.sockets.emit("setToggleables", this.state);
    }

	onSocketConnected(socket) {
        super.onSocketConnected(socket);
        socket.emit("setToggleables", this.state);
	}
}