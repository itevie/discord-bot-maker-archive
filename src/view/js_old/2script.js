let botManagerWindow = null;

document.addEventListener("DOMContentLoaded", () => {
  showBotManagerWindow();
  updateBotStartDependentElements();

  window.winManager.loadStatic('log', {
    denyClose: true,
  });
  staticWindows["log"].minimize();
});

function reloadBotList() {
  let botList = window.electron.fetchBotList();

  reloadBotManagerWindow(botList);
  updateBotStartDependentElements();
}

function showBotManagerWindow() {
  botManagerWindow = new WinBox("Bot Manager", {
    ...window.winManager.defaults,
    html: window.winManager.loadWindowContents("bot_manager"),
    class: ["no-close"],
    onclose: function() {
      this.minimize();
      return true;
    }
  });

  reloadBotList();
}

function showLoader(message) {
  document.getElementById("fullscreen-loader").style.display = "block";
  document.getElementById("fullscreen-loader-message").innerHTML = message;
}