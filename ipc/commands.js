const {
    ipcMain,
    ipcRenderer
} = require('electron');
const botManager = require(__dirname + "/../botManager");
const logger = require(__dirname + "/../logger");

// Create command, does return something,
ipcMain.on("createCommand", (event, data) => {
    botManager.data.bots[botManager.data.selected].commands[data.name] = data;
    botManager.data.bots[botManager.data.selected].pendingRestart = true;

    logger.log("Command Created", "ipc");
    event.returnValue = true;
});

// Create command, does return something
ipcMain.on("deleteCommand", (event, id) => {
    // If command exists, delete it
    if (botManager.data.bots[botManager.data.selected].commands[id]) {
        delete botManager.data.bots[botManager.data.selected].commands[id];
        botManager.data.bots[botManager.data.selected].pendingRestart = true;
    } else {
        logger.log("Command " + id + " did not exist, nothing happened.", "ipc:deleteCommand");
    }
    
    logger.log("Command Deleted", "ipc:deleteCommand");
    event.returnValue = true;
})