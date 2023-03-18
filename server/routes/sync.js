const botManager = require(__dirname + "/../../botManager");
const botRunner = require(__dirname + "/../../botRunner");

module.exports.init = (app) => {
    app.post("/sync", (req, res) => {
        console.log("hi")
        let botId = req.body.botId;
        let syncWhat = req.body.type;
        let data = req.body.data;

        if (!botManager.data.bots[botId] && syncWhat != "all") {
            return res.status(400).send({
                message: "Server contains no data for " + botId + ", please start it or sync all data."
            })
        }

        if (botRunner.isRunning(botId)) {
            return res.status(400).send({
                message: "The bot with ID " + botId + " is running, please stop it."
            });
        }

        switch (syncWhat) {
            case "all":
                botManager.data.bots[botId] = data;
                break;
            case "database":
                botManager.data.bots[botId].database = data;
                break;
            case "commands":
                botManager.data.bots[botId].commands = data;
                break;
            case "resources":
                botManager.data.bots[botId].resources = data;
                break;
            case "events":
                botManager.data.bots[botId].events = data;
                break;
        }

        global.dbm.log("Synced " + syncWhat, "sync");

        return res.status(200).send({ message: "Synced " + syncWhat });
    });
}