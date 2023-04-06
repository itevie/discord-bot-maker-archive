const axios = require("axios");
const current = require("./package.json").version;

// Fetch GitHub's current package.json
(global.dbm?.log || console.log)("Checking for updates", "update-manager");
axios.get("https://raw.githubusercontent.com/itevie/discord-bot-maker/main/package.json").then(res => {
    try {
        // Parse it
        let data = res.data;
        if (typeof data != "object") data = JSON.parse(data);

        // Get the version
        let githubVersion = data.version;

        // Check if they are differnt
        if (githubVersion != current) {
            (global.dbm?.log || console.log)("Version mismatch, current is " + current + " but latest is " + githubVersion, "update-manager");

            // Compare the 2
            let currentParts = current.split(".").map(a => parseInt(a));
            let githubParts = githubVersion.split(".").map(a => parseInt(a));

            let isFullRelease = githubParts[0] > currentParts[0];
            let isMajorRelease = githubParts[1] > currentParts[1];
            let isMinorRelease = githubParts[2] > currentParts[2];

            if (isFullRelease) alertNewUpdate("full", githubVersion);
            else if (isMajorRelease) alertNewUpdate("major", githubVersion);
            else if (isMinorRelease) alertNewUpdate("minor", githubVersion);
            else (global.dbm?.log || console.log)("Appears current version is newer than GitHub version", "update-manager")
        } else {
            (global.dbm?.log || console.log)("Current version is up to date!", "update-manager");
        }
    } catch (err) {
        (global.dbm?.log || console.log)("Failed to parse update response: " + err, "error:update-manager");
    };
}).catch(err => {
    (global.dbm?.log || console.log)("Failed to check for updates: " + err.toString(), "error:update-manager");
});

function alertNewUpdate(type, newVersion) {
    (global.dbm?.log || console.log)("New update avaiable: " + type + " release: " + current + " => " + newVersion, "update-manager");
    setTimeout(() => {
        global.dbm.window?.notification("New " + type + " update!", "info", current + " -> " + newVersion + "<br>Click <a onclick=\"window.electron.openExternalLink('https://github.com/itevie/discord-bot-maker')\">here</a> to download!");
    }, 5000);
}