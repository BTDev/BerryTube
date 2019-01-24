exports.sanitize = function (string) {
    if (typeof (string) == "undefined") {
        string = "I am a lazy hacker, mock me.";
    } else {
        string = string.replace(/</g, "&lt;");
        string = string.replace(/>/g, "&gt;");
    }
    return string;
}

exports.getAddress = function (socket) {
    try {
        return socket.handshake.headers["x-forwarded-for"];
    }
    catch (e) {
        console.log("Couldn't get IP from socket, so return false.");
        return false;
    }
}