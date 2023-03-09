const {
    ipcMain,
    ipcRenderer,
    app,
    shell
} = require('electron');
const fs = require("fs");
const botManager = require(__dirname + "/../botManager");
const botRunner = require(__dirname + "/../botRunner.js");
const logger = require(__dirname + "/../logger");

// Start the bot
ipcMain.on("startBot", (event, id) => {
    if (botManager.validate(id) == false) return;
    botRunner.run(id);
});

// Stop the bot
ipcMain.on("stopBot", (event, id) => {
    if (botManager.validate(id) == false) return;
    botRunner.stop(id);
});

// Delete a bot
ipcMain.on("deleteBot", (event, data) => {
    let id = data.id;

    // Check if the bot exists
    if (!botManager.data.bots[id]) {
        return global.mainWindow.webContents.send("error", {
            type: "alert",
            msg: "The bot " + id + " does not exist"
        });
    }

    // Check if it should create a backup of the bot
    if (data.createBackup) {
        // Get the path and create directories
        let botData = botManager.data.bots[id];
        let path = app.getPath("userData");
        if (!fs.existsSync(path + "/backups/")) fs.mkdirSync(path + "/backups");
        if (!fs.existsSync(path + "/backups/bots/")) fs.mkdirSync(path + "/backups/bots");
        fs.writeFileSync(path + "/backups/bots/" + id + "-" + (Date.now()).toString() + ".json", JSON.stringify(botData, null, 2));
        let bPath = path + "/backups/bots/" + id + "-" + (Date.now()).toString() + ".json";
        
        // Alert user where it was saved to
        setTimeout(() => {
            global.mainWindow.webContents.send("success", {
                type: "alert",
                msg: "Created backup at: " + bPath,
                force: true
            });
        }, 1000);
    }

    // Delete the bot
    botManager.deleteBot(id);

    return global.mainWindow.webContents.send("message", {
        reload: true,
        msg: "The bot " + id + " has been deleted"
    });
});

// CHange the selected bot
ipcMain.on("selectBot", (event, id) => {
    if (botManager.validate(id) == false) return;
    if (!botManager.data.bots[id]) return event.returnValue = "Bot does not exist";
    else {
        botManager.data.selected = id;
        return event.returnValue = true;
    }
});

// Rename a bot
ipcMain.on("renameBot", (event, data) => {
    // Check if the bot exists
    if (!botManager.data.bots[data.id]) {
        // Return an error
        global.mainWindow.webContents.send("error", {
            type: "alert",
            title: "Oops",
            msg: "The bot you were trying to delete (" + data.id + ") does not exist"
        });
        return;
    } else {
        botRunner.stopAll();

        // Copy current, make new, delete current
        botManager.data.bots[data.name] = botManager.data.bots[data.id];
        delete botManager.data.bots[data.id];
        botManager.data.bots[data.name].id = data.name;
        botManager.data.selected = data.name;

        global.sendNotification("Bot renamed", "success", "The application will now restart.");
        botManager.save();
        setTimeout(() => {
            app.relaunch();
            app.quit();
        }, 3000);
    }
})