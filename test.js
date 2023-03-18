const toml = require("toml");
const fs = require("fs");
const getAllFiles = require("./getAllFiles");

const moduleDir = "C:/Users/Isabella/AppData/Roaming/discord-bot-maker/modules";

const modules = fs.readdirSync(moduleDir);

for (let i in modules) {
    console.log("Found module: " + modules[i]);
    let manifest = fs.readFileSync(moduleDir + "/" + modules[i] + "/manifest.toml");
    manifest = toml.parse(manifest);

    for (let m in manifest.list.module_list) {
        let file = manifest.list.module_list[m];
        console.log("Parsing module file: " + file + " for module " + modules[i]);

        let module = require(moduleDir + "/" + modules[i] + "/" + file);
        console.log(module);
    }
}