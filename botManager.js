const fs = require("fs");
const logger = require("./logger");
const {
    app
} = require("electron");
const uuid = require("uuid");
let path = app.getPath("userData");

let thisSession = uuid.v4();

if (!fs.existsSync(path + "/data.json")) {
    fs.writeFileSync(path + "/data.json", JSON.stringify({
        "selected": null,
        "generalLog": false,
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
    data.selected = Object.keys(data.bots)[0];
}

if (data.selected && !data.bots[data.selected]) {
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
                type: "messages:send-author-message",
                content: "Welldone! You ran the example command {{embed:first-embed}}"
            }]
        }
    },
    events: {
        "messageDelete": {
            actions: [{
                type: "log",
                content: "A message was deleted!"
            }]
        }
    },
    database: {
        "greetings": "Hello World!"
    }
}

module.exports.addBot = (d) => {
    logger.log("Add bot", "bot-manager");

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

    for (let i in keys) {
        if (!botData.hasOwnProperty(keys[i])) errors.push("Missing key: " + keys[i] + " at bot " + id + " root");
    }

    if (!botData.token) errors.push("Invaid token for bot " + id);

    for (let i in errors) {
        global.sendLog(errors[i], "error:database-checker");
    }

    if (errors.length > 0) {
        global.mainWindow.webContents.send("error", {
            type: "alert",
            title: "Database Errors",
            msg: "Uh oh, your bot " + id + " has errors!<br><br>" + errors.join("<br>")
        });
    }

    if (errors.length > 0) return false;
    else return true;
}

module.exports.deleteBot = (id) => {
    global.sendLog("Deleting bot " + id, "delete-bot");

    if (botRunner.isRunning(id)) {
        botRunner.stop(id);
        global.sendLog("Bot was running, stopped", "delete-bot");
    }

    delete data.bots[id];
    data.selected = null;

    if (Object.keys(data.bots) != 0 && data.selected == null) {
        data.selected = Object.keys(data.bots)[0];
    }

    global.sendLog("Deleted bot " + id, "delete-bot");
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
        module.exports.save();
        cskip = false;
        botRunner.run("reddit");
    }

    let d = JSON.parse(fs.readFileSync(path + "/data.json", "utf-8"));

    if (d.currentEditor != thisSession) {
        clearInterval(x);
        global.mainWindow?.webContents?.send("error", {
            type: "alert",
            force: true,
            msg: "Discord Bot Maker has detected that there are more than 1 instace of this app open.<br><br>For your bot's data's safety, the app will quit to prevent potential data loss.<br><br>Do NOT open multiple instances of Discord Bot Maker at the same time."
        });

        setTimeout(() => {
            app.quit();
        }, 10000);
    }
    module.exports.save();
}, 1000);