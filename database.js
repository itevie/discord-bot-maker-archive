const fs = require("fs");
const {
    app, globalShortcut, dialog
} = require("electron");
const uuid = require("uuid");
const cli = require("./cli");
let path = cli.getFlag("data", app.getPath("userData"));
global.dbm.log("Data path: " + path, "bot-manager");

let thisSession = uuid.v4(); // Create an ID for the current session
// This will be saved in the data, to check if there are other instances of the app saving to it
// So we can stop it so no data gets overwritten and lost

// Find the file, if it doesn't exist, create it
if (!fs.existsSync(path + "/data.json")) {
    fs.writeFileSync(path + "/data.json", JSON.stringify({
        "selected": null,
        "generalLog": true,
        "botEvents": true,
        "botDebug": true,
        "showInformationalAlerts": false,
        "showNotifications": true,
        "bots": {}
    }));
}

// Load the data
const data = require(path + "/data.json");
data.currentEditor = thisSession;
const botRunner = require("./botRunner");

// If the selected bot isn't found, default to the first one
if ((Object.keys(data.bots).length != 0 && data.selected == null) || !data.bots[data.selected]) {
    global.dbm.log("Selected bot not found, selecting first bot in list", "bot-manager");
    data.selected = Object.keys(data.bots)[0];
}

// If above fails, set it to null i guess
if (data.selected && !data.bots[data.selected]) {
    global.dbm.log("No bot found for selected", "bot-manager");
    data.selected = null;
}

// Export functions
module.exports.data = data;
module.exports.getSelected = () => data.selected;

// Default new bot data
let newBot = {
    id: null,
    token: null,
    prefix: "!",
    pendingRestart: false,
    resources: {
        embeds: {
            "first-embed": [{
                title: "My first embed",
                description: "This is an amazing Embed!"
            }]
        }
    },
    commands: {
        "example": {
            comment: "An example command, start the bot and run !example to see it work!",
            type: "prefix",
            ignoreBots: true,
            actions: [{
                type: "built-in:messages:send-author-message",
                content: "Welldone! You ran the example command {{embed:first-embed}}"
            }]
        }
    },
    events: {
        "messageDelete": {
            actions: [{
                type: "built-in:misc:log",
                content: "A message was deleted!"
            }]
        }
    },
    database: {
        "greetings": "Hello World!"
    }
}

// Function to add a bot to the databse
module.exports.addBot = (d) => {
    global.dbm.log("Add bot", "bot-manager");

    // Create a new bot, and set the needed stuff
    data.bots[d.id] = structuredClone(newBot);
    data.bots[d.id].id = d.id;
    data.bots[d.id].token = d.token;

    // Set the current selected bot to the newly created one
    data.selected = d.id;

    // Finish and return
    module.exports.save();
    return true;
}

// Function to validate the bot data
module.exports.validate = (id) => {
    let keys = Object.keys(newBot);
    let errors = [];

    // Get bot data
    let botData = data.bots[id];
    if (typeof id == "object") botData = id; // If bot data has been passed along into id param, set it
    if (!botData) return false;

    // Loop through all the new bot keys, checking if it is in the current one
    for (let i in keys) {
        if (!botData.hasOwnProperty(keys[i])) errors.push("Missing key: " + keys[i] + " at bot " + id + " root");
    }

    // Check if there is a token
    if (!botData.token) errors.push("Invaid token for bot " + id);

    // Log all the errors
    for (let i in errors) {
        global.dbm.log(errors[i], "error:database-checker");
    }

    // Send a notification showing how many errors
    if (errors.length > 0) {
        global.dbm.mainWindow.webContents.send("error", {
            type: "alert",
            title: "Database Errors",
            msg: "Uh oh, your bot " + id + " has errors (" + errors.length + " of them)!<br><br>" + errors.join("<br>")
        });
    }

    if (errors.length > 0) return false;
    else return true;
}

// Function to delete a bot from the database
module.exports.deleteBot = (id) => {
    global.dbm.log("Deleting bot " + id, "delete-bot");

    // Check if it is running, if so, stop it
    if (botRunner.isRunning(id)) {
        botRunner.stop(id);
        global.dbm.log("Bot was running, stopped", "delete-bot");
    }

    // Delete the bot and change the current selected bot
    delete data.bots[id];
    data.selected = null;

    // Re-set the current selected bot
    if (Object.keys(data.bots) != 0 && data.selected == null) {
        data.selected = Object.keys(data.bots)[0];
    }

    // Finish
    global.dbm.log("Deleted bot " + id, "delete-bot");
    module.exports.save();
    return;
}

// Function to save the current database to disk
module.exports.save = () => {
    fs.writeFileSync(path + "/data.json", JSON.stringify(data, null, 2));
    return true;
}

let cskip = true;

// Auto saver
let x = setInterval(() => {
    // If first save, skip so it doesn't automatically think there is another ID editing it
    if (cskip == true) {
        global.dbm.log("First save", "bot-manager")
        module.exports.save();
        cskip = false;
    }

    // Re-read the data
    let d = JSON.parse(fs.readFileSync(path + "/data.json", "utf-8"));

    // If the file's editor id isn't the current id, shout at the user
    if (d.currentEditor != thisSession) {
        clearInterval(x); // Stop auto save

        // Send notification and exit
        //global.dbm.error("Discord Bot Maker detected that there are more than 1 instance of this app open. Do not do this as data may be lost, the application will now exit.");
        dialog.showMessageBoxSync({
            title: "Don't do that!",
            message: "Discord Bot Maker detected that there are more than 1 instance of this app open.\n\nDo not do this as data may be lost, the application will now exit."
        });

        setTimeout(() => {
            app.quit();
        }, 100);
    }
    module.exports.save();
}, 1000);