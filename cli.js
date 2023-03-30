const botRunner = require("./botRunner");
const externalManager = require("./externalManager");

let beginner = "--";
let flagsList = [];

for (let i in process.argv) {
    if (process.argv[i].startsWith(beginner)) flagsList.push(process.argv[i].replace(beginner, ""));
}

let flags = [];

for (let i in flagsList) {
    if (flagsList[i].split("=").length == 2) {
        flags.push([ flagsList[i].split("=")[0], flagsList[i].split("=")[1] ]);
    } else flags.push([flagsList[i], null]);
}

for (let i in flags) {
    if (flags[i][1] == "true") flags[i][1] = true;
    else if (flags[i][1] == "false") flags[i][1] = false;
    else if (flags[i][1] == "null") flags[i][1] = null;
    else if (flags[i][1] != null && flags[i][1].match(/-?[0-9]+(.[0-9]+)?/)) flags[i][1] = +(flags[i][1]);
}

module.exports.getFlag = (flagName, def) => {
    for (let i in flags) {
        if (flags[i][0] == flagName) return flags[i][1];
    }

    return def || false;
}

module.exports.run = (loadMainWindow) => {
    let noWindow = false;
    let forceWindow = false;

    for (let i in flags) {
        let flag = flags[i];
        if (flag[0] == "bot") {
            noWindow = true;
            setTimeout(() => {
                botRunner.run(flag[1]);
            }, 3000);
        } else if (flag[0] == "server") {
            noWindow = true;
            externalManager.start(flag[1]);
        } else if (flag[0] == "force-window") {
            forceWindow = true;
        }
    }

    if (noWindow == false || forceWindow == true) loadMainWindow();
}