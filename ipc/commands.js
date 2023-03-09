const {
    ipcMain,
    ipcRenderer
} = require('electron');
const botManager = require(__dirname + "/../botManager");

// Create command, does return something,
ipcMain.on("createCommand", (event, data) => {
    botManager.data.bots[botManager.data.selected].commands[data.name] = data;
    botManager.data.bots[botManager.data.selected].pendingRestart = true;

    global.sendLog("Command Created", "ipc");
    event.returnValue = true;
});

// Create command, does return something
ipcMain.on("deleteCommand", (event, id) => {
    // If command exists, delete it
    if (botManager.data.bots[botManager.data.selected].commands[id]) {
        delete botManager.data.bots[botManager.data.selected].commands[id];
        botManager.data.bots[botManager.data.selected].pendingRestart = true;
    } else {
        global.sendLog("Command " + id + " did not exist, nothing happened.", "ipc:deleteCommand");
    }
    
    global.sendLog("Command Deleted", "ipc:deleteCommand");
    event.returnValue = true;
})