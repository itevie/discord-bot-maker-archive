const {
    contextBridge,
    ipcRenderer
} = require('electron');

let rendererEvents = {
    message: null,
    error: null,
    success: null
}

contextBridge.exposeInMainWorld('electron', {
    getCurrentBot: () => ipcRenderer.sendSync('get-current-bot', null),
    getBotList: () => ipcRenderer.sendSync('get-bot-list', null),
    selectBot: (id) => ipcRenderer.sendSync('selectBot', id),
    deleteBot: (data) => ipcRenderer.send("deleteBot", data),
    createBot: (data) => ipcRenderer.send("createBot", data),
    createBotFromJSON: (data) => ipcRenderer.sendSync("createBotFromJSON", data),
    startBot: (data) => ipcRenderer.send("startBot", data),
    stopBot: (data) => ipcRenderer.send("stopBot", data),
    startOnExternalHost: id => ipcRenderer.send("startOnExternalHost", id),
    loadExternal: () => ipcRenderer.sendSync("loadExternal", null),
    stopBotExternal: (id) => ipcRenderer.send("stopBotExternal", id),

    createCommand: (data) => ipcRenderer.sendSync("createCommand", data),
    deleteCommand: (id) => ipcRenderer.sendSync("deleteCommand", id),

    createEvent: (data) => ipcRenderer.sendSync("createEvent", data),

    updateSetting: (data) => ipcRenderer.sendSync("updateSetting", data),
    updateBotSettings: (data) => ipcRenderer.send("updateBotSettings", data),
    fetchSettings: () => ipcRenderer.sendSync("fetchSettings", null),
    showAbout: () => ipcRenderer.send("showAbout", null),
    showEmbed: (name) => ipcRenderer.send("showEmbed", name),
    deleteEmbed: (name) => ipcRenderer.send("deleteEmbed", name),
    getAllEmbeds: () => ipcRenderer.sendSync("getAllEmbeds", null),
    backup: (name) => ipcRenderer.send("backup", name),
    createLogFile: () => ipcRenderer.send("createLogFile", null),
    
    fetchLangs: () => ipcRenderer.sendSync("fetchLangs", null),

    getFAQ: (id) => ipcRenderer.sendSync("getFAQ", id),
    getActionList: (id) => ipcRenderer.sendSync("get-action-list"),
    openExternalLink: (url) => ipcRenderer.send("openExternalLink", url),
    clearLog: () => ipcRenderer.send("clearLog", null),
    restartApp: () => ipcRenderer.send("restartApp", null),
    renameBot: (data) => ipcRenderer.send("renameBot", data),
    getConfig: () => ipcRenderer.sendSync("getConfig", null),
    setExternal: (url) => ipcRenderer.sendSync("setExternal", url),
    deleteExternal: () => ipcRenderer.send("deleteExternal", null),

    fetchFaqList: () => ipcRenderer.sendSync("fetchFaqList", null),
    getProcessData: () => ipcRenderer.sendSync("getProcessData", null),
    fetchWebActions: () => ipcRenderer.sendSync("fetchWebActions", null),
    
    fetchDatabase: () => ipcRenderer.sendSync("fetchDatabase", null),
    addDatabaseItem: data => ipcRenderer.sendSync("addDatabaseItem", data),
    deleteDBKey: id => ipcRenderer.sendSync("deleteDBKey", id),

    setMsgListener: (callback) => {
        rendererEvents.message = callback;
    },
    setErrListener: (callback) => {
        rendererEvents.error = callback;
    },
    setSuccessListener: (callback) => {
        rendererEvents.success = callback;
    },
    botStartedListener: (callback) => {
        ipcRenderer.on("botStarted", callback);
    },
    botStoppedListener: (callback) => {
        ipcRenderer.on("botStopped", callback);
    },
    notification: (callback) => {
        ipcRenderer.on("notification", callback);
    },
    fetchRunningList: () => ipcRenderer.sendSync("runningBotList")
});

let logMessageTemplate = `<label style="color: %color%">%type% @ %time% %loader%</label><br>&nbsp;&nbsp;%msg%<br>`

ipcRenderer.on("log", (event, message) => {
    addLogItem(message);
});

ipcRenderer.on("info", (event, message) => {
    if (message.type == "botCreator") {
        document.getElementById("botCreator-info").style.color = "white";
        document.getElementById("botCreator-info").innerHTML = message.msg;
    } else if (message.type == "startBot") {
        document.getElementById("botQuickActions").innerHTML = message.msg;
    }
});

ipcRenderer.on("error", (event, message) => {
    if (message.type == "botCreator") {
        document.getElementById("botCreator-info").innerHTML = message.msg;
        document.getElementById("botCreator-info").style.color = "red";
    } else if (message.type == "alert") {
        rendererEvents.error(message.msg);
    }
});

ipcRenderer.on("botCreated", (event, message) => {
    document.getElementById("botCreator-info").innerHTML = "Bot created!";
    document.getElementById("botCreator-info").style.color = "green";
    console.log(rendererEvents);
    rendererEvents.success("The bot was successfully created!", {
        reload: 1000
    });
});

ipcRenderer.on("message", (event, message) => {
    rendererEvents.message(message.msg, {
        reload: message.reload == true ? 500 : null
    });
});

ipcRenderer.on("success", (event, message) => {
    rendererEvents.success(message.msg, message);
});


function addLogItem(message) {
    if (!message.type) message.type = "info";
    let settings = ipcRenderer.sendSync("fetchSettings", null);

    let valid = false;

    if (message.type.startsWith("bot:") == true && settings.botDebug == true) valid = true;
    else if (message.type.startsWith("event:") == true && settings.botEvents == true) valid = true;
    else if (settings.generalLog == true || message.type.startsWith("error:")) valid = true;

    if (valid == false) return;
    
    let c = 0;
    if (message.type.startsWith("bot:")) c = "#00FF00";
    else if (message.type.startsWith("event:")) c = "#FFFF00";
    else if (message.type.startsWith("error:") || message.type == "error") c = "#FF4444";
    else c = "lightblue";

    let t = logMessageTemplate.replace(/%color%/g, c).replace(/%type%/g, message.type).replace(/%time%/g, new Date().toLocaleString()).replace(/%msg%/g, message.msg);
    document.getElementById("actionLog").innerHTML += t.replace(/%loader%/g, "");
    document.getElementById("actionLog").scrollTop = document.getElementById("actionLog").scrollHeight;

    document.getElementById("footerInfo").innerHTML = t.replace(/%loader%/g, message.showLoader ? `<label class="loader"></label>` : "");
}

document.addEventListener("DOMContentLoaded", () => {
    let log = ipcRenderer.sendSync("fetchLog", null);
    for (let i in log) {
        addLogItem(log[i]);
    }
});

ipcRenderer.on("detailUpdate", (event, data) => {
    if (data["startLimitTotal"]) {
        document.getElementById("details-startRateLimitTotal").innerHTML = data["startLimitTotal"]
        document.getElementById("details-startRateLimitRemaining").innerHTML = data["startLimitRemaining"]
    }
})