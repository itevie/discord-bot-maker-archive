const botRunner = require(__dirname + "/../../botRunner.js");

module.exports.details = {
    name: "Bot"
}

module.exports.actions = {
    "stop-bot": {
        allowedEvents: ["*"],
        name: "Stop Bot",
        execute: (data) => {
            return new Promise((resolve, reject) => {
                botRunner.stop(data.botId);
                resolve(true);
            });
        }
    },

    "restart-bot": {
        allowedEvents: ["*"],
        name: "Restart Bot",
        execute: (data) => {
            return new Promise((resolve, reject) => {
                botRunner.stop(data.botId);
                setTimeout(() => {
                    botRunner.run(data.botId);
                    resolve(true);
                }, 200);
            });
        }
    },

    "pause": {
        allowedEvents: ["*"],
        name: "Wait X Seconds",
        inputs: {
            seconds: {
                name: "Seconds",
                type: "text"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, parseInt(data.action.content) * 1000);
            });
        }
    },
}