// Require dependencies
global.sendLog = (text, type) => {    
    console.log("[" + type + "] " + text);
}

const Discord = require("discord.js");
const {
    app,
    BrowserWindow,
    ipcRenderer
} = require("electron");
const path = require("path");
const ipc = require("./ipc.js");
const botManager = require("./botManager");
const botRunner = require("./botRunner");
const external = require("./externalManager");
const fs = require("fs");
const config = require("./config");
require("./langParser");

external.validate();

// Load main window
const loadMainWindow = () => {
    global.sendLog("Loading window");
    global.mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Discord Bot Maker",
        webPreferences: {
            preload: path.join(__dirname, '/view/js/preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, "view/index.html"));

    global.sendLog("Created", "window");
    ipc.init();
}

/////////////////
/////EVENTS/////
///////////////

//Runs once app has loaded
app.on("ready", () => {
    let run = require("./cli.js").run;
    run(loadMainWindow);
});

//Runs once all windows have closed and the current OS doesnt close
//  application once all windows are closed (darwin)
app.on("window-all-closed", () => {
    global.sendLog("All windows closed", "window");
    botManager.save();
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    global.sendLog("Activated", "window");
    if (BrowserWindow.getAllWindows().length === 0) {
        loadMainWindow();
    }
});