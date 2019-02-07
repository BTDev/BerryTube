const { addSocketActionHandlers } = require("./socket-actions");

const _services = Symbol("#services");

exports.ServiceBase = class {
    constructor(services) {
        this[_services] = services;
        // ^ I don't like taking dependencies on every service in our service locator, however
        // for now this is the best way to propogate our service locator to our socket action
        // midlewares.

        this.log = services.log;
        this.onSocketConnected = this.onSocketConnected.bind(this)
    }

    getSocketApi() {
        return {};
    }

    onSocketConnected(socket) {
        addSocketActionHandlers(socket, this[_services], this.getSocketApi());
    }

    onSocketAuthenticated(socket, type) { }
};