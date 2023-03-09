const botManager = require(__dirname + "/../../botManager.js");
const parse = require(__dirname + "/../utils/parser.js").parse;

module.exports.details = {
    name: "Strings"
}

module.exports.actions = {
    "lowercase": {
        allowedEvents: ["*"],
        name: "lowercase",
        inputs: {
            content: {
                name: "content"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                resolve(data.action.content.toLowerCase());
            });
        }
    },

    "uppercase": {
        allowedEvents: ["*"],
        name: "UPPERCASE",
        inputs: {
            content: {
                name: "content"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                resolve(data.action.content.toUpperCase());
            });
        }
    },

    "randomcase": {
        allowedEvents: ["*"],
        name: "RaNDoMCaSE",
        inputs: {
            content: {
                name: "content"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                let text = data.action.content.toLowerCase().split("");
                for (let i in text)
                    if (Math.random() > 0.5) text[i] = text[i].toUpperCase();
                resolve(text.join(""));
            });
        }
    },

    "length": {
        allowedEvents: ["*"],
        name: "Length",
        inputs: {
            content: {
                name: "content"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                resolve(data.action.content.length.toString());
            });
        }
    },

    "replace": {
        allowedEvents: ["*"],
        name: "Replace",
        inputs: {
            content: {
                name: "content",
                type: "textarea"
            },
            replace: {
                name: "replace"
            },
            with: {
                name: "with"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                resolve(parse(data.action.content.replace(parse(data.action.what), parse(data.action.with))));
            });
        }
    }
}