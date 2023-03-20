const botManager = require(__dirname + "/../../botManager.js");

module.exports.details = {
    name: "Maths"
}

module.exports.actions = {
    "plus": {
        allowedEvents: ["*"],
        name: "Plus (+)",
        inputs: {
            "number1": {
                name: "number 1",
                type: "text",
                allowEmpty: false
            },
            "number2": {
                name: "number 2",
                type: "text",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                resolve(parseFloat(data.action.number1) + parseFloat(data.action.number2));
            });
        }
    },

    "subtract": {
        allowedEvents: ["*"],
        name: "Subtract (-)",
        inputs: {
            "number1": {
                name: "number 1",
                type: "text",
                allowEmpty: false
            },
            "number2": {
                name: "number 2",
                type: "text",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                resolve(parseFloat(data.action.number1) - parseFloat(data.action.number2));
            });
        }
    },

    "multiply": {
        allowedEvents: ["*"],
        name: "Multiply (*)",
        inputs: {
            "number1": {
                name: "number 1",
                type: "text",
                allowEmpty: false
            },
            "number2": {
                name: "number 2",
                type: "text",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                resolve(parseFloat(data.action.number1) * parseFloat(data.action.number2));
            });
        }
    },

    "divide": {
        allowedEvents: ["*"],
        name: "Divide (/)",
        inputs: {
            "number1": {
                name: "number 1",
                type: "text",
                allowEmpty: false
            },
            "number2": {
                name: "number 2",
                type: "text",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                resolve(parseFloat(data.action.number1) / parseFloat(data.action.number2));
            });
        }
    },

    "power": {
        allowedEvents: ["*"],
        name: "Power (^)",
        inputs: {
            "number1": {
                name: "number 1",
                type: "text",
                allowEmpty: false
            },
            "number2": {
                name: "number 2",
                type: "text",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                resolve(Math.pow(parseFloat(data.action.number1), parseFloat(data.action.number2)));
            });
        }
    },

    "floor": {
        allowedEvents: ["*"],
        name: "Floor",
        inputs: {
            "number1": {
                name: "number 1",
                type: "text",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                resolve(Math.floor(parseFloat(data.action.number1)));
            });
        }
    },

    "random": {
        allowedEvents: ["*"],
        name: "Random",
        inputs: {
            "number1": {
                name: "minimum",
                allowEmpty: false
            },
            "number2": {
                name: "maximum",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                resolve(Math.floor(Math.random() * (data.action.number1 - data.action.number2)) + data.action.number1);
            });
        }
    },

    "ratelimit": {
        allowedEvents: ["*"],
        name: "ratelimit",
        description: "Check if the difference between 2 dates is bigger than the ratelimit",
        inputs: {
            "last": {
                name: "last",
                allowEmpty: false
            },
            "now": {
                name: "now",
                allowEmpty: false
            },
            "ratelimit": {
                name: "ratelimit",
                allowedEvents: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                if (data.action.ratelimit - (date.action.now - date.actioin.last) < 0) {
                    resolve(true);
                } reject(false);
            });
        }
    }
}