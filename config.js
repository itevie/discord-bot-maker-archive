const package = require("./package.json");

module.exports = {
    version: package.version,
    name: "Discord Bot Maker",
    id: package.name,
    electron: package?.devDependencies?.electron?.replace("^", "") || "23.0.0",
    node: process.version
}