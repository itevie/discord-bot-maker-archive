const getAllFiles = require("./getAllFiles");
const fs = require("fs");

let files = getAllFiles(__dirname + "/locales");
let langs = {};

for (let i in files) {
    let text = fs.readFileSync(files[i], "utf-8");
    let keys = {};
    let split = text.split(/\r?\n/g);

    for (let s in split) {
        let line = split[s];
        let sp = line.split("=");
        let key = sp[0];
        sp.shift();
        let value = sp.join("=");

        keys[key] = value;
    }

    langs[keys["LANG_NAME"]] = keys;
}

module.exports = langs;