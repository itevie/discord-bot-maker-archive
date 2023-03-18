const {
    ipcMain,
    BrowserWindow,
} = require('electron');
const botManager = require(__dirname + "/../botManager");
const path = require("path");

let editingEmbed = null;
let embedWindow = null;

// Show the selected embed window
ipcMain.on("showEmbed", (event, name) => {
    // If it does not exist, create it
    if (!botManager.data.bots[botManager.data.selected].resources.embeds[name]) {
        botManager.data.bots[botManager.data.selected].resources.embeds[name] = [{
            title: "My new embed",
            description: "My awesome embed!"
        }];
    }

    editingEmbed = name;

    // Create and show the embed window
    embedWindow = new BrowserWindow({
        parent: global.dbm.mainWindow,
        modal: true,
        title: "Embed Editor",
        webPreferences: {
            preload: path.join(__dirname, '../view/embedEditor/preloadEmbed.js')
        },
        autoHideMenuBar: true,
    });

    embedWindow.loadFile(path.join(__dirname, "../view/embedEditor/embedEditor.html"));
});

// Update embed data
ipcMain.on("updateEmbed", (event, data) => {
    // If it does not exist, create it
    if (!botManager.data.bots[botManager.data.selected].resources.embeds[data.name]) {
        botManager.data.bots[botManager.data.selected].resources.embeds[data.name] = [{
            title: "My new embed",
            description: "My awesome embed!"
        }];
    }

    // Set the data, turn embed: {} into embeds: [{<embed>}]
    let setTo = [];
    if (!data.data[0]) data.data = [data.data];
    setTo = data.data;

    botManager.data.bots[botManager.data.selected].resources.embeds[data.name] = setTo;
    botManager.data.bots[botManager.data.selected].pendingRestart = true;
});

// Delete an embed
ipcMain.on("deleteEmbed", (event, name) => {
    // Check if it exists
    if (botManager.data.bots[botManager.data.selected].resources.embeds[name]) {
        delete botManager.data.bots[botManager.data.selected].resources.embeds[name];
        global.dbm.window.notification("Embed " + name + " has been deleted", "success");
    } else {
        global.dbm.window.notification("Failed to delete", "error", "The embed " + name + " does not exist!")
    }
})

// Get a list of al embeds, returns the list
ipcMain.on("getAllEmbeds", (event) => {
    if (!botManager.data?.bots[botManager.data?.selected]?.resources?.embeds) return event.returnValue = null;
    event.returnValue = botManager.data.bots[botManager.data.selected].resources.embeds;
});

// Get the currently selected and editing embed (editingEmbed)
ipcMain.on("getCurrentEmbed", (event) => {
    if (!editingEmbed) event.returnValue = false;
    else event.returnValue = {
        name: editingEmbed,
        data: botManager.data.bots[botManager.data.selected].resources.embeds[editingEmbed]
    }
})

ipcMain.on("closeEmbed", () => {
    embedWindow.close();
    embedWindow = null;
});