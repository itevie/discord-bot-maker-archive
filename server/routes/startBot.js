const botManager = require(__dirname + "/../../botManager");
const botRunner = require(__dirname + "/../../botRunner");

module.exports.init = (app) => {
    app.post("/bots/start", (req, res) => {
        let botData = req.body;

        if (botRunner.isRunning(botData.id)) {
            return res.status(400).send({
                message: "The bot with ID " + botData.id + " is already running."
            });
        }

        botManager.data.bots[botData.id] = botData;

        botRunner.run(botData.id);

        return res.status(200);
    });
}