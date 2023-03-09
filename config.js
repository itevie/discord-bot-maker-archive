const package = require("./package.json");

module.exports = {
    version: package.version,
    name: "Discord Bot Maker",
    id: package.name,
    electron: package?.devDependencies?.electron?.replace("^", "") || "23.0.0",
    node: process.version,

    logTexts: [
        "Uh oh! I had a little issue.",
        "I'll try harder next time, I promise!",
        "Our developers didn't look over this issue...",
        "Oh darn. This wasn't meant to happen.",
        "What did you do?",
        "Hi. I'm Discord Bot Maker and I'm a crashaholic",
        "I just don't know what went wrong :(",
        "I let you down. Sorry :(",
        "I feel sad now :(",
        "My bad.",
        "Uh... Did I do that?",
        "Oops.",
        "Everything is going to plan. No, really that was supposed to happen.",
        "I'm sorry, Dave.",
        "On the bright side, I bought you a teddy bear!",
        "Don't be sad, have a hug! <3",
        "Quite honestly, I wouldn't worry myself about that.",
        "This doesn't make any sense!",
        "Why is it breaking :(",
        "Don't do that.",
        "Ouch. That hurt :(",
        "But it works on my machine."
    ]
}