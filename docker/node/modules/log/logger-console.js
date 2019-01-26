const { levels } = require("./service.js");

exports.consoleLogger = ({level, formatted, error, event, createdAt}) => {
    formatted = `<${createdAt.toUTCString()}> ${event}: ${formatted}`
    
    if (level == levels.LEVEL_ERROR) {
        console.error(formatted);

        if (error)
            console.error(error.stack || error);
    } else {
        console.log(formatted);

        if (error)
            console.log(error.stack || error);
    }
};