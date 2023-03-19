// OLD ACTIONS NT ADDED YET
let a = {
    "c0": {
        name: " -- Select an action -- ",
        disable: true
    },
    "clear-reactions-author": {
        name: "Clear Author's Message's Reactions",
        needs: ["content"]
    },
    "add-reaction": {
        name: "Add Reaction To Message",
        needs: ["id", "content"]
    },
    "clear-reactions-message": {
        name: "Clear Message's Reactions",
        needs: ["id"]
    },
    "c2": {
        name: " --- Moderation --- ",
        disable: true
    },
    "kick-member": {
        name: "Kick Member",
        needs: ["id"]
    },
    "ban-member": {
        name: "Ban Member",
        needs: ["id"]
    },
    "c3": {
        name: " --- Logical --- ",
        disable: true
    },
    "stop-actions": {
        name: "Stop"
    },
    "stop-if-bot": {
        name: "Stop If Author Is Bot"
    },
    "c6": {
        name: " --- Bot Management --- ",
        disable: true
    },
    "set-prefix": {
        name: "Set Prefix",
        needs: ["content"]
    },
    "set-prefix-guild": {
        name: "Set Prefix Guild",
        needs: ["id"]
    },
}

let selectActions = {
    "c0": {
        name: " --- Select an action --- ",
        disable: true,
        selected: true
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let packages = window.electron.fetchWebActions();
    let editActionSelect = document.getElementById("editAction-type");

    // Loop through packages
    for (let package in packages) {
        if (package == "information") continue;

        // Loop through modules
        for (let module in packages[package]) {
            if (module == "information") continue;
            
            selectActions["c" + module] = {
                name: " --- " + prettify(module) + " --- ",
                disable: true
            }

            // Loop through actions
            for (let action in packages[package][module]) {
                selectActions[action] = packages[package][module][action];
                selectActions[action].fullName = package + ":" + module + ":" + action;
            }
        }
    }

    for (let i in selectActions) {
        // Create and setup the option menu
        let option = document.createElement("option");
        option.text = prettify(selectActions[i].name);
        option.value = selectActions[i].fullName;

        option.setAttribute("data-action-id", i);


        // If it needs to be disabled (like a category), do so
        if (selectActions[i].disable) {
            option.disabled = true;
            option.style["text-align"] = "center";
        }

        // If it should be auto selected (the very top categoric option)
        if (selectActions[i].selected) {
            option.selected = true;
        }

        // Add it
        editActionSelect.add(option);
    }
});

/*
// On load, load all the actions from ipc
document.addEventListener("DOMContentLoaded", () => {
    let webActions = window.electron.fetchWebActions(); // Load list
    let editActionSelect = document.getElementById("editAction-type");

    // Loop through all of them
    for (let m in webActions) {
        // Add the category name
        selectActions[m] = {
            name: " --- " + prettify(m) + " --- ",
            disable: true
        };

        // Add all the items to the category
        for (let i in webActions[m]) {
            selectActions[i] = webActions[m][i]
        }
    }

    // Loop through the new actions
    for (let i in selectActions) {
        // Create and setup the option menu
        let option = document.createElement("option");
        option.text = selectActions[i].name;
        option.value = i;

        option.setAttribute("data-action-id", i);


        // If it needs to be disabled (like a category), do so
        if (selectActions[i].disable) {
            option.disabled = true;
            option.style["text-align"] = "center";
        }

        // If it should be auto selected (the very top categoric option)
        if (selectActions[i].selected) {
            option.selected = true;
        }

        // Add it
        editActionSelect.add(option);
    }
});*/