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
                let url = botManager.data.external.url;
                let wsUrl = url.replace(/http/, "ws");
                global.dbm.log("Connecting to WS server: " + wsUrl, "external:ws");
                wsConnection = new WebSocket(wsUrl);

                wsConnection.on("error", (err) => {
                    global.dbm.error("WS fail: " + err.toString(), "external:ws");
                });

                wsConnection.on("close", (err) => {
                    global.dbm.log("WS Connection terminated", "external:ws");
                });

                wsConnection.on('open', function open() {
                    global.dbm.log("Successfully opened WS connection", "external:ws");
                });

                wsConnection.on('message', function message(data) {
                    data = JSON.parse(data);

                    switch (data.type) {
                        case "log":
                            global.dbm.log(data.data.text, "external:ws(" + data.data.type + ")", data.data.loader);
                            break;
                    }
                });
            });
        } catch (err) {
            global.dbm.log("Failed to connect to WS: " + err, "external")
        }
    }
}

module.exports.validate = async (cb, ncb) => {
    global.dbm.log("Validing external host", "debug:external");

    let url = botManager.data?.external?.url;
    if (!url) {
        if (ncb) ncb();
        return global.dbm.error("The external host URL is undefined.");
    }

    global.dbm.log("External host URL is " + url, "debug:external");

    axios.get(url + "/information").then(res => {
        let data = res.data;
        if (data.version != config.version) {
            global.dbm.error("External host: invalid version (app=" + config.version + ",server=" + data.version + ")", "error:external");
            if (ncb) ncb();
        } else {
            if (cb) cb();
            if (10000 - (Date.now() - lastTry) < 0) {
                module.exports.startWs();
                lastTry = Date.now();
            }
        }
    }).catch(err => {
        global.dbm.log("Failed to fetch external host: " + err.toString(), "debug:external");
        global.dbm.error(err.toString());
        if (ncb) ncb();
    });
}

module.exports.startBot = (id) => {
    global.dbm.log("Starting bot " + id + " on external host", "external");

    if (!botManager.data.bots[id]) {
        return global.dbm.error("The bot: " + id + " does not exist!");
    }

    let botData = botManager.data.bots[id];
    module.exports.validate(function () {
        global.dbm.log("External host validated", "external");
        let url = botManager.data.external.url;

        axios.post(url + "/bots/start", botData).then(res => {
            global.dbm.log("Bot " + id + " successfully started on external host!", "external");
        }).catch(err => {
            if (err?.response?.data?.message) {
                global.dbm.error("Failed to start bot " + id + ": " + err.response.data.message, "external");
                return;
            }

            global.dbm.error("Failed to start bot " + id + ": " + err, "external");
        });
    });
}