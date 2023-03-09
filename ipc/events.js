const {
    ipcMain,
    ipcRenderer
} = require('electron');
const botManager = require(__dirname + "/../botManager");
const botRunner = require(__dirname + "/../botRunner.js");

// Create event, returns success
ipcMain.on("createEvent", (event, data) => {
    // Validate the type
    let type = data.type;
    if (!type) return event.returnValue = "Invalid event type";

    // Creates the event
    botManager.data.bots[botManager.data.selected].events[type] = {
        actions: data.actions
    };

    return event.returnValue = true;
});