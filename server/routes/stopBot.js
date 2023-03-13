const botManager = require(__dirname + "/../../botManager");
const botRunner = require(__dirname + "/../../botRunner");

module.exports.init = (app) => {
    app.post("/bots/stop", (req, res) => {
        let id = req.body.id;

        if (!botRunner.isRunning(id)) {
            return res.status(400).send({
                message: "The bot with ID " + id + " is not running."
            });
        }

        botRunner.stop(id);

        return res.status(200);
    });
}