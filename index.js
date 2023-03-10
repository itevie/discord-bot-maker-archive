// Require dependencies
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
const fs = require("fs");
const config = require("./config");
require("./langParser");

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
    if (process.argv[2]) {
        if (botManager.data.bots[process.argv[2]]) {
            console.log("Starting bot!");
            botRunner.run(process.argv[2]);
        } else {
            console.log("Bot " + (process.argv[2]) + " not found!");
            process.exit(0);
        }
    } else {
        loadMainWindow();
    }
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