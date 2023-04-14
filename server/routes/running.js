// Route GET /bots/running
// Returns the current bot list

const botRunner = require(__dirname + "/../../botRunner.js");

module.exports.init = (app) => {
    app.get("/bots/running", (req, res) => {
        return res.status(200).send(botRunner.getList());
    });
}