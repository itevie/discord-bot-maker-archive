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

process.on("uncaughtException", (err) => {
    let logName = Date.now().toString() + ".txt";
    let path = app.getPath("userData");
    if (!fs.existsSync(path + "/logs/")) fs.mkdirSync(path + "/logs");

    let text = `--- START OF LOG ---

// ${config.logTexts[Math.floor(Math.random() * config.logTexts.length)]}

It is completely safe to send this log file to our support server (found in App Settings > About) or on the GitHub repository,
It would be greatly apprieciated if you could send this file to us so we can help improve the application.

Time: ${Date.now()} (${new Date().toLocaleString()})
OS: ${require("os").platform()}
Version: ${require("os").version()}

--- ERROR ---
${err.toString()}
STACK: ${err.stack.toString()}

--- DETAILS --- 

Loaded Plugins: ${require("./discord/utils/execute")?.modulesList?.join(", ")}
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
    global.sendError("An error occurred, a log has been made at " + path + "/logs/" + logName);
})