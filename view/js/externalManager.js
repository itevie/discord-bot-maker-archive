let externalFetcherEnabled = true;

function checkExternal() {
    return new Promise((resolve, reject) => {
        let ip = document.getElementById("external-url").value;
        let port = document.getElementById("external-port").value;
        let useHttps = document.getElementById("external-https").checked;

        let url = ip + ":" + port;
        let prefix = "http" + (useHttps ? "s" : "") + "://";

        let setInfo = text => document.getElementById("external-info").innerHTML = text;

        setInfo("Connecting to " + prefix + url + "/information");
        fetch(prefix + url + "/information").then(async res => {
            if (!res.ok) {
                showError("Failed to connect to external host (" + prefix + url + "):<br><br>" + res.statusText + "(" + res.status + ")");
                reject();
            } else {
                let data = await res.json();
                setInfo("Success! Server's version is: " + data.version);

                let config = window.electron.getConfig();
                if (config.version != data.version) {
                    setInfo("Failure: server's version is not the same as the app's version.");
                    showError("The server's version differs from the app's:<br><br>Server Version: " + data.version + "<br>App Version: " + config.version);
                    reject();
                }

                resolve(prefix + url);
            }
        }).catch(err => {
            showError("Failed to connect: " + err.toString());
            reject();
        });
    });
}

function saveExternal() {
    checkExternal().then((url) => {
        let a = window.electron.setExternal(url);
        document.getElementById("external-info").innerHTML = "Saved!";
        externalFetcherEnabled = true;
        loadExternal();
        loadBotList();
    });
}

function startExternal(id) {
    window.electron.startOnExternalHost(id.replace("ext:", ""));
}

function loadExternal() {
    if (!appSettings.external || !appSettings.external) {
        externalFetcherEnabled = false;
        document.getElementById("external-toggle-fetcher").innerHTML = "Start Trying To Connect";
        document.getElementById("sidebar-sync").style.display = "none";
        document.getElementById("external-delete").style.display = "none";
        return;
    } else {
        externalFetcherEnabled = true;
        document.getElementById("sidebar-sync").style.display = "block";
        document.getElementById("external-delete").style.display = "inline-block";
    }

    if (externalFetcherEnabled) {
        let data = window.electron.loadExternal();
        loadRunningList(data, "external-runningBots");

        if (Object.keys(data).length != 0) document.getElementById("changeBot-external-header").style.display = "block";
        else document.getElementById("changeBot-external-header").style.display = "none";
    }
}

function deleteExternal() {
    window.electron.deleteExternal();
    externalFetcherEnabled = false;
    loadExternal();
    loadBotList();
}

function toggleExternalFetcher() {
    externalFetcherEnabled = externalFetcherEnabled == true ? false : true;
    document.getElementById("external-toggle-fetcher").innerHTML = externalFetcherEnabled == true ? "Stop Trying To Connect" : "Start Trying To Connect";
}