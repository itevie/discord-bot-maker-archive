const botManager = require("./botManager");
const getAllFiles = require("./getAllFiles");
const pms = require('ms-prettify').default;

const Discord = require("discord.js");

const running = {};
let possiblyRunning = [];

module.exports.getList = (onlyId) => {
    let toSend = onlyId ? [] : {};
    for (let i in running) {
        if (onlyId) {
            toSend.push(i);
            continue
        }
        toSend[i] = {
            id: i,
            pendingRestart: botManager.data.bots[i].pendingRestart,
            uptime: pms(running[i].uptime || 0, {
                till: "second"
            }),
            profile: botManager.data.bots[i].profile
        }
    }

    return toSend;
}

module.exports.isRunning = (id) => {
    if (running[id]) return true;
    else return false;
}

module.exports.run = (id) => {
    sendInfo("Starting bot " + id, "startBot", true);
    if (running[id]) {
        return sendInfo("ERROR: " + id + " is already running", "startBot");
    }

    let client = new Discord.Client({
        intents: [
            Discord.GatewayIntentBits.GuildMessages,
            Discord.GatewayIntentBits.MessageContent,
            Discord.GatewayIntentBits.Guilds
        ]
    });

    running[id] = client;
    let showLoader = true;

    sendInfo("Loading all events", "startBot", showLoader);

    let files = getAllFiles(__dirname + "/discord/events");
    for (let i in files) {
        let event = require(files[i]);
        event.init(client, id);

        sendInfo("Event loaded: " + files[i], "startBot", showLoader);
    }

    running[id].on("ready", () => {
        sendInfo("The bot is now ready and online!", "startBot");
        global?.mainWindow?.webContents?.send("botStarted");
        showLoader = false;
        botManager.data.bots[id].pendingRestart = false;

        // Get user data
        sendInfo("Obtaining user profile", "startBot");
        let data = running[id].user.displayAvatarURL();
        botManager.data.bots[id].profile = {
            pfp: data
        }
    });

    running[id].on("debug", d => {
        global.sendLog(d, "bot:" + id, showLoader);
        if (d.includes("Session Limit Information")) {
            let total = d.match(/[0-9]{1,}/)[0];
            d = d.replace(total, "");
            let remaining = d.match(/[0-9]{1,}/)[0];
            global?.mainWindow?.webContents?.send("detailUpdate", {
                startLimitTotal: total,
                startLimitRemaining: remaining
            });
        }
    });

    running[id].login(botManager.data.bots[id].token).catch((err) => {
        return sendInfo("ERROR: Failed to start: " + err.toString());
    });
}

module.exports.stop = (id) => {
    global.sendLog("Stopping bot " + id, "bot-runner", true);
    if (!running[id]) {
        return sendInfo("The bot is not running", "startBot");
    }

    running[id].destroy();
    delete running[id];

    global.sendLog("Bot stopped:  " + id, "bot-runner");
    global.mainWindow.webContents.send("botStopped");
}

module.exports.stopAll = () => {
    for (let i in running) {
        module.exports.stop(i);
    }
}

function sendInfo(msg, type) {
    global.sendLog(msg, "bot-runner");
    global?.mainWindow?.webContents?.send("info", {
        type: type,
        msg: msg
    });
}