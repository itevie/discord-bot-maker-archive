const botManager = require(__dirname + "/../../botManager.js");
const parse = require(__dirname + "/../utils/parser.js").parse;

module.exports.details = {
    name: "Messages"
}

module.exports.actions = {
    "send-author-message": {
        allowedEvents: ["messageCreate"],
        name: "Send Message In Author's Message's Channel",
        inputs: {
            content: {
                name: "content",
                type: "textarea",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.message.channel.send(
                    parse(data.action.content, data.variables, data.client, data.botId, true)
                ).catch(err => {
                    reject(err.toString());
                }).then(message => {
                    resolve(message.id);
                });
            });
        }
    },

    "send-message": {
        allowedEvents: ["*"],
        name: "Send Message",
        needs: ["id", "content"],
        inputs: {
            content: {
                name: "content",
                type: "textarea",
                allowEmpty: false
            },
            id: {
                name: "channel id"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.client.channels.find(ch =>
                    (ch.id == parse(data.action.id, data.variables, data.client, data.botId))
                ).then(channel => {
                    channel.send(
                        parse(data.action.content, data.variables, data.client, data.botId, true)
                    ).catch(err => {
                        reject(err.toString());
                    }).then(newMessage => {
                        resolve(newMessage.id);
                    });
                }).catch(err => {
                    reject(err.toString());
                });
            });
        }
    },

    "reply-to-author-message": {
        allowedEvents: ["messageCreate"],
        name: "Reply To Author's Message",
        inputs: {
            content: {
                name: "content",
                type: "textarea",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.message.reply(
                    parse(data.action.content, data.variables, data.client, data.botId, true)
                ).catch(err => {
                    reject(err.toString());
                }).then(newMessage => {
                    resolve(newMessage.id);
                })
            });
        }
    },

    "reply-to-message": {
        allowedEvents: ["messageCreate"],
        name: "Reply To Message",
        needs: ["id", "content"],
        inputs: {
            content: {
                name: "content",
                type: "textarea",
                allowEmpty: false
            },
            id: {
                name: "message id"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.message.channel.messages.fetch(
                    parse(data.action.id, data.variables, data.client, data.botId)
                ).catch(err => {
                    reject(err.toString());
                }).then(msg => {
                    msg.reply(
                        parse(data.action.content, data.variables, data.client, data.botId, true)
                    ).catch(err => {
                        reject(err.toString());
                    }).then(newMessage => {
                        resolve(newMessage.id);
                    });
                });
            });
        }
    },

    "delete-author-message": {
        allowedEvents: ["messageCreate"],
        name: "Delete Author's Message",
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.message.delete().catch(err => {
                    reject(err.toString());
                }).then(() => {
                    resolve(true);
                });
            });
        }
    },

    "delete-message": {
        allowedEvents: ["messageCreate"],
        name: "Delete Message",
        inputs: {
            id: {
                name: "message id",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.message.channel.messages.fetch(
                    parse(data.action.id, data.variables, data.client, data.botId)
                ).catch(err => {
                    reject(err.toString());
                }).then(msg => {
                    msg.delete().catch(err => {
                        reject(err.toString());
                    }).then(() => {
                        resolve(true);
                    });
                });
            });
        }
    },

    "pin-author-message": {
        allowedEvents: ["messageCreate"],
        name: "Pin Author's Message",
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.message.pin().catch(err => {
                    reject(err.toString());
                }).then(() => {
                    resolve(true);
                });
            });
        }
    },

    "pin-message": {
        allowedEvents: ["messageCreate"],
        name: "Pin Message",
        inputs: {
            id: {
                name: "message id",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.message.channel.messages.fetch(
                    parse(data.action.id, data.variables, data.client, data.botId)
                ).catch(err => {
                    reject(err.toString());
                }).then(msg => {
                    msg.pin().catch(err => {
                        reject(err.toString());
                    }).then(() => {
                        resolve(true);
                    });
                })
            });
        }
    },

    "unpin-message": {
        allowedEvents: ["messageCreate"],
        name: "Unpin Message",
        inputs: {
            id: {
                name: "message id",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.message.channel.messages.fetch(
                    parse(data.action.id, data.variables, data.client, data.botId)
                ).catch(err => {
                    reject(err.toString());
                }).then(msg => {
                    msg.unpin().catch(err => {
                        reject(err.toString());
                    }).then(() => {
                        resolve(true);
                    });
                })
            });
        }
    },

    "add-reaction-author": {
        allowedEvents: ["messageCreate"],
        name: "Add Reaction To Author's Message",
        inputs: {
            emoji: {
                name: "emoji",
                type: "text",
                allowEmpty: false
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.message.react(data.action.content).then(() => {
                    return true;
                }).catch(err => {
                    reject(err.toString());
                }).then(() => {
                    resolve(true);
                });
            });
        }
    },
}