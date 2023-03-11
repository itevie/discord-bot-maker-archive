const {
    data
} = require("../../botManager");

let botManager = require(__dirname + "/../../botManager.js");

module.exports.parse = (text, variables, client, id, messageSending) => {
    variables.uptime = client.uptime;
    variables.prefix = botManager.data.bots[id].prefix;

    let sendingEmbeds = [];
    if (messageSending) {
        let embeds = JSON.parse(JSON.stringify(botManager.data.bots[id].resources.embeds));
        let embedWanting = text.match(/\{\{embed\:[a-zA-Z0-9\-\_]+\}\}/g);
        for (let i in embedWanting) {
            let name = embedWanting[i].substring(2, embedWanting[i].length - 2).split(":")[1];
            if (embeds[name]) {
                for (let i in embeds[name]) {
                    sendingEmbeds.push(parseRecursive(embeds[name][i], variables, client, id));
                }
            }
            text = text.replace(embedWanting[i], "");
        }
    }

    let vars = text.match(/\{\{([a-zA-Z0-9_\-]*\:)*[a-zA-Z0-9_\-]+}\}/g);
    for (let i in vars) {
        let v = vars[i].substring(2, vars[i].length - 2);
        if (v.startsWith("embed:")) continue;
        let res = module.exports.travelJSON(v, variables);

        text = text.replace(vars[i], res);
    }

    text = text.replace(/\{\{arg[0-9]+\}\}/g, "").replace(/\\n/g, "\n");
    if (messageSending) {
        return {
            content: text,
            embeds: sendingEmbeds
        }
    }

    return text;
}

function parseRecursive(data, variables, client, id) {
    for (let i in data) {
        if (typeof data[i] == "object") {
            data[i] = parseRecursive(data[i], variables, client, id);
            continue;
        } else {
            data[i] = module.exports.parse(data[i].toString(), variables, client, id);
        }
    }

    return data;
}

module.exports.parseRecursive = parseRecursive;

module.exports.travelJSON = (path, json) => {
    console.log(json)
    let keys = path.split(":");

    for (let i in keys) {
        if (json[keys[i]] == null || json[keys[i]] == undefined) {
            global.sendLog("Key not found: " + keys[i] + " whilst looking for " + path, "error");
            return undefined;
        }

        if (typeof json[keys[i]] == "object") {
            if (keys.length == 1) {
                return JSON.stringify(json[keys[i]]);
            }

            let key = keys[i];
            keys.shift();
            return module.exports.travelJSON(keys.join(":"), json[key]);
        } else {
            return json[keys[i]];
        }
    }
}