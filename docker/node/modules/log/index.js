module.exports = {
    ...require("./service"),
    ...require("./middleware"),
    ...require("./events"),
    ...require("./logger-console"),
    ...require("./logger-stream")
};

module.exports.DefaultLog = new module.exports.LogService();