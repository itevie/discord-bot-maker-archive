// Require dependencies
const Discord = require("discord.js");
const {
    app,
    dialog
} = require("electron");
const ipc = require("./ipc.js");
const botManager = require("./database");
const botRunner = require("./botRunner");
const fs = require("fs");
const config = require("./config");

// When a fatal error occurrs then create a new log
module.exports.fatalError = (err) => {
    newLog(err, true);
}

// When an unknown error occurs, log it
process.on("uncaughtException", (err) => {
    newLog(err);
});

// Function to create a very detailed log
function newLog(err, fatal) {
    console.log(err, err?.stack, "Fatal: " + fatal);
    if (err.toString().toLowerCase().includes("manager was destroyed")) return;

    let logName = Date.now().toString() + ".txt"; // Create a file name
    let path = app.getPath("userData"); // Get the path where it should be saved to
    if (!fs.existsSync(path + "/logs/")) fs.mkdirSync(path + "/logs"); // Create the log folder if it doesn't exist

    // Load all the packages, modules etc. for the log

    let packages = [];
    let modules = [];
    let actions = [];

    // Load all web actions from the execute
    let webActions = require("./discord/utils/execute")?.webActions;
    if (webActions) {
        // Loop through packages
        for (let package in webActions) {
            packages.push(package); // Add the package
            for (let module in webActions[package]) {
                if (module == "information") continue;

                modules.push(package + ":" + module);

                // Loop through the actions
                for (let action in webActions[package][module]) {
                    actions.push(package + ":" + module + ":" + action);
                }
            }
        }
    }

    // Text for the log
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

    // Load and parse bot data
    let botData = JSON.parse(JSON.stringify(botManager.data));

    // Delete tokens
    for (let i in botData.bots) {
        botData.bots[i].token = "[REDACTED]";
    }

    // Add it
    text += JSON.stringify(botData, null, 2);

    text += `
--- LOG ---
`

    // Loop through every log and add it to the text
    for (let i in logger.log) {
        text += `${ipc.log[i].type}: ${ipc.log[i].msg}\n`
    }

    fs.writeFileSync(path + "/logs/" + logName, text); // Write the file
    botRunner.stopAll(); // Stop all bots
    global.dbm.error("An error occurred, a log has been made at " + path + "/logs/" + logName); // Display error

    // Check if it is fatal
    if (fatal) {
        // Show a message box
        dialog.showMessageBoxSync({
            title: "Error",
            message: "A fatal error has occurred:\n\n" + err?.toString() + "\n\nPlease check your log folder (" + path + "/logs/" + logName + ")"
        });

        // Quit app
        process.exit(0);
    }
}

module.exports.createLog = newLog;