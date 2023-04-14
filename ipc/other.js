const {
    ipcMain,
    ipcRenderer,
    BrowserWindow,
    app
} = require('electron');
const botManager = require(__dirname + "/../database");
const path = require("path");
const config = require(__dirname + "/../config.js");
const langs = require(__dirname + "/../langParser.js");
const execute = require(__dirname + "/../discord/utils/execute.js");
const errorManager = require(__dirname + "/../errorManager");
const logger = require(__dirname + "/../logger.js");
const fs = require("fs");
const os = require('os');

ipcMain.on("getFullLog", (event) => {
    event.returnValue = logger.log;
})

// Open an external link in a browser
ipcMain.on("openExternalLink", (event, url) => {
    global.dbm.log("Opening external link: " + url, "ipc");

    // Check if it is safe
    if (!url.startsWith("https://")) return;
    require("electron").shell.openExternal(url);
});

let aboutWindow = null;

// Show the about window
ipcMain.on("showAbout", (event) => {
    // Create the about window
    aboutWindow = new BrowserWindow({
        width: 500,
        height: 500,
        parent: global.dbm.mainWindow,
        modal: true,
        title: "About",
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, '../view/js/preloadAbout.js')
        },
        autoHideMenuBar: true,
        minimizable: false,
    });

    aboutWindow.loadFile(path.join(__dirname, "../view/about.html"));
});

ipcMain.on("closeAbout", () => {
    aboutWindow.close();
    aboutWindow = null;
});

// Get the applications config
ipcMain.on("getConfig", (event) => {
    event.returnValue = config;
});

// Deprecated
ipcMain.on("fetchLangs", (event) => {
    event.returnValue = langs;
});

// Get a list of all articles
ipcMain.on("fetchFaqList", (event) => {
    let files = fs.readdirSync(__dirname + "/../faq");
    let arr = [];
    for (let i in files) {
        arr.push(files[i].replace(".html", ""));
    }
    event.returnValue = arr;
});

// Get the process data, memory etc.
ipcMain.on("getProcessData", (event) => {
    let r = {
        memory: {
            free: os.freemem(),
            total: os.totalmem(),
            process: process.memoryUsage()
        }
    };

    event.returnValue = r;
});

// Get a list of all actions
ipcMain.on("fetchWebActions", (event) => {
    event.returnValue = execute.webActions;
});

// Create a backup of a bot
ipcMain.on("backup", (event, id) => {
    let botData = botManager.data.bots[id];
    let path = app.getPath("userData");
    if (!fs.existsSync(path + "/backups/")) fs.mkdirSync(path + "/backups");
    if (!fs.existsSync(path + "/backups/bots/")) fs.mkdirSync(path + "/backups/bots");
    fs.writeFileSync(path + "/backups/bots/" + id + "-" + (Date.now()).toString() + ".json", JSON.stringify(botData, null, 2));
    let bPath = path + "/backups/bots/" + id + "-" + (Date.now()).toString() + ".json";

    global.dbm.mainWindow.webContents.send("success", {
        type: "alert",
        msg: "Created backup at: " + bPath,
        force: true
    });
});

ipcMain.on("createLogFile", () => {
    errorManager.createLog();
})