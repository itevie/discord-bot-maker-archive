let currentBotData = {};
let currentBotName = null;
let db = null;

function backup(name) {
    window.electron.backup(name);
}

function fetchBot() {
    let data = window.electron.getCurrentBot();
    currentBotData = data;
    currentBotName = data?.id;
    if (!currentBotName) {
        currentBotName = null;
        document.getElementById("botSidebarButtons").style.display = "none";
        document.getElementById("botManager-noBots-alert").style.display = "block";
        showDiv("changeBot");
    } else {
        document.getElementById("sideBar-botID").innerHTML = cropText(currentBotName, 10);
        /*tippy(document.getElementById("sideBar-botID"), {
            content: currentBotName,
            allowHTML: true,
            animation: "shift-away",
            interactive: true
        });*/
        document.getElementById("settings-prefix").value = currentBotData.prefix;
        document.getElementById("settings-token").value = currentBotData.token;

        reloadAllData();

        setInterval(() => {
            reloadAllData();
        }, 3000);
    }

    reloadAllData();

    let running = window.electron.fetchRunningList();
    for (let i in running) {
        if (running[i].id == currentBotName) {
            showStopButton();
        }
    }

    if (currentBotData.token == "") {
        Swal.fire({
            title: "Uh oh!",
            text: "It appears this bot has no token, for this bot to be able to start, you must go to settings and give it a token.",
            icon: "error"
        });
    }
}

function renameBot() {
    Swal.fire({
        title: "Rename " + currentBotName,
        text: "Rename yout bot",
        input: "text",
        inputValidator: (m) => {
            if (m.length < 1) return "Name is too short"
            return false;
        }
    }).then(res => {
        if (res.isConfirmed) {
            let val = res.value;
            window.electron.renameBot({
                id: currentBotName,
                name: val
            });
        }
    })
}

function importBot() {
    Swal.fire({
        title: "Bot Data",
        text: "Enter the bot's data (JSON)",
        input: "textarea",
        showCancelButton: true,
        inputValidator: (v) => {
            try {
                JSON.parse(v);
                return false;
            } catch (err) {
                return err.toString();
            }
        }
    }).then(res => {
        if (res.isConfirmed) {
            let resp = window.electron.createBotFromJSON(JSON.parse(res.value));
            if (resp == true) {
                notification("Bot imported!", "success");
                setTimeout(() => {
                    reloadTo("changeBot");
                }, 3000);
            } else if (resp != "0") {
                showError(resp);
            }
        }
    })
}

function saveBotSettings() {
    let prefix = document.getElementById("settings-prefix").value;
    let token = document.getElementById("settings-token").value;

    window.electron.updateBotSettings({
        prefix: prefix,
        token: token
    });
}


function reloadAllData() {
    currentBotData = window.electron.getCurrentBot();
    document.getElementById("details-name").innerHTML = currentBotData.id;
    if (currentBotData.profile?.pfp) document.getElementById("details-pfp").src = currentBotData.profile.pfp;
    else document.getElementById("details-pfp").src = "image/noPfp.png";

    loadCommands();

    let settings = window.electron.fetchSettings();
    document.getElementById("log-checkboxGeneralLog").checked = settings.generalLog;
    document.getElementById("log-checkboxBotEvents").checked = settings.botEvents;
    document.getElementById("log-checkboxBotDebug").checked = settings.botDebug;

    loadRunningList();
    reloadSettings();
    loadExternal();

    db = window.electron.fetchDatabase();
    if (db) {
        document.getElementById("database-list").innerHTML = "";
        for (let i in db) {
            document.getElementById("database-list").innerHTML += `<div class="strikethrough" onclick="deleteDBKey('${i}');"><b>${i}</b> = ${db[i]}</div><br>`;
        }
    }

    reloadResources();
}

function deleteDBKey(id) {
    let res = window.electron.deleteDBKey(id);
    reloadAllData();
}

function addDatabaseItem() {
    Swal.fire({
        title: "Name your item",
        text: "Give your new database item a name",
        input: "text",
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value.match(/^([a-zA-Z_0-9\-]{1,})$/)) {
                return "Your key name can only contain letters, numbers and _ -"
            }
        }
    }).then(result => {
        if (result.isConfirmed) {
            let keyName = result.value;
            Swal.fire({
                title: "The value",
                text: "Give your key " + keyName + " a value",
                input: "text",
                showCancelButton: true
            }).then(result2 => {
                if (result.isConfirmed) {
                    let res = window.electron.addDatabaseItem({
                        key: keyName,
                        value: result2.value
                    });
                    
                    if (res) {
                        showSuccess("Database item " + keyName + " created!");
                        reloadAllData();
                    } else {
                        showError(res);
                    }
                }
            });
        }
    })
}

