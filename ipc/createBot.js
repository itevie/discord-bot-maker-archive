const {
    ipcMain,
    ipcRenderer
} = require('electron');
const Discord = require("discord.js");
const botManager = require(__dirname + "/../botManager");

// Create bot, checks token etc.
ipcMain.on("createBot", (event, data) => {
    global.dbm.log("Creating bot", "ipc", true);

    // Validate bot name
    if (!data.id || data.id.length < 1) {
        global.dbm.log("Bot's ID is too short", "ipc");
        return global.dbm.mainWindow.webContents.send("error", {
            type: "botCreator",
            msg: "Your bot's name must be at least 1 character long!"
        });
    }

    // Check if the bot name already exists
    if (botManager.data[data.id]) {
        global.dbm.log("Bot's ID already exists", "ipc");
        return global.dbm.mainWindow.webContents.send("error", {
            type: "botCreator",
            msg: "The ID " + data.id + " already exists!"
        });
    }

    // Validate token
    validate(data.token, data.id, true);
});

ipcMain.on("createBotFromJSON", (event, data) => {
    let res = botManager.validate(data);
    if (!res) return event.returnValue = "0";

    if (botManager.data.bots[data.id]) {
        return event.returnValue = "A bot with the id " + data.id + " already exists!"
    }

    let token = data.token;

    validate(token).then(() => {
        botManager.data.bots[data.id] = data;
        botManager.data.selected = data.id;
        return event.returnValue = true;
    }).catch((err) => {
        return event.returnValue = "0";
    })
})

/**
 * Validates a Discord token
 * @param {string} token The discord token
 * @param {string} id The bot ID
 * @param {boolean} sendAfter Send logs (for bot create)
 * @returns {boolean} Wether or not it is valid
 */
function validate(token, id, sendAfter) {
    return new Promise((resolve, reject) => {
        if (sendAfter) {
            global.dbm.mainWindow.webContents.send("info", {
                type: "botCreator",
                msg: "Checking token"
            });
        }
        global.dbm.log("Crecking token", "token-validator", true);

        //Create client to check if token exists
        const client = new Discord.Client({
            intents: [
                Discord.GatewayIntentBits.MessageContent
            ]
        });
        global.dbm.log("Client created", "token-validator");

        // Event will be ran successfully if token is valid
        client.on("ready", () => {
            global.dbm.log("Client successfully logged in", "token-validator");
            if (id) {
                // Create the bot
                botManager.addBot({
                    id: id,
                    token: token
                });
            }

            // Finish and clean up
            if (sendAfter) global.dbm.mainWindow.webContents.send("botCreated", null);
            else resolve();

            client.destroy();

            global.dbm.log("Finished", "token-validator");
        });

        // Login with the client
        client.login(token).catch((err) => {
            // Catch ran, the token is invalid
            global.dbm.log("Token invalid", "token-validator");
            
            // Error because of disallowed intents (likely no message content intents)
            if (err.toString().includes("DisallowedIntents")) {
                global.dbm.mainWindow.webContents.send("error", {
                    type: sendAfter ? "botCreator" : "alert",
                    force: true,
                    msg: "Failed to verify token: you may not have enabled message content intent for the bot (" + err.toString() + ")<br>Learn more <button onclick=\"showFAQ('message_content_intent');\">here</button>"
                });
                reject();
                return;
            }

            // Alert user
            global.dbm.mainWindow.webContents.send("error", {
                type: sendAfter ? "botCreator" : "alert",
                msg: err.toString()
            });
            reject();
        });
    });
}

module.exports.validate = validate;