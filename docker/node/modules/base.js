const { DefaultLog } = require("./log");
const { events } = require("./log/events");
const { getSocketName } = require("./socket");

exports.ServiceBase = class {
    constructor({log = DefaultLog}) {
        this.log = log;
        this._socketActions = {};
        this.onSocketConnected = this.onSocketConnected.bind(this);
    }
    
    exposeSocketActions(actions) {
        for (const actionName in actions) {
            if (!actions.hasOwnProperty(actionName))
                continue;

            this._socketActions[actionName] = actions[actionName];
        }
    }
    
    onSocketConnected(socket) { 
        for (const actionName in this._socketActions) {
            if (!this._socketActions.hasOwnProperty(actionName))
                continue;

            socket.on(actionName, async data => {
                try {
                    await this._socketActions[actionName](socket, data);
                } catch (error) {
                    try {
                        this.log.error(
                            events.EVENT_SOCKET_ACTION_FAILED, 
                            "{nick} could not {action} because {message}", {
                                action: actionName,
                                message: error.message,
                                nick: await getSocketName(socket)
                            },
                            error);
                    } catch (e) {
                        console.error("The error handler threw an error! How embarrassing.");
                        
                        if (e)
                            console.error(e.stack || e);
                    }
                }
            });
        }
    }

    onAgentConnected(socket) {
        this.onSocketConnected(socket);
    }
    
    onSocketAuthenticated(socket, type) { }
};