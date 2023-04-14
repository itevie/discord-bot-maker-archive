const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require('morgan');
const getAllFiles = require(__dirname + "/../getAllFiles");
const ws = require(__dirname + "/ws.js");

/**
 * Function to init the server
 * @param {Number} port The port number to start
 */
module.exports.init = (port) => {
    const app = express(); // Create express app

    // Load middleware
    app.use(bodyParser.json());
    app.use(cors());
    app.use(morgan('[:date] :method :url - :status (:response-time ms)'))

    // Load all routes
    let routes = getAllFiles(__dirname + "/routes");
    for (let i in routes) {
        require(routes[i]).init(app);
        global.dbm.log("Loaded route " + routes[i], "server:routes");
    }

    // Make the server listen
    let server = app.listen(port, () => {
        global.dbm.log("Server listening on port " + port, "server");
    });

    // Load the WS server
    ws.init(server);
}