function createBot() {
    window.electron.createBot({
        id: document.getElementById("botCreator-botInAppID").value,
        token: document.getElementById("botCreator-token").value
    });
}

function selectBot(id) {
    let success = window.electron.selectBot(id);
    if (success == true) {
        window.location.reload();
    } else {
        showError("Failed to switch: " + success);
    }
}

function startBot() {
    disableAll();
    window.electron.startBot(currentBotName);
    reloadAllData();
}

function startSpecific(id) {
    disableAll();
    window.electron.startBot(id);
    reloadAllData();
}

function stopBot() {
    disableAll();
    window.electron.stopBot(currentBotName);
    reloadAllData();
}

function stopSpecific(id) {
    disableAll();
    if (id.startsWith("ext:")) {
        alert(id)
        window.electron.stopBotExternal(id.replace("ext:", ""));
    }
    window.electron.stopBot(id);
    reloadAllData();
}

function restartBot() {
    disableAll();
    window.electron.stopBot(currentBotName);
    reloadAllData();
    setTimeout(() => {
        startSpecific(currentBotName);
    }, 200);
}

function restartSpecific(id) {
    disableAll();
    if (id.startsWith("ext:")) {
        window.electron.stopBotExternal(id.replace("ext:", ""));
    }
    else window.electron.stopBot(id);
    reloadAllData();
    setTimeout(() => {
        if (id.startsWith("ext:")) {
            window.electron.startOnExternalHost(id.replace("ext:", ""));
        }
        else startSpecific(id);
    }, 200);
}

function deleteBot(id) {
    Swal.fire({
        title: "Confirm",
        text: "Are you sure you want to delete the bot " + id + "?\nThis CANNOT be undone.",
        showCancelButton: true,
        confirmButtonText: 'Delete',
        icon: "question"
    }).then(res => {
        if (res.isConfirmed) {
            Swal.fire({
                title: "Question",
                text: "Do you want to create a backup for this bot?",
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonText: 'Create a backup',
                denyButtonText: `Do NOT create a backup`,
                icon: "question"
            }).then(res2 => {
                let createBackup = res2.isConfirmed;
                if (res2.isConfirmed || res2.isDenied) {
                    Swal.fire({
                        title: "Question",
                        text: "Final warning: are you 100% sure you want to delete this bot?",
                        confirmButtonText: 'Delete',
                        showCancelButton: true,
                        icon: "question"
                    }).then(res3 => {
                        if (res3.isConfirmed) {
                            window.electron.deleteBot({
                                id: id,
                                createBackup: createBackup
                            });
                        }
                    })
                }
            });
        }
    });
}

let botManagerBotListTemplate = `
<tr>
    <td>{{id}}</td>
    <td>
        <img src="image/icon/open.png" onclick="selectBot('{{id}}');" class="icon">
        <img src="image/icon/play.png" onclick="startSpecific('{{id}}');" class="icon">
        <img src="image/icon/globe.png" onclick="startExternal('{{id}}');" style="display: %showExt%" class="icon">
        <img src="image/icon/delete.png" onclick="deleteBot('{{id}}')" class="icon danger-icon">
        <!--<button onclick="selectBot('{{id}}');">Select</button>
        <button class="goodButton" onclick="startSpecific('{{id}}');">Start</button>
       
        <button class="dangerButton" onclick="deleteBot('{{id}}')">Delete</button>-->
    </td>
</tr>`

function loadBotList() {
    let data = window.electron.getBotList();
    document.getElementById("botManager-botList").innerHTML = "";

    let text = "<table>";

    for (let i in data) {
        text += botManagerBotListTemplate.replace(/\{\{\id}\}/g, data[i])
            .replace(/%showExt%/g, externalFetcherEnabled == true ? "inline-block" : "none");
    }

    text += "</table>";

    document.getElementById("botManager-botList").innerHTML = text;
}

window.electron.botStartedListener(() => {
    enableAll();
    document.getElementById("botQuickActions").innerHTML = "";
    showStopButton();
    reloadAllData();
});

function showStopButton() {
    document.getElementById("botQuickActions-startButton").classList.remove("goodButton");
    document.getElementById("botQuickActions-startButton").classList.add("dangerButton");
    document.getElementById("botQuickActions-startButton").innerHTML = "Stop bot";
    document.getElementById("botQuickActions-startButton").onclick = () => {
        stopBot()
    };
}

window.electron.botStoppedListener(() => {
    enableAll();
    document.getElementById("botQuickActions").innerHTML = "";
    document.getElementById("botQuickActions-startButton").classList.remove("dangetButton");
    document.getElementById("botQuickActions-startButton").classList.add("goodButton");
    document.getElementById("botQuickActions-startButton").innerHTML = "Start bot";
    document.getElementById("botQuickActions-startButton").onclick = () => {
        startBot()
    };
    reloadAllData();
})