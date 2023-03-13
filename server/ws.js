const ws = require("ws");
const uuid = require("uuid");

let clients = {

}
module.exports.init = (server) => {
    let oldSendLog = global.sendLog;
    global.sendLog = (text, type, loader = false) => {
        for (let i in clients) {
            clients[i].send(JSON.stringify(
                {
                    type: "log",
                    data: {
                        text: text,
                        type: type,
                        loader: loader
                    }
                }
            ));
        }

        oldSendLog(text, type, loader);
    }

    const wsServer = new ws.Server({
        noServer: true
    });

    wsServer.on('connection', socket => {
        let id = uuid.v4();
        clients[id] = socket;

        global.sendLog("New WS connection: " + id, "ws");

        socket.on("close", () => {
            global.sendLog("WS connection deleted: " + id, "ws");
            delete clients[id];
        });
    });

    server.on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, socket => {
            wsServer.emit('connection', socket, request);
        });
    });
}