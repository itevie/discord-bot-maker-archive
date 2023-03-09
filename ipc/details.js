const {
    ipcMain,
    app,
    ipcRenderer
} = require('electron');
const botManager = require(__dirname + "/../botManager");
const { log, clearLog } = require(__dirname + "/../ipc.js");
const botRunner = require(__dirname + "/../botRunner.js");
const fs = require("fs");

// Get the running bots list
ipcMain.on("runningBotList", (event, data) => {
    let list = botRunner.getList();
    event.returnValue = list;
});

// Get the current log
ipcMain.on("fetchLog", (event) => {
    event.returnValue = log;
});

// Clear the log
ipcMain.on("clearLog", (event) => {
    clearLog();
});

// Get the selected bot
ipcMain.on("get-current-bot", (event) => {
    event.returnValue = botManager.data.bots[botManager.data.selected];
});

// Get an FAQ article
ipcMain.on("getFAQ", (event, id) => {
    let faq = fs.readFileSync(__dirname + "/../faq/" + id + ".html", "utf-8");
    event.returnValue = faq;
});

// Get the full bot list
ipcMain.on("get-bot-list", (event, data) => {
    global.sendLog("get-bot-list", "ipc");
    event.returnValue = Object.keys(botManager.data.bots);
});

// Get list of valid actions
ipcMain.on("get-action-list", (event) => {
    event.returnValue = require(__dirname + "/../discord/utils/execute").getListOfActions();
});

// Restart app
ipcMain.on("restartApp", (event) => {
    botManager.save();
    app.relaunch();
    app.quit();
});