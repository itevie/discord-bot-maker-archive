let {
    parse,
    parseRecursive
} = require(__dirname + "/../utils/parser.js");
const {
    app
} = require("electron");
const botRunner = require(__dirname + "/../../botRunner.js");
const botManager = require(__dirname + "/../../botManager.js");
const fs = require("fs");

let actions = {
    "x:stop-actions": {
        name: "Stop Actions"
    },
    "x:none": {
        name: "None"
    },
    "x:log": {
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

let modulesList = [];
module.exports.modulesList = modulesList;

let webActions = {};
module.exports.webActions = webActions;

let moduleList = fs.readdirSync(__dirname + "/../modules");
for (let i in moduleList) {
    moduleList[i] = __dirname + "/../modules/" + moduleList[i];
}

// Load external modules
let path = app.getPath("userData");
if (fs.existsSync(path + "/modules")) {
    let externalModules = fs.readdirSync(path + "/modules");
    for (let i in externalModules) {
        moduleList.push(path + "/modules/" + externalModules[i]);
    }
}

for (let i in moduleList) {
    if (!moduleList[i].endsWith(".js")) continue;
    let module = require(moduleList[i]);
    let ac = module.actions;
    let details = module.details;
    modulesList.push(details.name);
    let moduleName = details.name.toLowerCase();

    for (let a in ac) {
        let name = moduleName + ":" + a;
        actions[name] = ac[a];
    }

    global.sendLog("Initiated module: " + moduleName, "module-manager");
}

for (let i in actions) {
    let orig = i;
    let moduleName = i.split(":")[0];

    if (!webActions[moduleName]) webActions[moduleName] = {};

    webActions[moduleName][orig] = {
        name: actions[i].name,
        inputs: actions[i].inputs || {}
    }

}

module.exports.execute = async (options) => {
    let botData = options.botData;
    let botId = options.botData.id;
    let client = options.client;
    let eventType = options.eventType;
    let variables = {};
    let args = options.args;

    let data = {
        botData: botData,
        botId: botId,
        client: client,
        eventType: eventType
    }

    // DEFAULT FUNCTIONS
    function sendInfo(text) {
        global.sendLog(text, "event:" + eventType + " (" + botId + ")");
    }

    function error(text) {
        global.sendLog(text, "error:event:" + eventType + " (" + botId + ")");
    }

    data.log = sendInfo;

    // Add default variables
    variables.api_ping = Math.round(client.ws.ping);
    // Add variables
    if (["messageCreate"].includes(eventType)) {
        variables.ping = Date.now() - options.message.createdTimestamp;

        // Add all keys from options.message
        /*for (let i in options.message) {
            if (["number", "string", "boolean"].includes(typeof options.message[i])) {
                variables["message:" + i] = options.message[i];
            }
        }

        // Add all keys from options.message.refernce
        for (let i in options.message.reference) {
            if (["number", "string", "boolean"].includes(typeof options.message.reference[i])) {
                variables["message:reference:" + i] = options.message.reference[i];
            }
        }

        // Add all keys from options.message.author
        for (let i in options.message.author) {
            if (["number", "string", "boolean"].includes(typeof options.message.author[i])) {
                variables["message:author:" + i] = options.message.author[i];
            }
        }

        // Add al keys from options.message.channel
        for (let i in options.message.channel) {
            if (
                ["nsfw", "guildId", "parentId", "id", "topic", "lastMessageId"]
                    .includes(i)
            ) {
                variables["message:channel:" + i] = options.message.channel[i];
            }
        }*/

        variables.message = options.message;

        data.message = options.message;

        if (options.type == "prefix") {
            data.args = options.args;

            for (let i in args) {
                variables["arg" + (parseInt(i) + 1)] = args[i];

                let t = [];
                for (let x = parseInt(i) + 1; x < args.length; x++) {
                    t.push(args[x]);
                }

                variables["afterarg" + (parseInt(i) + 1)] = t.join(" ");
            }
        }
    }

    let fail = false;
    let skipNext = false;

    // Loop through actions
    let i = 0;
    async function nextIdx() {
        function nextOne(val) {
            variables.result = val;
            i++;
            if (!options.actions[i]) return;
            nextIdx();
        }
        
        if (skipNext == true) {
            skipNext = false;
            return nextOne(null);
        }

        let type = options.actions[i].type;
        data.action = JSON.parse(JSON.stringify(options.actions[i]));
        let a = parseRecursive(data.action, variables, client, botId);
        data.action = a;

        if (type == "x:stop-actions") return;

        sendInfo("Execute action " + (parseInt(i) + 1) + " (" + type + ")");

        // Check if action exists
        if (!actions[type]) {
            fail = "Action type " + type + " does not exist"
            return;
        }
        data.variables = variables;

        if (type == "variables:set-variable") {
            variables[data.action.id] = parse(data.action.content, variables, client, botId);
            return nextOne();
        } else if (type == "variables:delete-variable") {
            if (variables[data.action.id]) delete variables[data.action.id];
            return nextOne();
        } else if (type == "conditional:one-action-if-equals") {
            let val = true;
            if (data.action.statement1 != data.action.statement2) {
                skipNext = true;
                val = false;
            }
            return nextOne(val);
        } else if (type == "conditional:one-action-if-not-equals") {
            let val = true;
            if (data.action.statement1 == data.action.statement2) {
                skipNext = true;
                val = false;
            }
            return nextOne(val);
        } else if (type == "conditional:one-action-if-starts-with") {
            let val = true;
            if (data.action.statement1.startsWith(data.action.statement2) == false) {
                skipNext = true;
                val = false;
            }
            return nextOne(val);
        } else if (type == "conditional:one-action-if-ends-with") {
            let val = true;
            if (data.action.statement1.endsWith(data.action.statement2) == false) {
                skipNext = true;
                val = false;
            }
            return nextOne(val);
        } else if (type == "conditional:one-action-if-includes") {
            let val = true;
            if (data.action.statement1.includes(data.action.statement2) == false) {
                skipNext = true;
                val = false;
            }
            return nextOne(val);
        }

        // Check if it is allowed to run
        if (actions[type].allowedEvents && !actions[type].allowedEvents.includes(eventType) && !actions[type].allowedEvents.includes("*")) {
            fail = "The event " + eventType + " does not allow the action type " + type;
            return;
        }

        actions[type].execute(data).then(res => {
            return nextOne(res);
        }).catch(err => {
            error(err + "\n" + err.stack.toString().replace(/\n/g, "<br>"));
            return;
        });
    }

    nextIdx();
}

module.exports.getListOfActions = () => {
    return Object.keys(actions);
}