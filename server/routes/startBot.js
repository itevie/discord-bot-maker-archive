// Route POST /bots/start
// Starts a bot

const botManager = require(__dirname + "/../../botManager");
const botRunner = require(__dirname + "/../../botRunner");

module.exports.init = (app) => {
    app.post("/bots/start", (req, res) => {
        let botData = req.body;

        // Check if a bot with that name is already running
        if (botRunner.isRunning(botData.id)) {
            return res.status(400).send({
                message: "The bot with ID " + botData.id + " is already running."
            });
        }

        // Add the bot to the database
        botManager.data.bots[botData.id] = botData;

        // Run it
        botRunner.run(botData.id);

        return res.status(200);
    });
}