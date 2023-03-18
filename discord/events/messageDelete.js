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
        global.dbm.log(text, "event:messageDelete (" + id + ")");
    }

    client.on("messageDelete", async message => {
        if (botData.events["messageDelete"]) {
            let event = botData.events["messageDelete"];

            for (let i in event.actions) {
                await execute({
                    client: client,
                    message: message,
                    botData: botData,
                    eventType: "messageDelete",
                    actions: event.actions
                });
            }
        }
    });
};