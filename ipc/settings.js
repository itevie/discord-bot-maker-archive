const {
    ipcMain,
    ipcRenderer
} = require('electron');
const botManager = require(__dirname + "/../botManager");
const logger = require(__dirname + "/../logger");
const package = require(__dirname + "/../package.json");
const tokenValidator = require(__dirname + "/createBot.js").validate;

// Update a application setting
ipcMain.on("updateSetting", (event, data) => {
    botManager.data[data.key] = data.to;
    event.returnValue = true;
});

// Fetch all settings
ipcMain.on("fetchSettings", (event, data) => {
    let toSend = JSON.parse(JSON.stringify(botManager.data));
    delete toSend.bots;

    toSend.version = package.version;

    event.returnValue = toSend;
});

// Update bot settings
ipcMain.on("updateBotSettings", (event, data) => {
    // Ran when all is done
    function done() {
        global.sendNotification("Success", "success", "Your bot's settings have been saved");
    }

    if (data.prefix) // Prefix setting
        botManager.data.bots[botManager.data.selected].prefix = data.prefix;
    if (data.token && data.token != botManager.data.bots[botManager.data.selected].token) {
        // Validate token
        tokenValidator(data.token).then(() => {
            // If it worked, set it and call done
            botManager.data.bots[botManager.data.selected].token = data.token;
            done();
        }).catch(() => {
            // Show error
            global.sendLog("Failed", "token-validator");
        });
    } else {
        done();
    }
});