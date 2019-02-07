const { parseFormat } = require("../utils");

const levels = exports.levels = {
    DISABLED: 999,

    LEVEL_DEBUG: 1,
    LEVEL_INFORMATION: 2,
    LEVEL_ERROR: 3
};

const stackTraceRegex = /\((.*?)\:(\d+)\:\d+/gi;

exports.LogService = class {
    constructor(defaultLevel = levels.LEVEL_DEBUG, levelOverrides = {}) {
        this.defaultLevel = defaultLevel;
        this.levelOverrides = levelOverrides;
        this.loggers = [];
    }

    now() {
        return new Date();
    }
    
    addLogger(...loggers) {
        this.loggers.push(...loggers);
    }

    setOverride(event, levelOverride) {
        this.levelOverrides[event] = levelOverride;
    }
    
    async addMessage(level, event, format, data = null, error = null) {
        if (level < this.defaultLevel || (this.levelOverrides.hasOwnProperty(event) && level < this.levelOverrides[event]))
            return;

        if (typeof(format) === "undefined")
            format = "<undefined>";
        else if (typeof(format) !== "string")
            format = format.toString();

        if (data) {
            // resolve all of the data promises
            for (const piece in data) {
                if (!data.hasOwnProperty(piece))
                    continue;

                const value = data[piece];
                if (!value || !value.then)
                    continue;

                data[piece] = await value;
            }
        }
        
        if (level === levels.LEVEL_DEBUG) {
            // if this is a DEBUG, find out what line it executed on. This isn't the quickest thing in the world, however debug-level messages should be
            // disabled in production unless you're activly debugging something
            const trace = new Error().stack.split("\n");
            const debugParts = [];
            let matchIndex = 0;
            for (let i = 0; i < trace.length; i++) {
                const match = stackTraceRegex.exec(trace[i]);
                if (!match)
                    continue;

                if (matchIndex++ == 0)
                    continue;

                debugParts.push(`${match[1]}:${match[2]}`);
            }

            if (debugParts.length) {
                const debugFrom = debugParts.join(" -> ");

                if (data)
                    data.debugFrom = debugFrom;
                else
                    data = { debugFrom };

                format += " at {debugFrom}";
            }
        }

        let formatted;
        if (typeof data === "object") {
            const formattedParts = [];
    
            parseFormat(format, (type, match) => {
                if (type == "constant") {
                    formattedParts.push(match);
                    return;
                }
                
                const value = data[match];
                const toPrint = typeof(value) == "undefined"
                    ? "{undefined}"
                    : value == null
                        ? "{null}"
                        : value.toString()
                
                formattedParts.push(toPrint);
            });
    
            formatted = formattedParts.join("");
        } else
            formatted = format;

        const message = {level, event, format, data, error, formatted, createdAt: this.now()};
        for (const logger of this.loggers)
            logger(message);
    }

    debug(...args) {
        return this.addMessage(levels.LEVEL_DEBUG, ...args);
    }

    info(...args) {
        return this.addMessage(levels.LEVEL_INFORMATION, ...args);
    }

    error(...args) {
        return this.addMessage(levels.LEVEL_ERROR, ...args);
    }
};