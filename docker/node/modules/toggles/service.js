const { ServiceBase } = require("../base");
const { getSocketName } = require("../socket");
const { actions } = require("../auth/actions");
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
    
    constructor({ io, auth, log, kickForIllegalActivity }) {
        super({ log });
        this.io = io;
        this.auth = auth;
        this.kickForIllegalActivity = kickForIllegalActivity;
        this.toggles = {};

        this.exposeSocketActions({
            "setToggleable": this.set.bind(this)
        });
    }

    add(id, label, defaultValue, convert) {
        if (this.toggles.hasOwnProperty(id))
            throw new Error(`You cannot add a toggle twice: ${id}.`);
        
        const value = convert(defaultValue);
        this.toggles[id] = { id, label, value, convert, defaultValue: value };
        this.publishToAll();
    }

    get(id) {
        if (!this.toggles.hasOwnProperty(id)) {
            this.log.error(events.GET_TOGGLEABLE, "No such toggleable {toggleable} found", { toggleable: id });
            return false;
        }

        return this.toggles[id].value;
    }

    set(socket, {name: id, state}) {
		if (!(await this.auth.canDoAsync(socket, actions.ACTION_SET_TOGGLEABLE))) {
            this.kickForIllegalActivity(socket, "You cannot set toggleables");
            throw new Error("unauthoirzed");
        }

        const logData = { mod: await getSocketName(socket), toggleable: id, type: "site" };

        if (!this.toggles.hasOwnProperty(id)) {
            this.log.error(events.EVENT_ADMIN_SET_TOGGLEABLE, "{mod} could not set {toggleable} because it does not eixst on {type}", logData);
            throw new Error(`Toggle ${id} not found`);
        }

        const toggle = this.toggles[id];
        toggle.value = (typeof(state) !== "undefined")
            ? toggle.convert(state)
            : this.toggles[id].defaultValue;

        logData.state = toggle.value;
        this.log.info(events.EVENT_ADMIN_SET_TOGGLEABLE, "{mod} set {toggleable} to {state} on {type}", logData);
        this.publishToAll();
    }

    publishToAll() {
        this.io.emit("setToggleables", this.state);
    }

	onSocketConnected(socket) {
        super.onSocketConnected(socket);
        socket.emit("setToggleables", this.state);
	}
}