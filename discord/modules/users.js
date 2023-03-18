const parse = require(__dirname + "/../utils/parser.js").parse;

module.exports.details = {
    name: "users"
}

module.exports.actions = {
    "send-author-dm": {
        name: "Send Message To Author",
        inputs: {
            content: {
                name: "content",
                allowEmpty: false
            }
        },
        execute: async (data) => {
            return new Promise(async (resolve, reject) => {
                data.message.author.send(parse(data.action.content, data.variables, data.client, data.botId, true)).then(msg => {
                    resolve(msg);
                }).catch(err => {
                    reject(err.toString());
                });
            });
        }
    },
    "send-dm": {
        name: "Send Message To User",
        inputs: {
            content: {
                name: "content",
                allowEmpty: false
            },
            id: {
                name: "user id",
                allowEmpty: false
            }
        },
        execute: async (data) => {
            return new Promise(async (resolve, reject) => {
                data.client.users.cache.get(data.action.id).send(
                    parse(data.action.content, data.variables, data.client, data.botId, true)
                ).catch(err => {
                    reject(err.toString());
                }).then(newMessage => {
                    resolve(newMessage);
                });
            });
        }
    }
}