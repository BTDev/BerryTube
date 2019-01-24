exports.ServiceBase = class {
    constructor({debugLog}) {
        this.debugLog = debugLog
        this._socketActions = {}
    }
    
    exposeSocketActions(actions) {
        for (const actionName in actions) {
            if (!actions.hasOwnProperty(actionName))
                continue

            this._socketActions[actionName] = actions[actionName]
        }
    }
    
    onSocketConnected(socket) { 
        for (const actionName in this._socketActions) {
            if (!this._socketActions.hasOwnProperty(actionName))
                continue

            socket.on(actionName, async data => {
                try {
                    await this._socketActions[actionName](socket, data)
                } catch (e) {
                    this.debugLog(`Cannot ${actionName}: ${e.stack}`)
                }
            })
        }
    }
    
    onSocketAuthenticated(socket, type) { }
}