let botManager = require(__dirname + "/../../botManager.js");
let {
    parse
} = require(__dirname + "/../utils/parser.js");
const execute = require(__dirname + "/../utils/execute.js").execute;

module.exports.init = (client, id) => {
    try {
        var botData = JSON.parse(JSON.stringify(botManager.data.bots[id]));
    } catch (err) {
        return global.dbm.error("Failed to start bot, your bot's data may be corrupt or missing: " + err.toString());
    }
    
    if (!botData) return;

    // DEFAULT FUNCTIONS
    function sendInfo(text) {
        global.dbm.log(text, "event:messageCreate (" + id + ")");
    }

    client.on("messageCreate", async message => {
        let prefix = botManager.data.bots[id].prefix;
        let content = message.content;

        if (content.startsWith(prefix)) {
            let args = content.replace(prefix, "").split(" ");
            let command = args[0];
            args.shift();
            sendInfo("Command recieved: " + command);

            if (message.system) return sendInfo("Command refused: author is System.");

            if (botData.commands[command] && botData.commands[command].type == "prefix" && !(botData.commands[command].ignoreBots && message.author.bot)) {
                sendInfo("Running command: " + content)
                let cmd = botData.commands[command];

                await execute({
                    client: client,
                    message: message,
                    args: args,
                    botData: botData,
                    eventType: "messageCreate",
                    command: cmd,
                    actions: cmd.actions,
                    type: "prefix"
                });
            }
        }

        if (botData.events["messageCreate"]) {
            if (message.system) return sendInfo("Command refused: author is System.");
            await execute({
                client: client,
                message: message,
                botData: botData,
                eventType: "messageCreate",
                actions: botData.events.messageCreate.actions,
                type: "event"
            });
        }

        for (let i in botData.commands) {
            if (botData.commands[i].type == "new-message" && !(botData.commands[i].ignoreBots && message.author.bot)) {
                if (message.system) return sendInfo("Command refused: author is System.");
                await execute({
                    client: client,
                    message: message,
                    botData: botData,
                    eventType: "messageCreate",
                    command: botData.commands[i],
                    actions: botData.commands[i].actions,
                    type: "new-message"
                });
            }
        }
    });
}