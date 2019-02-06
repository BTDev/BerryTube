const { ServiceBase } = require("../base");
const { getSocketName } = require("../socket");
const { getAddress } = require("../security");
const { events } = require("../log");
const { toggles } = require("../toggles")

const defaultIsTypingExpirationInMilliseconds = 5000;

exports.UserService = class extends ServiceBase {
    get state() {
        return {
            users: Object
                .keys(this.users)
                .reduce((acc, nick) => {
                    acc[nick] = this.users[nick].state;
                    return acc;
                }, {})
        };
    }
    
    constructor({ io, toggle, log }) {
        super({ log });
        this.toggle = toggle;
        this.io = io;
        this._onUserPropChanged = this._onUserPropChanged.bind(this);
        this.users = {};
        this.dirtyUsers = new Map();

        this.exposeSocketActions({
            "disconnect": this.removeSocket.bind(this)
        });
    }

    addUser(socket, data) {
        const { nick } = data;

        if (this.users.hasOwnProperty(nick)) {
            const existing = this.users[nick];

            // if nicks conflict, then there is an issue with ifNickFree
            this.log.error(events.EVENT_SOCKET, 
                "socket from ip {ip} is logging in as {nick}, but there is already a user active with the ip of {ip2}",
                { ip: getAddress(socket), ip2: getAddress(existing.socket), nick: nick });

            // intentially not throwing here... let the nick be overriden with the new socket/data
            existing.dispose();
        }
        
        const user = new User({ socket, log: this.log, toggle: this.toggle }, data, this._onUserPropChanged);
        this.users[nick] = user;

        socket.on("setUserState", state => {
            try {
                user.setState({ isTyping: Boolean(state.isTyping) });
            } catch (e) { 
                this.log.error(events.EVENT_SOCKET, 
                    "nick {nick} from ip {ip} tried to set {keys}, but everything exploded.",
                    { ip: getAddress(socket), nick: nick, keys: Object.keys(state) }, e);
            }
        });
    }

    async removeSocket(socket) {
        const nick = getSocketName(socket);
        if (!nick || !this.users.hasOwnProperty(nick)) {
            // if we can't locate this socket, then it isn't the end of the world
            return;
        }

        // currently, other logic handles telling other clients that this user has disconnected
        // so all we have to do is remove it from our users map 
        this.users[nick].dispose();
        delete this.users[nick];
    }
    
    onTick(elapsedMilliseconds) {
        if (this.toggle.get(toggles.isTypingIndicatorEnabled)) {
            for (const nick in this.users) {
                if (!this.users.hasOwnProperty(nick))
                    continue;

                this.users[nick].onTick(elapsedMilliseconds);
            }
        }

        if (!this.dirtyUsers.size)
            return;

        const partialState = {};
        for (const [nick, dirtyProps] of this.dirtyUsers) {
            const userUpdate = {};
            const user = this.users[nick];
            
            for (const prop of dirtyProps.values()) {
                userUpdate[prop] = user.state[prop];
            }

            partialState[nick] = userUpdate;
        }

        this.io.sockets.emit("setUserState", {users: partialState});
        this.dirtyUsers.clear();
    }

	onSocketConnected(socket) {
        super.onSocketConnected(socket);
        socket.emit("setUserState", this.state);
    }

    _onUserPropChanged(user, propSetToAdd) {
        let currentPropSet;
        
        if (this.dirtyUsers.has(user.data.nick)) {
            currentPropSet = this.dirtyUsers.get(user.data.nick);
        } else {
            currentPropSet = new Set();
            this.dirtyUsers.set(user.data.nick, currentPropSet);
        }

        for (const prop of propSetToAdd) {
            currentPropSet.add(prop);
        }
    }
}

class User {
    constructor({ socket, log, toggle }, { nick, type, meta, gold: hasGold }, onNotifyPropertyChanged) {
        this.log = log;
        this.socket = socket;
        this.data = { nick, type, meta, hasGold };
        this.state = { isTyping: false };
        this.onNotifyPropertyChanged = onNotifyPropertyChanged;
        this.toggle = toggle;

        this.disposeActions = [
            this.toggle.addListener((toggle, state) => {
                if (toggle != toggles.isTypingIndicatorEnabled)
                    return;

                if (!state) {
                    this.setState({isTyping: false})
                }
            })
        ];
    }

    setState({ isTyping }) {
        isTyping = this.toggle.get(toggles.isTypingIndicatorEnabled)
            ? isTyping
            : false;
        
        const dirtyProps = new Set();
        
        if (this.state.isTyping != isTyping) {
            this.state.isTyping = isTyping;
            dirtyProps.add("isTyping");
        }

        if (dirtyProps.size)
            this.onNotifyPropertyChanged(this, dirtyProps);

        if (isTyping)
            this.isTypingExpirationInMilliseconds = defaultIsTypingExpirationInMilliseconds;
    }

    onTick(elapsedMilliseconds) {
        if (!this.state.isTyping)
            return;

        this.isTypingExpirationInMilliseconds -= elapsedMilliseconds;
        if (this.isTypingExpirationInMilliseconds > 0)
            return;

        this.setState({isTyping: false})
    }

    dispose() {
        this.disposeActions.forEach(d => d());
    }
}