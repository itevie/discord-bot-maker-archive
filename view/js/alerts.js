// This file contains lots of functions for showing alerts to the user

// Show info
function showInfo(text, data = {}) {
    if (appSettings.showInformationalAlerts || data.force) {
        swal.fire("Info", text, "info");
    }

    if (data.reload) data.reload = -1;
    handleAlertData(data);
}

// Sgow error
function showError(text, data = {}) {
    swal.fire("Error", text, "error");
    handleAlertData(data);
}

// Show success
function showSuccess(text, data = {}) {
    if (appSettings.showInformationalAlerts || data.force) {
        swal.fire("Success", text, "success");
    }

    if (data.reload) data.reload = -1;
    handleAlertData(data);
}

window.showSuccess = showSuccess;

// Handle the alert data
function handleAlertData(data = {}) {
    if (data.reload == -1) { // Check if it is an instant reload
        window.location.reload();
    } else if (data.reload == true) {
        setTimeout(() => {
            swal.close();
            setTimeout(() => {
                window.location.reload()
            }, 100);
        }, 100);
    } else if (data.reload) {
        setTimeout(() => {
            swal.close()
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }, data.reload - 100 || 0)
    }
}

// Function to send a notification
function notification(title, icon = "info", desc = "") {
    if (appSettings.showNotifications) {
        Toast.fire({
            icon: icon,
            title: title,
            html: desc
        });
    }
}