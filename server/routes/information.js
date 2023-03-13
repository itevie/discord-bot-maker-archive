const config = require(__dirname + "/../../config.js");

module.exports.init = (app) => {
    app.get("/information", (req, res) => {
        return res.status(200).send({
            version: config.version
        });
    });
}