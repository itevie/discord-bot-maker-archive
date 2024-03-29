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

    // Flatten variables for autocomplete
    let keys = [];
    
    function searchDeeper(current, cObject, deep) {
        if (deep == 5) return;
        for (let i in cObject) {
            if (typeof cObject[i] != "object")
                keys.push(current + ":" + i);
            else searchDeeper(current + ":" + i, cObject[i], deep + 1);
        }
    }

    for (let i in variables) {
        if (typeof variables[i] != "object")
            keys.push(i);
        else searchDeeper(i, variables[i], 0);
    }

    database.data.autoComplete = keys;

    let fail = false;
    let skipNext = false;

    // Loop through actions
    let i = 0;
    async function nextIdx() {
        // Function to load and run the next action
        function nextOne(val) {
            // If the result is NOT undefined, set the result to the value
            if (val != undefined && val != null) variables.result = val;
            i++;

            if (!options.actions[i]) return;
            nextIdx();
        }
        
        // If skipNext is true, skip this action and do the next one
        if (skipNext == true) {
            skipNext = false;
            return nextOne(null);
        }

        // If it is DEL, do the next one
        if (options.actions[i] == "DEL") return nextOne();

        // Get the type and parse the action data
        if (options.actions[i] == undefined) return error("Action " + (+i + 1) + " is undefined?");
        let type = options.actions[i].type; // Get the type
        data.action = structuredClone(options.actions[i]); // Get the action data

        // Parse the action stuff
        let a = parseRecursive(data.action, variables, client, botId);
        data.action = a;
        
        // Parse action types
        for (let a in data.action) {
            if (i == "type" || type == "built-in:misc:stop-actions") continue;
            if (actions[type]?.inputs[a]?.dataType) {
                try {
                    let t = new Variable(data.action[a], { type: actions[type].inputs[a].dataType });
                    data.action[a] = t.value;
                } catch (err) {
                    return error("Failed to parse action paramater: " + a + " (potential error: the action param (" + a + " requires type " + actions[type].inputs[a].dataType + ")) " + err);
                }
            }
        }

        // If it is to stop, stop
        if (type == "built-in:misc:stop-actions") return;

        sendInfo("Execute action " + (parseInt(i) + 1) + " (" + type + ")");

        // Check if action exists
        if (!actions[type]) {
            fail = "Action type " + type + " does not exist"
            return;
        }
        data.variables = variables;

        // If the action is a built-in:variables or conditional compute it here:
        if (type == "built-in:variables:set-variable") {
            variables[data.action.id] = parse(data.action.content, variables, client, botId);
            return nextOne();
        } else if (type == "built-in:variables:delete-variable") {
            if (variables[data.action.id]) delete variables[data.action.id];
            return nextOne();
        } else if (type == "built-in:conditional:one-action-if-equals") {
            if (data.action.statement1 != data.action.statement2) {
                skipNext = true;
            }
            return nextOne();
        } else if (type == "built-in:conditional:one-action-if-not-equals") {
            if (data.action.statement1 == data.action.statement2) {
                skipNext = true;
            }
            return nextOne();
        } else if (type == "built-in:conditional:one-action-if-starts-with") {
            if (data.action.statement1.startsWith(data.action.statement2) == false) {
                skipNext = true;
            }
            return nextOne();
        } else if (type == "built-in:conditional:one-action-if-ends-with") {
            if (data.action.statement1.endsWith(data.action.statement2) == false) {
                skipNext = true;
            }
            return nextOne();
        } else if (type == "built-in:conditional:one-action-if-includes") {
            if (data.action.statement1.includes(data.action.statement2) == false) {
                skipNext = true;
            }
            return nextOne();
        } else if (type == "built-in:conditional:one-action-if-exists") {
            if (data.action.statement1 == undefined || data.action.statement1 == null || data.action.statement1 == NaN) {
                skipNext = true;
            }
            return nextOne();
        }

        // Check if it is allowed to run
        if (actions[type].allowedEvents && !actions[type].allowedEvents.includes(eventType) && !actions[type].allowedEvents.includes("*")) {
            fail = "The event " + eventType + " does not allow the action type " + type;
            return;
        }

        // Execute the action
        actions[type].execute(data).then(res => {
            if (!res) return nextOne();
            sendInfo("Action " + (parseInt(i) + 1) + " returned: " + res);
            return nextOne(res);
        }).catch(err => {
            error(err + "\n" + err.stack?.toString().replace(/\n/g, "<br>"));
            return;
        });
    }

    nextIdx();
}

// Get LIST of actions
module.exports.getListOfActions = () => {
    return Object.keys(actions);
}