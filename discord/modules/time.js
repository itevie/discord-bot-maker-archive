module.exports.actions = {
    "current-time": {
        name: "Current Time",
        description: "Gets the current time in millisecond (EPOCH) format",
        execute: (data) => {
            return new Promise((resolve, reject) => {
                resolve(Date.now());
            });
        }
    }
}