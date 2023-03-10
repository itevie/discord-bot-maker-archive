const {
    ipcMain,
    ipcRenderer
} = require('electron');
const fs = require("fs");
const botManager = require("./botManager");
const botRunner = require("./botRunner");
const Discord = require("discord.js");
const getAllFiles = require("./getAllFiles");

module.exports.init = () => {
    let files = getAllFiles(__dirname + "/ipc");
    for (let i in files) {
        global.sendLog("Init IPC: " + files[i], "ipc");
        require(files[i]);
    }
}

let log = [];

global.sendLog = (text, type, loader = false) => {
    log.push({
        msg: text,
        type: type,
        showLoader: loader
    });

    try {
        global?.mainWindow?.webContents?.send("log", {
            msg: text,
            type: type,
            showLoader: loader
        });
    } catch (err) {

    }

    console.log("[" + type + "] " + text);
}

global.sendError = (text) => {
    global.sendLog(text, "error");
    global?.mainWindow?.webContents?.send("error", {
        type: "alert",
        force: true,
        msg: text
    });
}

global.sendNotification = (title, icon = "info", desc = "") => {
    global?.mainWindow?.webContents?.send("notification", {
        title: title,
        icon: icon,
        desc: desc
    });
}

module.exports.clearLog = () => log = [];
module.exports.log = log;