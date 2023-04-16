const {
    ipcMain,
    BrowserWindow,
} = require('electron');
const database = require(__dirname + "/../database");
const path = require("path");

let currentlyEditing = null;
let editorWindow = null;

// Show the selected embed window
ipcMain.on("showEditor", (event, data = {}) => {
    if (["command", "event"].includes(data?.type) == false)
        return global.dbm.error("Invalid type: " + data?.type + " for showing code editor", "code-editor");

    if (data.type == "command" && !database.data.bots[database.data.selected].commands[data?.command])
        return global.dbm.error("Command not found: " + data?.command + " for showing code editor", "code-editor");

    currentlyEditing = data;

    // Create and show the embed window
    embedWindow = new BrowserWindow({
        parent: global.dbm.mainWindow,
        modal: true,
        title: "Command Editor",
        webPreferences: {
            preload: path.join(__dirname, '../view/js/preloadEditor.js')
        },
        autoHideMenuBar: true,
    });

    embedWindow.loadFile(path.join(__dirname, "../view/editCode.html"));
});

// Update embed data
ipcMain.on("updateCurrentCode", (event, data) => {
    if (currentlyEditing.type == "command") {
        database.data.bots[database.data.selected].commands[currentlyEditing.command].state = data.state;
        database.data.bots[database.data.selected].commands[currentlyEditing.command].js = data.js;
        database.data.bots[database.data.selected].pendingRestart = true;
    }
});

// Get the currently selected and editing embed (editingEmbed)
ipcMain.on("fetchCurrentCode", (event) => {
    if (currentlyEditing.type == "command") {
        event.returnValue = {
            state: database.data.bots[database.data.selected].commands[currentlyEditing.command].state
        }
    }
});

ipcMain.on("closeEmbed", () => {

});