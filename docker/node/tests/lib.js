process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const events = exports.events = [
    "createPlayer",
    "renewPos",
    "recvNewPlaylist",
    "recvPlaylist",
    "hbVideoDetail",
    "sortPlaylist",
    "forceVideoChange",
    "dupeAdd",
    "badAdd",
    "setAreas",
    "addVideo",
    "addPlaylist",
    "delVideo",
    "setLeader",
    "chatMsg",
    "setNick",
    "setType",
    "newChatList",
    "userJoin",
    "fondleUser",
    "userPart",
    "shadowBan",
    "unShadowBan",
    "drinkCount",
    "numConnected",
    "leaderIs",
    "setVidVolatile",
    "setVidColorTag",
    "kicked",
    "serverRestart",
    "newPoll",
    "updatePoll",
    "setToggleable",
    "setToggleables",
    "clearPoll",
    "recvFilters",
    "recvBanlist",
    "recvPlugins",
    "overrideCss",
    "loginError",
    "debug",
    "reconnecting",
    "reconnect",
    "adminLog",
    "searchHistoryResults",
    "videoRestriction",
    "doorStuck",
    "midasTouch",
    "forceRefresh",
    "shitpost",
    "debugDump"
];

const delayAsync = exports.delayAsync = function(milliseconds) {
    return new Promise(res => {
        setTimeout(res, milliseconds);
    })
}

const Socket = exports.Socket = class {
    constructor(nick = null, password = null) {
        this.eventBuffer = {};
        this.nick = nick;
        this.password = password;
        this.onReceiveListeners = {};
        this.logPrefix = `${nick || "anon"}: `
    }

    async connectAsync() {
        this.socket = await new Promise((res, rej) => {
            const socket = require("socket.io-client").connect(process.env.SOCKET_ORIGIN, {
                "connect timeout": 4500 + Math.random() * 1000,
                "reconnect": true,
                "reconnection delay": 500 + Math.random() * 1000,
                "reopen delay": 500 + Math.random() * 1000,
                "max reconnection attempts": 10,
                "transports": ["websocket"],
                "force new connection": true
            });

            socket.on("error", onError);
            socket.on("connect", onConnect);

            function onError(err) {
                socket.removeListener("error", onError);
                socket.removeListener("connect", onConnect);
                rej(err);
            }

            function onConnect() {
                socket.removeListener("error", onError);
                socket.removeListener("connect", onConnect);
                socket.emit("myPlaylistIsInited");
                res(socket);
            }
        });

        for (const event of events) {
            this.socket.on(event, (...args) => {
//                console.log(`${this.logPrefix}: ${event}: ${args[0]}}`)
                
                const list = (this.eventBuffer[event] || (this.eventBuffer[event] = []));
                list.push(args);

                (this.onReceiveListeners["*"] || [])
                    .forEach(l => l(event, ...args));

                (this.onReceiveListeners[event] || [])
                    .forEach(l => l(event, ...args));
            });
        }

        if (this.nick) {
            const wait = this.waitUntil(
                "setNick", 
                (_, nick) => nick == this.nick, `never received the setNick response for user ${this.nick}!`,
                5000);
            
            this.socket.emit("setNick", this.password
                ? { nick: this.nick, pass: this.password }
                : { nick: this.nick });

            await wait;
        }
    }

    addOnReceiveListener(eventName, func) {
        const listeners = (this.onReceiveListeners[eventName] || (this.onReceiveListeners[eventName] = []));
        listeners.push(func);
        return () => {
            const index = listeners.indexOf(func);
            if (index === -1)
                return;

            listeners.splice(index, 1);
        }
    }

    disconnect() {
        this.eventBuffer = {};
        
        if (this.socket)
            this.socket.disconnect();
    }

    emit(...args) {
        this.socket.emit(...args);
    }

    waitUntil(eventName, predicate, message = "wait timed out...", timeout = 1000) {
        return new Promise((res, rej) => {
            let dispose;
            
            const rejectTimeout = setTimeout(
                () => {
                    dispose();
                    rej(message)
                }, timeout);

            dispose = this.addOnReceiveListener(eventName, 
                (...args) => {
                    if (predicate(...args)) {
                        clearTimeout(rejectTimeout);
                        dispose();
                        res();
                    }
                });
        });
    }

    expect(eventName, predicate) {
        const buffer = this.eventBuffer[eventName];
        if (!buffer || !buffer.length)
            throw new Error(`Expected there to be at least one ${eventName}, but 0 were found.`)

        for (let i = 0; i < buffer.length; i++) {
            const args = buffer[i];

            if (!predicate(eventName, ...args))
                continue;

            buffer.splice(i, 1);
            return;
        }

        throw new Error(`No event found for ${eventName} matched the predicate!`);
    }

    expectAll(eventName, predicate) {
        const buffer = this.eventBuffer[eventName];
        if (!buffer || !buffer.length)
            throw new Error(`${this.logPrefix} expected there to be at least one ${eventName}, but 0 were found.`)

        for (let i = 0; i < buffer.length; i++) {
            const args = buffer[i];

            if (!predicate(eventName, ...args))
                throw new Error(`${this.logPrefix} Event ${eventName} with data ${JSON.stringify(...args)} did not match the all predicate!`);
        }

        this.eventBuffer[eventName] = [];
    }

    expectSequence(eventName, ...predicates) {
        const buffer = this.eventBuffer[eventName];
        if (!buffer || !buffer.length)
            throw new Error(`${this.logPrefix} expected there to be at least one ${eventName}, but 0 were found.`)

        if (buffer.length != predicates.length)
            throw new Error(`${this.logPrefix} expected there to be ${predicates.length} but ${buffer.length} were found.`)
            
        for (let i = 0; i < buffer.length; i++) {
            const args = buffer[i];
            let foundPredicateIndex = -1;

            for (let j = 0; j < predicates.length; j++) {
                if (!predicates[j](eventName, ...args))
                    continue;
                
                foundPredicateIndex = j;
                break;
            }

            if (foundPredicateIndex == -1)
                throw new Error(`${this.logPrefix} Event ${eventName} with data ${JSON.stringify(...args)} did not match the all predicate!`);

            predicates.splice(foundPredicateIndex, 1);
        }

        this.eventBuffer[eventName] = [];
    }

    reset() {
        this.eventBuffer = {};
    }
}
