const {
    ipcMain,
    ipcRenderer
} = require('electron');
const botManager = require(__dirname + "/../botManager");
const external = require(__dirname + "/../externalManager.js");
const axios = require("axios");

ipcMain.on("setExternal", (event, url) => {
    botManager.data.external = {
        url: url
    }
    external.validate();

    event.returnValue = true;
});

ipcMain.on("startOnExternalHost", (event, id) => {
    external.startBot(id);
});

ipcMain.on("loadExternal", (event) => {
    external.validate(() => {
        let url = botManager.data.external.url;
        axios.get(url + "/bots/running").then(res => {
            event.returnValue = res.data;
        }).catch(err => {
            global.sendError("Failed to fetch running: " + err, "external");
        });
    }, () => {
        global.sendLog("Negative callback recieved: loadExternal", "debug:external");
        event.returnValue = {}
    });
});

ipcMain.on("stopBotExternal", (event, id) => {
    external.validate(() => {
        let url = botManager.data.external.url;
        axios.post(url + "/bots/stop", {
            id: id
        }).then(res => {
            global.sendLog("Stopped bot: " + id, "external");
        }).catch(err => {
            global.sendError("Failed to stop bot: " + (err?.response?.data?.message || err), "external");
        });
    }, () => {
        global.sendLog("Negative callback recieved: stopBot", "debug:external");
        event.returnValue = {}
    });
});