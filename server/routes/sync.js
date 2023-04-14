// Route POST /sync
// Syncs data from client to server, vice versa

const botManager = require(__dirname + "/../../botManager");
const botRunner = require(__dirname + "/../../botRunner");

module.exports.init = (app) => {
    app.post("/sync", (req, res) => {
        // Get the data
        let botId = req.body.botId;
        let syncWhat = req.body.type;
        let data = req.body.data;

        // Check if the server even has the data the client is requesting
        if (!botManager.data.bots[botId] && syncWhat != "all") {
            return res.status(400).send({
                message: "Server contains no data for " + botId + ", please start it or sync all data."
            })
        }

        // Check if it is starting, if so halt
        if (botRunner.isRunning(botId)) {
            return res.status(400).send({
                message: "The bot with ID " + botId + " is running, please stop it."
            });
        }

        switch (syncWhat) {
            case "all": // If the client is requesting all, sync it
                botManager.data.bots[botId] = data;
                break;
            case "database": // Client is requesting to sync only databse
                botManager.data.bots[botId].database = data;
                break;
            case "commands": // Client is requesting to sync only commands
                botManager.data.bots[botId].commands = data;
                break;
            case "resources": // Client is requesting to sync only resources
                botManager.data.bots[botId].resources = data;
                break;
            case "events": // Client is requesting to sync only events
                botManager.data.bots[botId].events = data;
                break;
        }

        // Finish
        global.dbm.log("Synced " + syncWhat, "sync");

        return res.status(200).send({ message: "Synced " + syncWhat });
    });
}