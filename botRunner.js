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
            Discord.GatewayIntentBits.Guilds,
            Discord.GatewayIntentBits.GuildVoiceStates
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
        global.dbm.window.notification("The bot has started!", "success");
        global.dbm.mainWindow?.send("botStarted");
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
        global.dbm.log(d, "bot:" + id, showLoader);
        if (d.includes("Session Limit Information")) {
            let total = d.match(/[0-9]{1,}/)[0];
            d = d.replace(total, "");
            let remaining = d.match(/[0-9]{1,}/)[0];
            global?.dbm?.mainWindow?.webContents?.send("detailUpdate", {
                startLimitTotal: total,
                startLimitRemaining: remaining
            });
        }
    });

    running[id].on("error", d => {
        global.dbm.log(d, "bot:" + id, showLoader);
        showLoader = false;
    })

    running[id].login(botManager.data.bots[id].token).catch((err) => {
        if (err.toString().includes("An invalid token was provided")) {
            global.dbm.log("The token for bot " + id + " is invalid and needs to be re-set");
            global.dbm.error("Your token for the bot " + id + " seems to be invalid, please reset it in the bot's settings");
        }
        running[id].destroy();
        delete running[id];
        return sendInfo("ERROR: Failed to start: " + err.toString());
    });
}

module.exports.stop = (id) => {
    global.dbm.log("Stopping bot " + id, "bot-runner", true);
    if (!running[id]) {
        return sendInfo("The bot is not running", "startBot");
    }

    running[id].destroy();
    delete running[id];

    global.dbm.log("Bot stopped:  " + id, "bot-runner");
    global.dbm.window.notification("Your bot " + id + " has stopped", "info");
    global.dbm.mainWindow?.send("botStopped");
}

module.exports.stopAll = () => {
    for (let i in running) {
        module.exports.stop(i);
    }
}

function sendInfo(msg, type) {
    global.dbm.log(msg, "bot-runner");
    global?.mainWindow?.webContents?.send("info", {
        type: type,
        msg: msg
    });
}