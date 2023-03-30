// Require dependencies
const Discord = require("discord.js");
const {
    app,
    BrowserWindow,
    dialog
} = require("electron");
const ipc = require("./ipc.js");
const botManager = require("./database");
const botRunner = require("./botRunner");
const fs = require("fs");
const config = require("./config");

module.exports.fatalError = (err) => {
    newLog(err, true);
}

process.on("uncaughtException", (err) => {
    newLog(err);
});
function newLog(err, fatal) {
    console.log(err, err?.stack, "Fatal: " + fatal);
    if (err.toString().toLowerCase().includes("manager was destroyed")) return;

    let logName = Date.now().toString() + ".txt";
    let path = app.getPath("userData");
    if (!fs.existsSync(path + "/logs/")) fs.mkdirSync(path + "/logs");

    let packages = [];
    let modules = [];
    let actions = [];

    let webActions = require("./discord/utils/execute")?.webActions;
    if (webActions) {
        for (let package in webActions) {
            packages.push(package);
            for (let module in webActions[package]) {
                if (module == "information") continue;
                modules.push(package + ":" + module);
                for (let action in webActions[package][module]) {
                    actions.push(package + ":" + module + ":" + action);
                }
            }
        }
    }

    let text = `--- START OF LOG ---

// ${config.logTexts[Math.floor(Math.random() * config.logTexts.length)]}

It is completely safe to send this log file to our support server (found in App Settings > About) or on the GitHub repository,
It would be greatly apprieciated if you could send this file to us so we can help improve the application.

Time: ${Date.now()} (${new Date().toLocaleString()})
OS: ${require("os").platform()}
Version: ${require("os").version()}

--- ERROR ---
${err?.toString() || "No error; log created by user"}
STACK: ${err?.stack?.toString() || "No stack; log created by user"}

--- DETAILS --- 

Loaded Packages: (${packages.length}) ${packages.join(", ")}
Loaded Modules: (${modules.length}) ${modules.join(", ")}
Loaded Actions: (${actions.length}) ${actions.join(", ")}
Running Bots: ${botRunner.getList(true)}
App Version: ${require("./package.json").version}

--- APPLICATION DATA ---
`;

    let botData = JSON.parse(JSON.stringify(botManager.data));

    for (let i in botData.bots) {
        botData.bots[i].token = "[REDACTED]";
    }

    text += JSON.stringify(botData, null, 2);

    text += `
--- LOG ---
`

    for (let i in ipc.log) {
        text += `${ipc.log[i].type}: ${ipc.log[i].msg}\n`
    }

    fs.writeFileSync(path + "/logs/" + logName, text);
    botRunner.stopAll();
    global.dbm.error("An error occurred, a log has been made at " + path + "/logs/" + logName);

    if (fatal) {
        dialog.showMessageBoxSync({
            title: "Error",
            message: "A fatal error has occurred:\n\n" + err?.toString() + "\n\nPlease check your log folder (" + path + "/logs/" + logName + ")"
        });
        process.exit(0);
    }
}

module.exports.createLog = newLog;