module.exports.details = {
    name: "misc"
}

module.exports.actions = {
    "typing": {
        name: "Start Typing Indicator",
        allowedEvents: ["*"],
        inputs: {

        },
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
        inputs: {

        },
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
}