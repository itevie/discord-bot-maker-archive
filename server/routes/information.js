// Route GET /information
// This route sends the current server's information, such as the current version

const config = require(__dirname + "/../../config.js");

module.exports.init = (app) => {
    app.get("/information", (req, res) => {
        return res.status(200).send({
            version: config.version
        });
    });
}