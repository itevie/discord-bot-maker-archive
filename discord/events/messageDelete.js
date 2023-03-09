let botManager = require(__dirname + "/../../botManager.js");
let {
    parse
} = require(__dirname + "/../utils/parser.js");
const execute = require(__dirname + "/../utils/execute.js").execute;

module.exports.init = (client, id) => {
    let botData = JSON.parse(JSON.stringify(botManager.data.bots[id]));

    // DEFAULT FUNCTIONS
    function sendInfo(text) {
        global.sendLog(text, "event:messageDelete (" + id + ")");
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