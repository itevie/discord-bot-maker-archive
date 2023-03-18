const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require('morgan');
const getAllFiles = require(__dirname + "/../getAllFiles");
const ws = require(__dirname + "/ws.js");

module.exports.init = (port) => {
    const app = express();

    app.use(bodyParser.json());
    app.use(cors());
    app.use(morgan('[:date] :method :url - :status (:response-time ms)'))

    let routes = getAllFiles(__dirname + "/routes");
    for (let i in routes) {
        require(routes[i]).init(app);
        global.dbm.log("Loaded route " + routes[i], "server:routes");
    }

    let server = app.listen(port, () => {
        global.dbm.log("Server listening on port " + port, "server");
    });

    ws.init(server);
}