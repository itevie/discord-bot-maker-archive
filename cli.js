const botRunner = require("./botRunner");
const externalManager = require("./externalManager");

// Parse the flags
let beginner = "--";
let flagsList = [];

// Loop through process args
for (let i in process.argv) {
    if (process.argv[i].startsWith(beginner)) flagsList.push(process.argv[i].replace(beginner, ""));
}

let flags = [];

// Loop through the found args
for (let i in flagsList) {
    // Split by =, if there is more than 2, it is most likely key value (--bot=test as an example)
    if (flagsList[i].split("=").length == 2) {
        // Add it to flags
        flags.push([ flagsList[i].split("=")[0], flagsList[i].split("=")[1] ]);
    } else flags.push([flagsList[i], null]);
}

// Loop through them, setting the correct data type
for (let i in flags) {
    if (flags[i][1] == "true") flags[i][1] = true;
    else if (flags[i][1] == "false") flags[i][1] = false;
    else if (flags[i][1] == "null") flags[i][1] = null;
    else if (flags[i][1] != null && flags[i][1].match(/-?[0-9]+(.[0-9]+)?/)) flags[i][1] = +(flags[i][1]);
}

/**
 * Fetches a CLI flag
 * @param {String} flagName // The flag name to get
 * @param {*} def // The default value for the flag name if it isn't present
 * @returns The flag value
 */
module.exports.getFlag = (flagName, def) => {
    // Loop through all of them until it hopefully finds it
    for (let i in flags) {
        if (flags[i][0] == flagName) return flags[i][1];
    }

    // If there is a default value, return that or false
    return def || false;
}

/**
 * Runs all the given CLI flags 
 * @param {Function} loadMainWindow
 */
module.exports.run = (loadMainWindow) => {
    let noWindow = false; // Whether or not there should be no window
    let forceWindow = false; // Whether or not the window should be forced open regardless of the boave

    // Loop through args
    for (let i in flags) {
        let flag = flags[i];
        switch (flag[0]) {
            case "bot": // Check if the start bot flag exists
                noWindow = true;

                // Run with a delay to allow the bot time to start
                setTimeout(() => {
                    botRunner.run(flag[1]);
                }, 3000);
                break;
            case "server": // Start the server if the flag exists
                noWindow = true;
                externalManager.start(flag[1]);
                break;
            case "force-window": // If flag is present, the window will be started no matter what
                forceWindow = true;
                break;
        }
    }

    // Check if the main window should be shown
    if (noWindow == false || forceWindow == true) loadMainWindow();
}