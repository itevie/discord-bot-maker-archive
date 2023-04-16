let {
    parse,
    parseRecursive
} = require(__dirname + "/../utils/parser.js");
const {
    app
} = require("electron");
const extensions = require(__dirname + "/../../extensionLoader");
const Variable = require(__dirname + "/../Variable.js");
const Types = require(__dirname + "/../Types.js");
const database = require(__dirname + "/../../database.js");
const safeEval = require("safe-eval");

// Export stuff
module.exports.actions = extensions.actions;
module.exports.modulesList = extensions.modulesList;
module.exports.webActions = extensions.webActions;

let actions = module.exports.actions;

module.exports.execute = async (options) => {
    // Load all variables from the options
    let botData = options.botData;
    let botId = options.botData.id;
    let client = options.client;
    let eventType = options.eventType;
    let variables = {};
    let args = options.args;
    let js = options.js

    // This will be sent to stuff
    let data = {
        botData: botData,
        botId: botId,
        client: client,
        eventType: eventType
    }

    // DEFAULT FUNCTIONS
    // Sends info to the log
    function sendInfo(text) {
        global.dbm.log(text, "event:" + eventType + " (" + botId + ")");
    }

    // Sends an error
    function error(text) {
        global.dbm.log(text, "error:event:" + eventType + " (" + botId + ")");
        global.dbm.error(text, {
            bot: botId
        });
    }

    if (!js) return error("Command data does not have JS, cannot continue");

    data.log = sendInfo;

    // Add default variables
    variables.api_ping = Math.round(client.ws.ping);

    // Add variables
    if (["messageCreate"].includes(eventType)) {
        variables.ping = new Variable(Date.now() - options.message.createdTimestamp, { type: "number" });

        variables.message = options.message;
        data.message = options.message;

        // If the type is prefix, add the arg variables
        if (options.type == "prefix") {
            data.args = options.args; // Get args

            // Loop through args
            for (let i in args) {
                // Set thr argX variables: arg0 arg1 etc
                variables["arg" + (parseInt(i) + 1)] = new Variable(args[i], { type: "string" });

                let t = [];
                for (let x = parseInt(i) + 1; x < args.length; x++) {
                    t.push(args[x]);
                }

                variables["afterarg" + (parseInt(i) + 1)] = new Variable(t.join(" "), { type: "string" });
            }
        }
    }

    let context = {
        __data: {
            executeAction: (id, d) => {
                return new Promise((resolve, reject) => {
                    sendInfo("Executing action: " + id);

                    data.action = structuredClone(d.args);
                    let a = parseRecursive(data.action, variables, client, botId);
                    data.action = a;

                    data.variables = variables;
                    actions[id].execute(data).then(result => {
                        sendInfo("Finished action: " + id + ", gave: " + result);
                        if (result != undefined) variables.result = result;
                        resolve();
                    }).catch((err) => {
                        console.log(err)
                        reject(err);
                    });
                });
            },
            getVariable: (id) => {
                return new Promise((resolve) => {
                    resolve(parse("{{" + id + "}}", variables, client, botId));
                });
            }
        },
    }

    safeEval(`2;${js.replace(/\n/g, ";")}`, context);
}

// Get LIST of actions
module.exports.getListOfActions = () => {
    return Object.keys(actions);
}