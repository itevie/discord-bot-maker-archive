const {
    Notification
} = require("electron");
const clc = require("cli-color");

let log = [];

global.dbm.log = (text, type, loader = false) => {
    // Add log item to log
    log.push({
        msg: text,
        type: type,
        showLoader: loader
    });

    // Try to send the log item to the client
    try {
        global?.dbm?.mainWindow?.webContents?.send("log", {
            msg: text.toString(),
            type: type,
            showLoader: loader
        });
    } catch (err) {
        console.log(err)
    }

    // Format it  nicely
    let time = "(" + new Date().toLocaleString() + ") ";

    if (type?.startsWith("error")) {
        console.log(time + clc.red.bold("[" + type + "] " + text));
    }
    else console.log(time + "[" + type + "] " + text);
}

global.dbm.error = (text, data = {}) => {
    // Format the error
    let singleLine = `${text}`;
    let errorType = `error${data.event ? (":event->" + data.event) : ""}${data.bot ? (":bot->" + data.bot) : ""}`;

    // Send log item
    global.dbm.log(singleLine, errorType);
    try {   
        // If window is NOT focused, send an OS notification
        console.log(global.dbm.mainWindow.isFocused())
        if (global?.dbm?.mainWindow?.isFocused() == false) {
            new Notification({
                title: `Error${data.bot ? (" for bot " + data.bot) : ""}!`,
                body: singleLine
            }).show();
        }

        // Send notification to window regardless
        global?.dbm?.mainWindow?.webContents?.send("error", {
            type: "alert",
            force: true,
            msg: text.toString()
        });
    } catch (err) {
        // If it failed to log then send another log
        global.dbm.log(err.toString(), "error:logger");
    }
}

global.dbm.window.notification = (title, icon = "info", desc = "") => {
    // Log it to console
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

    // Send the notification
    if (global?.dbm?.mainWindow?.isFocused() == false) {
        new Notification({
            title: title,
            body: desc
        });
    }

    // Send to the window
    global?.dbm?.mainWindow?.webContents?.send("notification", {
        title: title,
        icon: icon,
        desc: desc
    });
}

module.exports.clearLog = () => log = [];
module.exports.log = log;