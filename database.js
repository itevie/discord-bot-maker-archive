const fs = require("fs");
const {
    app, globalShortcut
} = require("electron");
const uuid = require("uuid");
const cli = require("./cli");
let path = cli.getFlag("data", app.getPath("userData"));
global.dbm.log("Data path: " + path, "bot-manager");

let thisSession = uuid.v4();

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

const data = require(path + "/data.json");
data.currentEditor = thisSession;
const botRunner = require("./botRunner");

if ((Object.keys(data.bots).length != 0 && data.selected == null) || !data.bots[data.selected]) {
    global.dbm.log("Selected bot not found, selecting first bot in list", "bot-manager");
    data.selected = Object.keys(data.bots)[0];
}

if (data.selected && !data.bots[data.selected]) {
    global.dbm.log("No bot found for selected", "bot-manager");
    data.selected = null;
}

module.exports.data = data;
module.exports.getSelected = () => data.selected;

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

module.exports.addBot = (d) => {
    global.dbm.log("Add bot", "bot-manager");

    data.bots[d.id] = JSON.parse(JSON.stringify(newBot));
    data.bots[d.id].id = d.id;
    data.bots[d.id].token = d.token;

    data.selected = d.id;

    module.exports.save();
    return true;
}

module.exports.validate = (id) => {
    let keys = Object.keys(newBot);
    let errors = [];

    let botData = data.bots[id];
    if (typeof id == "object") botData = id;
    if (!botData) return false;

    for (let i in keys) {
        if (!botData.hasOwnProperty(keys[i])) errors.push("Missing key: " + keys[i] + " at bot " + id + " root");
    }

    if (!botData.token) errors.push("Invaid token for bot " + id);

    for (let i in errors) {
        global.dbm.log(errors[i], "error:database-checker");
    }

    if (errors.length > 0) {
        global.dbm.mainWindow.webContents.send("error", {
            type: "alert",
            title: "Database Errors",
            msg: "Uh oh, your bot " + id + " has errors!<br><br>" + errors.join("<br>")
        });
    }

    if (errors.length > 0) return false;
    else return true;
}

module.exports.deleteBot = (id) => {
    global.dbm.log("Deleting bot " + id, "delete-bot");

    if (botRunner.isRunning(id)) {
        botRunner.stop(id);
        global.dbm.log("Bot was running, stopped", "delete-bot");
    }

    delete data.bots[id];
    data.selected = null;

    if (Object.keys(data.bots) != 0 && data.selected == null) {
        data.selected = Object.keys(data.bots)[0];
    }

    global.dbm.log("Deleted bot " + id, "delete-bot");
    module.exports.save();
    return;
}

module.exports.save = () => {
    fs.writeFileSync(path + "/data.json", JSON.stringify(data, null, 2));
    return true;
}

let cskip = true;

// Auto saver
let x = setInterval(() => {
    if (cskip == true) {
        global.dbm.log("First save", "bot-manager")
        module.exports.save();
        cskip = false;
    }

    let d = JSON.parse(fs.readFileSync(path + "/data.json", "utf-8"));

    if (d.currentEditor != thisSession) {
        clearInterval(x);

        global.dbm.error("Discord Bot Maker detected that there are more than 1 instance of this app open. Do not do this as data may be lost, the application will now exit.");

        setTimeout(() => {
            app.quit();
        }, 10000);
    }
    module.exports.save();
}, 1000);