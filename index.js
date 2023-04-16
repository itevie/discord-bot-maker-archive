// Require dependencies

// Fallback log
global.dbm = { window: {} };
global.dbm.log = (text, type) => {    
    console.log("[" + type + "] " + text);
}

if (process.argv[2] == "nw") {
    return require("./cli.js").run();
}

const Discord = require("discord.js");
const {
    app,
    BrowserWindow,
    ipcRenderer
} = require("electron");
const path = require("path");
const logger = require("./logger.js");
const ipc = require("./ipc.js");
const botManager = require("./database");
const botRunner = require("./botRunner");
const external = require("./externalManager");
const fs = require("fs");
const config = require("./config");
require("./langParser");
require("./updater");


external.validate();

// Load main window
const loadMainWindow = () => {
    global.dbm.log("Loading window", "window");
    global.dbm.mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Discord Bot Maker",
        webPreferences: {
            preload: path.join(__dirname, '/view/js/preload.js')
        },
        icon: __dirname + "/icon.ico"
    });

    global.dbm.mainWindow.loadFile(path.join(__dirname, "view/index.html"));

    global.dbm.log("Created", "window");
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
    global.dbm.log("All windows closed", "window");
    botManager.save();
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    global.dbm.log("Activated", "window");
    if (BrowserWindow.getAllWindows().length === 0) {
        loadMainWindow();
    }
});