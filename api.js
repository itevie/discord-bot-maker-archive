const database = require("./database");
const extensionLoader = require("./extensionLoader");

let pluginAPIs = {};
let events = {};

module.exports = {
    registerAction: (module, name, data, caller) => {
        if (!caller) throw new Error("Missing plugin name as 3rd param.");

        if (!extensionLoader.webActions["plugins"]) {
            extensionLoader.webActions["plugins"] = {
                information: {
                    description: "Actions added by imported plugins",
                    auhtor: "Multiple Authors",
                    name: "plugins",
                    version: "???"
                }
            }
        }

        if (!extensionLoader.webActions.plugins[module]) {
            extensionLoader.webActions.plugins[module] = {
                information: {
                    description: "Actions imported by the plugin " + module,
                    name: module
                }
            }
        }

        extensionLoader.webActions.plugins[module][name] = {
            name: data.name,
            inputs: data.inputs || {},
            description: data.description || "",
            allowedEvents: data.allowedEvents || ["*"],
        }

        extensionLoader.modulesList.push(module);
        extensionLoader.actions["plugins:" + module + ":" + name] = data;

        global.dbm.log("Action registed by plugin " + caller + ": " + "plugins:" + module + ":" + name, "dbm-api");
    },

    registerAPI: (name, func, caller) => {
        if (!caller) throw new Error("Missing plugin name as 3rd param.");

        pluginAPIs[name] = func;
        global.dbm.log("Plugin API registered: " + name + " by plugin " + caller, "dbm-api");
    },

    registerEvent: (name, data, caller) => {
        if (!caller) throw new Error("Missing plugin name as 3rd param.");

        if (!events[name]) events[name] = [];
        events[name].push(data);
        global.dbm.log("Plugin event listener registered for event " + name + " by plugin " + caller, "dbm-api");
    },

    database: {
        fetchKey: (botName, keyName) => {
            if (!database.data.bots[botName])
                throw new Error("Unknown bot name: " + botName);
            return database.data.bots[botName].database[keyName];
        }
    },
}

module.exports.API = class API {
    #pluginName = "";

    constructor(pluginName) {
        this.#pluginName = pluginName;
    }

    registerAPI(name, func) {
        module.exports.registerAPI(name, func, this.#pluginName);
    }

    registerEvent(name, func) {
        module.exports.registerEvent(name, {
            plugin: this.#pluginName,
            function: func
        }, this.#pluginName);
    }

    registerAction(name, data) {
        module.exports.registerAction(this.#pluginName, name, data, this.#pluginName);
    }

    plugins = pluginAPIs;
}

module.exports.events = events;