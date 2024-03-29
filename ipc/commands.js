const {
    ipcMain,
    ipcRenderer
} = require('electron');
const botManager = require(__dirname + "/../database");

// Create command, does return something,
ipcMain.on("createCommand", (event, data) => {
    let temp = structuredClone(botManager.data.bots[botManager.data.selected].commands[data.name] || {});
    console.log(temp)
    botManager.data.bots[botManager.data.selected].commands[data.name] = data;
    botManager.data.bots[botManager.data.selected].pendingRestart = true;

    if (temp.state) botManager.data.bots[botManager.data.selected].commands[data.name].state = temp.state;
    if (temp.js) botManager.data.bots[botManager.data.selected].commands[data.name].js = temp.js;

    global.dbm.log("Command Created", "ipc");
    event.returnValue = true;
});

// Create command, does return something
ipcMain.on("deleteCommand", (event, id) => {
    // If command exists, delete it
    if (botManager.data.bots[botManager.data.selected].commands[id]) {
        delete botManager.data.bots[botManager.data.selected].commands[id];
        botManager.data.bots[botManager.data.selected].pendingRestart = true;
    } else {
        global.dbm.log("Command " + id + " did not exist, nothing happened.", "ipc:deleteCommand");
    }
    
    global.dbm.log("Command Deleted", "ipc:deleteCommand");
    event.returnValue = true;
})