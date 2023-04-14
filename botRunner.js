const botManager = require("./database");
const getAllFiles = require("./getAllFiles");
const pms = require('ms-prettify').default;

const Discord = require("discord.js");

const running = {};
let possiblyRunning = [];

/**
 * Returns a list of currently running bots
 * @param {Boolean} onlyId Whether or not it should return an array of bot ID's or other optional data
 * @returns {Array|Object} The return
 */
module.exports.getList = (onlyId) => {
    let toSend = onlyId ? [] : {}; // If onlyId is there then set it to an array

    // Loop through all the running bots
    for (let i in running) {
        // If onlyId, only add the bot ID
        if (onlyId) {
            toSend.push(i);
            continue
        }

        // Else, add more information
        toSend[i] = {
            id: i,
            pendingRestart: botManager.data.bots[i].pendingRestart,
            uptime: pms(running[i].uptime || 0, {
                till: "second"
            }),
            profile: botManager.data.bots[i].profile // The profile, profile URl etc
        }
    }

    // Return
    return toSend;
}

/**
 * Function to check if a bot is running
 * @param {String} id The ID of the bot to find
 * @returns {Boolean} Boolean whether or not it is running
 */
module.exports.isRunning = (id) => {
    if (running[id]) return true;
    else return false;
}

/**
 * Function to run a bot
 * @param {String} id The ID of the bot to run
 */
module.exports.run = (id) => {
    sendInfo("Starting bot " + id, "startBot", true);

    // Check if it is already running
    if (running[id]) {
        return sendInfo("ERROR: " + id + " is already running", "startBot");
    }

    // Create the Discord client
    let client = new Discord.Client({
        intents: [
            Discord.GatewayIntentBits.GuildMessages,
            Discord.GatewayIntentBits.MessageContent,
            Discord.GatewayIntentBits.Guilds,
            Discord.GatewayIntentBits.GuildVoiceStates
        ]
    });

    // Add the client to currently running
    running[id] = client;
    let showLoader = true;

    sendInfo("Loading all events", "startBot", showLoader);

    // Load all the events
    let files = getAllFiles(__dirname + "/discord/events");
    for (let i in files) {
        let event = require(files[i]); // Require the file
        event.init(client, id); // Init it with the client

        sendInfo("Event loaded: " + files[i], "startBot", showLoader);
    }

    // Run when the client is ready
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

    // Run when debug
    running[id].on("debug", d => {
        global.dbm.log(d, "bot:" + id, showLoader);
        if (d.includes("Session Limit Information")) { // Find the session limit
            // Parse it and add it to the thing
            let total = d.match(/[0-9]{1,}/)[0];
            d = d.replace(total, "");
            let remaining = d.match(/[0-9]{1,}/)[0];
            global?.dbm?.mainWindow?.webContents?.send("detailUpdate", {
                startLimitTotal: total,
                startLimitRemaining: remaining
            });
        }
    });

    // When an error occurrs, log it
    running[id].on("error", d => {
        global.dbm.log(d, "bot:" + id, showLoader);
        showLoader = false;
    })

    // Log the client in
    running[id].login(botManager.data.bots[id].token).catch((err) => {
        // Check if the error is that an invalid token
        if (err.toString().includes("An invalid token was provided")) {
            global.dbm.log("The token for bot " + id + " is invalid and needs to be re-set");
            global.dbm.error("Your token for the bot " + id + " seems to be invalid, please reset it in the bot's settings");
        }

        // Destroy and delete the bot
        running[id].destroy();
        delete running[id];
        return sendInfo("ERROR: Failed to start: " + err.toString());
    });
}

/**
 * Function to stop a bot
 * @param {String} id The bots ID 
 */
module.exports.stop = (id) => {
    global.dbm.log("Stopping bot " + id, "bot-runner", true);

    // Check if it is not running
    if (!running[id]) {
        return sendInfo("The bot is not running", "startBot");
    }

    // Destroy and delete the bot
    running[id].destroy();
    delete running[id];

    global.dbm.log("Bot stopped:  " + id, "bot-runner");
    global.dbm.window.notification("Your bot " + id + " has stopped", "info");
    global.dbm.mainWindow?.send("botStopped");
}

/**
 * Bot to stop all running bots
 */
module.exports.stopAll = () => {
    // Loop through all the bots and stop them all
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