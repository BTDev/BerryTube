const { ServiceBase } = require("../base");
const { getAddress, sanitize } = require("../security");
const { events } = require("../log/events");

const agentTypes = {
	"hls": require("./task-hls").HlsTask,
};

let nextAgentId = 1;

const _removeAgent = Symbol("#removeAgent");

exports.AgentsService = class extends ServiceBase {
	constructor(services) {
        super(services);
        
        this.agents = {};
        this.tasks = [];

		this.exposeSocketActions({
            "register": this.registerAgent.bind(this),
            
            "disconnect": (socket) =>
                this.agents[socket.get("agentId")].dispose(),
            
            "channel": (socket, event, ...args) =>
                this.agents[socket.get("agentId")].on(event, ...args),
		});
    }

    async registerAgent(socket, { capabilities }) {
        const agent = new Agent(this, nextAgentId++, socket, capabilities);
        socket.set("agentId", agent.id);

        this.log.info(events.EVENT_AGENT_REGISTERD, 
            "agent {name} connected with {capabilities} capabilities", 
            { name: agent.name, capabilities: agent.capabilities });

        this.agents[agent.id] = agent;
    }

    async [_removeAgent](agent) {
        // removes the agent and shuffles its tasks around to other available agents
        if (!this.agents.hasOwnProperty(agent))
            return;

        delete this.agents[agent.id];

        this.log.info(events.EVENT_AGENT_REMOVED, 
            "agent {name} was removed", 
            { name: agent.name });

        for (const task of this.tasks) {
            if (task.agent !== agent)
                continue;

            task.stop();
        }
    }

    beginTask(capability, args) {
        const ctor = agentTypes[capability];

        if (!ctor)
            throw new Error(`Cannot begin task because capability ${capability} was not found.`);

        const task = new TaskManager(this, capability, args);
        this.tasks.push(task);

        for (const agent of this.agents) {
            if (!agent.canAccept(task))
                continue;

            task.start(agent);
        }
    }

    onSocketConnected() {
        // do not register our agent API against normal sockets
    }
};

const STATUS = module.exports.STATUS = {
    READY: 1,
    STARTING: 2,
    STARTED: 3,
    STOPPING: 4,
    DISPOSED: 5,
    WAITING: 6,
};

class TaskManager {
    get status() {
        return this._state.status;
    }
    
    constructor(service, id, capability, args) {
        this.service = service;
        this.id = id;
        this.capability = capability;
        this.args = args;
        this.retryIn = 0;
        this.disposeRequested = false;
        this._go(this._stateReady());
    }

    _handleChannelMessage(channel, message) {
        console.log(`Got message ${JSON.stringify(message)} from channel`)
    }

    _stateReady() {
        return {
            status: STATUS.READY,

            start: (agent) => 
                this._go(this._stateStarting(agent)),

            dispose: () => 
                this._go(this._stateDisposed()),
        };
    }

    _stateStarting(agent) {
        const channel = agent.openChannel(this);

        return {
            status: STATUS.STARTING,

            channelOpen: () => 
                this._go(this._stateStarted(channel)),

            channelError: () => { 
                channel.dispose(); 
                this._go(this._stateWaiting(5000, () => this._stateReady())); 
            },

            dispose: () => { 
                channel.dispose(); 
                this._go(this._stateDisposed()); 
            },
        };
    }

    _stateStarted(channel) {
        return {
            status: STATUS.STARTED,

            channelMessage: (message) => 
                this._handleChannelMessage(channel, message),

            channelError: () => { 
                channel.dispose(); 
                this._go(this._stateWaiting(5000, () => this._stateReady())) 
            },

            dispose: () => {
                channel.dispose(); 
                this._go(this._stateDisposed()) 
            },
        };
    }

    _stateWaiting(time, nextStateFactory) {
        setTimeout(time, () => this._go(nextStateFactory()));
        
        return {
            status: STATUS.WAITING,

            dispose: () => 
                this._go(this._stateDisposed()),
        }
    }

    _stateDisposed() {
        return {
            status: STATUS.DISPOSED,
        };
    }

    _go(state) {
        this._state = state;

        for (const event in state) {
            if (!state.hasOwnProperty(event))
                continue;
            
            if (this[event])
                continue;

            this[event] = (...args) => this._state[event](...args);
        }
    }
}

let nextChannelId = 1;

class Agent {
    get name() {
        return `${this.id} (${this.ip})`;
    }
    
    constructor(service, id, socket, capabilities) {
        this.service = service;
        this.id = id;
        this.socket = socket;
        this.ip = getAddress(socket);
        this.status = AGENT_STATUS.STATUS_READY;
        this.isDisposed = false;
        this.capabilities = capabilities
            .reduce((a, c) => { a[c] = true; return a; }, { });
    }

    canAccept(task) {
        return (
            this.status == AGENT_STATUS.STATUS_READY && 
            this.capabilities[task.capability]);
    }
    
    openChannel(taskManager) {
        const id = nextChannelId++;
        const channel = {
            id,
            taskWrap: taskManager,
            emit: (...args) => {
                this.socket.emit("setMessage", id, ...args);
            },
            dispose: () => {
                if (!this.channels.hasOwnProperty(id))
                    return;

                this.socket.emit("closeChannel", id);
                delete this.channels[id];
            }
        };
        
        this.channels[id] = channel;

        this.socket.emit("openChannel", id, taskManager.capability, taskManager.args);
    }

    onChannelMessage(channelId, args) {
        this.channels[channelId].taskWrap.channelMessage(args);
    }

    onChannelError(channelId, args) {
        this.channels[channelId].taskWrap.channelError(args);
    }

    onChannelOpen(channelId, args) {
        this.channels[channelId].taskWrap.channelOpen(args);
    }

    dispose() {
        if (this.isDisposed)
            return;

        this.isDisposed = true;
        
        for (const channel of this.channels)
            channel.taskWrap.channelError("Agent was disposed");

        this.channels = [];
        this.socket.disconnect();
    }
}