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
            global.dbm.error("Failed to fetch running: " + err, "external");
        });
    }, () => {
        global.dbm.log("Negative callback recieved: loadExternal", "debug:external");
        event.returnValue = {}
    });
});

ipcMain.on("stopBotExternal", (event, id) => {
    external.validate(() => {
        let url = botManager.data.external.url;
        axios.post(url + "/bots/stop", {
            id: id
        }).then(res => {
            global.dbm.log("Stopped bot: " + id, "external");
        }).catch(err => {
            global.dbm.error("Failed to stop bot: " + (err?.response?.data?.message || err), "external");
        });
    }, () => {
        global.dbm.log("Negative callback recieved: stopBot", "debug:external");
        event.returnValue = {}
    });
});

ipcMain.on("deleteExternal", (event) => {
    if (botManager.data.external) {
        delete botManager.data.external;
    }

    if (external.wsConnection) {
        external.wsConnection.close();
        external.wsConnection = null;
    }
});

ipcMain.on("syncExternal", (event, data) => {
    console.log(data)
    if (data.type == "to") {
        let what = data.what;
        let d = null;

        switch (what) {
            case "all":
                d = botManager.data.bots[botManager.data.selected];
                break;
            case "database":
                d = botManager.data.bots[botManager.data.selected].database;
                break;
            case "commands":
                d = botManager.data.bots[botManager.data.selected].commands;
                break;
            case "resources":
                d = botManager.data.bots[botManager.data.selected].resources;
                break;
            case "events":
                d = botManager.data.bots[botManager.data.selected].events;
                break;
        }

        external.validate(async () => {
            let url = botManager.data.external.url;
            console.log(url)
            let res = await axios.post(url + "/sync", {
                type: what,
                data: d,
                botId: botManager.data.selected
            }).catch(err => {
                global.dbm.error("Failed to sync: " + (err?.response?.data?.message || err), "external");
                event.returnValue = false;
            });
        }, () => {
            global.dbm.log("Negative callback recievd for syncExternal", "external");
            event.returnValue = false;
        });
    }
});