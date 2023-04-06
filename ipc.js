const {
    ipcMain,
    ipcRenderer
} = require('electron');
const fs = require("fs");
const clc = require("cli-color");
const botManager = require("./database");
const botRunner = require("./botRunner");
const Discord = require("discord.js");
const getAllFiles = require("./getAllFiles");

module.exports.init = () => {
    let files = getAllFiles(__dirname + "/ipc");
    for (let i in files) {
        global.dbm.log("Init IPC: " + files[i], "ipc");
        require(files[i]);
    }
}

let log = [];

global.dbm.log = (text, type, loader = false) => {
    log.push({
        msg: text,
        type: type,
        showLoader: loader
    });

    try {
        global?.dbm?.mainWindow?.webContents?.send("log", {
            msg: text.toString(),
            type: type,
            showLoader: loader
        });
    } catch (err) {
        console.log(err)
    }

    let time = "(" + new Date().toLocaleString() + ") ";

    if (type?.startsWith("error")) {
        console.log(time + clc.red.bold("[" + type + "] " + text));
    }
    else console.log(time + "[" + type + "] " + text);
}

global.dbm.error = (text) => {
    global.dbm.log(text, "error");
    try {
        global?.dbm?.mainWindow?.webContents?.send("error", {
            type: "alert",
            force: true,
            msg: text.toString()
        });
    } catch (err) {
        global.dbm.log(err.toString(), "error");
    }
}

global.dbm.window.notification = (title, icon = "info", desc = "") => {
    console.log();

    let ic = "";
    if (icon == "info") ic = clc.blue.bold("Info");
    else if (icon == "error") ic = clc.red.blod("Error");
    else if (icon == "warning") ic = clc.yellow.bold("Warning");
    else if (icon == "success") ic = clc.green.bold("Success");

    console.log("   " + ic + " " + title);
    if (desc) console.log("   " + desc);
    console.log()

    global.dbm.log(ic + " " + title + " " + desc, "notification");

    global?.dbm?.mainWindow?.webContents?.send("notification", {
        title: title,
        icon: icon,
        desc: desc
    });
}

module.exports.clearLog = () => log = [];
module.exports.log = log;