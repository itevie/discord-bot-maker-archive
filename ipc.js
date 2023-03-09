const {
    ipcMain,
    ipcRenderer
} = require('electron');
const fs = require("fs");
const botManager = require("./botManager");
const botRunner = require("./botRunner");
const Discord = require("discord.js");
const logger = require("./logger");
const getAllFiles = require("./getAllFiles");

module.exports.init = () => {
    let files = getAllFiles(__dirname + "/ipc");
    for (let i in files) {
        logger.log("Init IPC: " + files[i]);
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

    global?.mainWindow?.webContents?.send("log", {
        msg: text,
        type: type,
        showLoader: loader
    });

    console.log("[" + type + "] " + text);
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