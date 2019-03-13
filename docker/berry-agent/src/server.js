const { writeFileSync } = require("fs");
const socketIo = require("socket.io-client");

const { BT_URL } = process.env;

const socket = socketIo.connect(BT_URL, {
    "connect timeout": 4500 + Math.random() * 1000,
    "reconnect": true,
    "reconnection delay": 500 + Math.random() * 1000,
    "reopen delay": 500 + Math.random() * 1000,
    "max reconnection attempts": 10,
    "transports": ["websocket"],
    "query": "agent=keepitsecretkeepitsafe"
});

socket.on("error", error => {
    console.error(`Could not connect to berrytube: ${error}`);
});

socket.on("connect", () => {
    socket.emit("register", ["hls"]);
});

socket.on("start", (channel, capability, args) => {
    capability = String(capability);
    
    if (capability == "hls") {
        socket.emit("channel", "open", channel);
    } else {
        socket.emit("channel", "error", channel, { message: `We do not support the ${capability} capability` });
    }
});

socket.on("stop", () => {
    socket.emit("setStatus", "STATUS_STOPPED");
});

class HlsTask {
    
}