const init = require("./server/init").init;
const botManager = require("./botManager");
const axios = require("axios");
const config = require("./config");
const WebSocket = require("ws").WebSocket;

let wsConnection = null;
let lastTry = 0;

module.exports.wsConnection = wsConnection;

module.exports.start = (port) => {
    global.sendLog("Starting server on port " + port, "server");
    init(port);
}

module.exports.startWs = (port) => {
    if (!wsConnection) {
        try {
            module.exports.validate(function () {
                let url = botManager.data.external.url;
                let wsUrl = url.replace(/http/, "ws");
                global.sendLog("Connecting to WS server: " + wsUrl, "external:ws");
                wsConnection = new WebSocket(wsUrl);

                wsConnection.on("error", (err) => {
                    global.sendError("WS fail: " + err.toString(), "external:ws");
                });

                wsConnection.on('open', function open() {
                    global.sendLog("Successfully opened WS connection", "external:ws");
                });

                wsConnection.on('message', function message(data) {
                    data = JSON.parse(data);

                    switch (data.type) {
                        case "log":
                            global.sendLog(data.data.text, "external:ws(" + data.data.type + ")", data.data.loader);
                            break;
                    }
                });
            });
        } catch (err) {
            global.sendLog("Failed to connect to WS: " + err, "external")
        }
    }
}

module.exports.validate = async (cb, ncb) => {
    global.sendLog("Validing external host", "debug:external");

    let url = botManager.data?.external?.url;
    if (!url) {
        if (ncb) ncb();
        return global.sendError("The external host URL is undefined.");
    }

    global.sendLog("External host URL is " + url, "debug:external");

    axios.get(url + "/information").then(res => {
        let data = res.data;
        if (data.version != config.version) {
            global.sendError("External host: invalid version (app=" + config.version + ",server=" + data.version + ")", "error:external");
            if (ncb) ncb();
        } else {
            if (cb) cb();
            if (10000 - (Date.now() - lastTry) < 0) {
                module.exports.startWs();
                lastTry = Date.now();
            }
        }
    }).catch(err => {
        global.sendLog("Failed to fetch external host: " + err.toString(), "debug:external");
        global.sendError(err.toString());
        if (ncb) ncb();
    });
}

module.exports.startBot = (id) => {
    global.sendLog("Starting bot " + id + " on external host", "external");

    if (!botManager.data.bots[id]) {
        return global.sendError("The bot: " + id + " does not exist!");
    }

    let botData = botManager.data.bots[id];
    module.exports.validate(function () {
        global.sendLog("External host validated", "external");
        let url = botManager.data.external.url;

        axios.post(url + "/bots/start", botData).then(res => {
            global.sendLog("Bot " + id + " successfully started on external host!", "external");
        }).catch(err => {
            if (err?.response?.data?.message) {
                global.sendError("Failed to start bot " + id + ": " + err.response.data.message, "external");
                return;
            }

            global.sendError("Failed to start bot " + id + ": " + err, "external");
        });
    });
}