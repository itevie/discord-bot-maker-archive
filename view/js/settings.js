function updateSetting(id, checked) {
    let res = window.electron.updateSetting({
        key: id,
        to: checked
    });
    if (res == true) {
        reloadAllData();
    }
}

function reloadSettings() {
    appSettings = window.electron.fetchSettings();

    document.getElementById("appSettings-version").innerHTML = "Version: v" + appSettings.version;

    if (appSettings.showInformationalAlerts) {
        document.getElementById("appSettings-showInformation").checked = true;
    } else document.getElementById("appSettings-showInformation").checked = false;

    if (appSettings.showNotifications) {
        document.getElementById("appSettings-showNotification").checked = true;
    } else document.getElementById("appSettings-showNotification").checked = false;
}