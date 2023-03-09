const {
    ipcMain,
    app,
    ipcRenderer
} = require('electron');
const botManager = require(__dirname + "/../botManager");
const { log, clearLog } = require(__dirname + "/../ipc.js");
const logger = require(__dirname + "/../logger");
const botRunner = require(__dirname + "/../botRunner.js");
const fs = require("fs");

// Fetch database, returns database
ipcMain.on("fetchDatabase", (event) => {
    if (botManager.data.selected) {
        event.returnValue = botManager.data.bots[botManager.data.selected].database;
    } else {
        event.returnValue = null;
    }
});

// Add database item, returns success value
ipcMain.on("addDatabaseItem", (event, data) => {
    // Check if key is valid
    if (!data.key.match(/^([a-zA-Z_0-9\-]{1,})$/)) {
        return event.returnValue = "Key name is invalid"
    }

    botManager.data.bots[botManager.data.selected].database[data.key] = data.value;
    event.returnValue = true;
});

// Delete database item, returns success
ipcMain.on("deleteDBKey", (event, id) => {
    if (botManager.data.bots[botManager.data.selected].database[id]) {
        delete botManager.data.bots[botManager.data.selected].database[id];
    }

    event.returnValue = true;
});