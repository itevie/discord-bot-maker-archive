window.electron.setMsgListener((message, data) => {
    showInfo(message, data);
});

window.electron.setErrListener((message, data) => {
    showError(message, data);
});

window.electron.setSuccessListener((message, data) => {
    console.log(message, data);
    showSuccess(message, data);
});

window.electron.notification((message, data) => {
    notification(data.title, data.icon, data.desc);
});