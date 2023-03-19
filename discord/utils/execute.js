let {
    parse,
    parseRecursive
} = require(__dirname + "/../utils/parser.js");
const {
    app
} = require("electron");
const toml = require("toml");
const errorManager = require(__dirname + "/../../errorManager.js");
const botRunner = require(__dirname + "/../../botRunner.js");
const botManager = require(__dirname + "/../../botManager.js");
const fs = require("fs");

let actions = {

}

let modulesList = [];
module.exports.modulesList = modulesList;

let webActions = {};
module.exports.webActions = webActions;

let packages = [ __dirname + "/../modules" ];
if (fs.existsSync(app.getPath("userData") + "/modules"))
    for (let i of fs.readdirSync(app.getPath("userData") + "/modules"))
        packages.push(app.getPath("userData") + "/modules" + "/" + i);

global.dbm.log("Found " + packages.length + " package(s)", "package-loader");

for (let i in packages) {
    global.dbm.log("Loading package " + packages[i], "package-loader");
    if (!fs.existsSync(packages[i] + "/manifest.toml")) {
        return errorManager.fatalError(new Error("The package " + packages[i] + " does not have a manifest.toml"));
    }

    let manifest = fs.readFileSync(packages[i] + "/manifest.toml");
    manifest = toml.parse(manifest);

    global.dbm.log("Package " + packages[i] + " manifest: v" + manifest.manifest_version + " name:" + manifest.information.name + "(" + manifest.information.version + ") by:" + manifest.information.author, "package-loader");

    let modules = manifest.list.module_list;

    for (let m in modules) {
        global.dbm.log("Loading module " + modules[m] + " from package " + manifest.information.name, "package-loader");
        if (!fs.existsSync(packages[i] + "/" + modules[m] + ".js")) {
            return errorManager.fatalError(new Error("Cannot find module " + packages[i] + "/" + modules[m] + ".js" + " at package " + manifest.information.name));
        }

        if (modules[m] == "information") {
            return errorManager.fatalError(new Error("Module name cannot be 'information' in module " + manifest.information.name + " at package " + manifest.information.name));
        }

        if (!manifest[modules[m]]) {
            return errorManager.fatalError(new Error("Module manifest cannot be found in package's manifest file, module " + modules[i] + " at package " + manifest.information.name));
        }

        let module = require(packages[i] + "/" + modules[m] + ".js");
        modulesList.push(manifest.information.name);

        let ac = module.actions;
        let moduleManifest = manifest[modules[m]];

        for (let i in ac) {
            global.dbm.log("Loading action " + i + " from module " + modules[m] + " from package " + manifest.information.name, "package-loader");
            
            if (!webActions[manifest.information.name]) webActions[manifest.information.name] = {
                information: manifest.information
            };
            if (!webActions[manifest.information.name][moduleManifest.name]) webActions[manifest.information.name][moduleManifest.name] = {
                information: moduleManifest
            };

            let name = manifest.information.name + ":" + moduleManifest.name + ":" + i;

            actions[name] = ac[i];

            webActions[manifest.information.name][moduleManifest.name][i] = {
                name: ac[i].name,
                inputs: ac[i].inputs || {},
                description: ac[i].description || "",
                allowedEvents: ac[i].allowedEvents || ["*"],
            }

            global.dbm.log("Loaded action: " + manifest.information.name + ":" + moduleManifest.name + ":" + i, "package-loader");
        }

        global.dbm.log("Loaded module: " + manifest.information.name + ":" + moduleManifest.name, "package-loader");
    }

    global.dbm.log("Loaded package: " + manifest.information.name, "package-loader");
}

global.dbm.log("Loaded " + Object.keys(actions).length + " actions from " + modulesList.length + " modules from " + packages.length + " packages!", "module-manager");

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
        global.dbm.log(text, "event:" + eventType + " (" + botId + ")");
    }

    function error(text) {
        global.dbm.log(text, "error:event:" + eventType + " (" + botId + ")");
    }

    data.log = sendInfo;

    // Add default variables
    variables.api_ping = Math.round(client.ws.ping);
    // Add variables
    if (["messageCreate"].includes(eventType)) {
        variables.ping = Date.now() - options.message.createdTimestamp;

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
        } else if (type == "conditional:one-action-if-exists") {
            let val = true;
            if (data.action.what != undefined || data.action.what != null || data.action.what != NaN) {
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
            error(err + "\n" + err.stack?.toString().replace(/\n/g, "<br>"));
            return;
        });
    }

    nextIdx();
}

module.exports.getListOfActions = () => {
    return Object.keys(actions);
}