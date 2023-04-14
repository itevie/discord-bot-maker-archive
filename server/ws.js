const ws = require("ws");
const uuid = require("uuid");

let clients = {}

/**
 * Function to init the WS server
 * @param {http.Server} server // The server to add the ws server too
 */
module.exports.init = (server) => {
    let oldSendLog = global.dbm.log;
    
    // Override the current log, so that it can send a log via ws
    global.dbm.log = (text, type, loader = false) => {
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

    // Create the ws server
    const wsServer = new ws.Server({
        noServer: true
    });

    // When a ws connection happens
    wsServer.on('connection', socket => {
        let id = uuid.v4(); // Create ID
        clients[id] = socket; // Add it to client object

        global.dbm.log("New WS connection: " + id, "ws");

        // When it is closed, remove the client from the object
        socket.on("close", () => {
            global.dbm.log("WS connection deleted: " + id, "ws");
            delete clients[id];
        });
    });

    // No idea how this works it just does
    server.on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, socket => {
            wsServer.emit('connection', socket, request);
        });
    });
}