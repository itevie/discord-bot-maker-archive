// Require dependencies
const Discord = require("discord.js");
const {
    app,
    BrowserWindow,
    ipcRenderer
} = require("electron");
const path = require("path");
const ipc = require("./ipc.js");
const logger = require("./logger");
const botManager = require("./botManager");
const botRunner = require("./botRunner");
require("./langParser");

// Load main window
const loadMainWindow = () => {
    logger.log("Loading window");
    global.mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Discord Bot Maker",
        webPreferences: {
            preload: path.join(__dirname, '/view/js/preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, "view/index.html"));

    logger.log("Created", "window");
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
    logger.log("All windows closed", "window");
    botManager.save();
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    logger.log("Activated", "window");
    if (BrowserWindow.getAllWindows().length === 0) {
        loadMainWindow();
    }
});