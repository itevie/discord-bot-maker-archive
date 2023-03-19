module.exports.details = {
    name: "misc"
}

module.exports.actions = {
    "typing": {
        name: "Start Typing Indicator",
        allowedEvents: ["*"],
        execute: async (data) => {
            return new Promise(async (resolve, reject) => {
                data.message.channel.startTyping().then(() => {
                    resolve();
                }).catch(err => {
                    reject(err.toString());
                });
            });
        }
    },
    "stop-typing": {
        name: "Stop Typing Indicator",
        allowedEvents: ["*"],
        execute: async (data) => {
            return new Promise(async (resolve, reject) => {
                data.message.channel.stopTyping().then(() => {
                    resolve();
                }).catch(err => {
                    reject(err.toString());
                });
            });
        }
    },
    "stop-actions": {
        name: "Stop Actions"
    },
    "none": {
        name: "None",
        execute: (data) => {
            return new Promise((resolve, reject) => {
                resolve();
            });
        }
    },
    "log": {
        name: "Log",
        inputs: {
            content: {
                name: "content"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.log(data.action.content);
            });
        }
    }
}