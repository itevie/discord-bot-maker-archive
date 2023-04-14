const init = require("./server/init").init;
const botManager = require("./database");
const axios = require("axios");
const config = require("./config");
const WebSocket = require("ws").WebSocket;

let wsConnection = null;
let lastTry = 0;

module.exports.wsConnection = wsConnection;

module.exports.start = (port) => {
    global.dbm.log("Starting server on port " + port, "server");
    init(port);
}

module.exports.startWs = (port) => {
    if (!wsConnection) {
        try {
            module.exports.validate(function () {
                // Connect to the server's websocket for logging
                let url = botManager.data.external.url;
                let wsUrl = url.replace(/http/, "ws");
                global.dbm.log("Connecting to WS server: " + wsUrl, "external:ws");
                wsConnection = new WebSocket(wsUrl); // Create connection

                // When the WS connection has an error occurr
                wsConnection.on("error", (err) => {
                    global.dbm.error("WS error: " + err.toString(), "external:ws");
                });

                // When the WS connection is terminated
                wsConnection.on("close", (err) => {
                    global.dbm.log("WS Connection terminated", "external:ws");
                });

                // When the WS connection is opened
                wsConnection.on('open', function open() {
                    global.dbm.log("Successfully opened WS connection", "external:ws");
                });

                // When the server sends a message
                wsConnection.on('message', function message(data) {
                    data = JSON.parse(data);

                    switch (data.type) {
                        case "log": // The server sends a log event
                            global.dbm.log(data.data.text, "external:ws(" + data.data.type + ")", data.data.loader);
                            break;
                    }
                });
            });
        } catch (err) {
            // A WS connection failed
            global.dbm.log("Failed to connect to WS: " + err, "external")
        }
    }
}

// Function to validate the external URL
module.exports.validate = async (cb, ncb) => {
    global.dbm.log("Validing external host", "debug:external");

    // Check if it exists
    let url = botManager.data?.external?.url;
    if (!url) {
        if (ncb) ncb();
        return global.dbm.error("The external host URL is undefined.");
    }

    global.dbm.log("External host URL is " + url, "debug:external");

    // Send a GET request to the /information of the external's URL
    axios.get(url + "/information").then(res => {
        let data = res.data;
        if (data.version != config.version) {
            // There is an invalid version, it cannot continue
            global.dbm.error("External host: invalid version (app=" + config.version + ",server=" + data.version + ")", "error:external");
            if (ncb) ncb();
        } else {
            // Success, if the last try was longer than 10 seconds ago, try to retry to connect to the server
            if (cb) cb();
            if (10000 - (Date.now() - lastTry) < 0) {
                module.exports.startWs();
                lastTry = Date.now();
            }
        }
    }).catch(err => {
        // Axios failed to send the request, cannot continue
        global.dbm.log("Failed to fetch external host: " + err.toString(), "debug:external");
        global.dbm.error(err.toString());
        if (ncb) ncb();
    });
}

// Function to start a bot on the external server
module.exports.startBot = (id) => {
    global.dbm.log("Starting bot " + id + " on external host", "external");

    // Check if the bot exists
    if (!botManager.data.bots[id]) {
        return global.dbm.error("The bot: " + id + " does not exist!");
    }

    // Get the bot's data and validate the URL
    let botData = botManager.data.bots[id];
    module.exports.validate(function () {
        global.dbm.log("External host validated", "external");
        let url = botManager.data.external.url;

        // Send a post request to the external URL's /bots/start
        axios.post(url + "/bots/start", botData).then(res => {
            // Success
            global.dbm.log("Bot " + id + " successfully started on external host!", "external");
        }).catch(err => { // The server send a negative response
            // Send error
            if (err?.response?.data?.message) {
                global.dbm.error("Failed to start bot " + id + ": " + err.response.data.message, "external");
                return;
            }

            global.dbm.error("Failed to start bot " + id + ": " + err, "external");
        });
    });
}