const botManager = require(__dirname + "/../../database.js");
const parse = require(__dirname + "/../utils/parser.js").parse;

module.exports.details = {
    name: "database"
}

module.exports.actions = {
    "fetch-database-item": {
        allowedEvents: ["*"],
        name: "Fetch Database Item",
        description: "Fetches an item in the databse.",
        inputs: {
            key: {
                name: "key",
                type: "text",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.log("Fetch DB item: " + data.action.key);
                if (botManager.data.bots[data.botId].database.hasOwnProperty(data.action.key)) {
                    resolve(botManager.data.bots[data.botId].database[data.action.key]);
                } else {
                    data.log("DB item " + data.action.key + " did not exist at fetch DB item");
                    resolve("null");
                }
            });
        }
    },

    "set-database-item": {
        allowedEvents: ["*"],
        name: "Set Datase Item",
        inputs: {
            key: {
                name: "key",
                type: "text",
                allowEmpty: false
            },
            content: {
                name: "content",
                type: "textarea"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.log("Set DB key " + data.action.key + " to " + data.action.content);

                if (!data.action.key.match(/^([a-zA-Z_0-9\-]{1,})$/)) {
                    data.log("Key was invalid: " + data.action.key);
                    reject("Key name: " + data.action.key + " is invalid");
                }

                botManager.data.bots[data.botId].database[data.action.key] =
                    parse(data.action.content, data.variables, data.client, data.botId);
                botManager.save();
                resolve();
            });
        }
    },

    "delete-database-item": {
        allowedEvents: ["*"],
        name: "Delete Database Item",
        inputs: {
            key: {
                name: "key",
                type: "text",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.log("Deleting key " + data.action.key);
                if (botManager.data.bots[data.botId].database.hasOwnProperty(data.action.key)) {
                    delete botManager.data.bots[data.botId].database[data.action.key];
                    botManager.save();
                    resolve();
                } else {
                    data.log("Key " + data.action.key + " did not exist at delete key");
                    resolve(null);
                }
            });
        }
    },

    "db-item-not-exist": {
        allowedEvents: ["*"],
        name: "If Database Item Does Not Exist, Set It To",
        description: "If a database item does not exist, set it to the content",
        inputs: {
            key: {
                name: "key",
                type: "text",
                allowEmpty: false
            },
            content: {
                name: "content",
                type: "textarea"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                if (!botManager.data.bots[data.botId].database.hasOwnProperty(data.action.key)) {
                    if (!data.action.key.match(/^([a-zA-Z_0-9\-]{1,})$/)) {
                        data.log("Key was invalid: " + data.action.key);
                        reject("Key name: " + data.action.key + " is invalid");
                    }

                    botManager.data.bots[data.botId].database[data.action.key] = data.action.content;
                    resolve();
                }

                resolve();
            });
        }
    },
}