let botSettingsWindows = {};
function editBotSettings(id) {
  if (!botSettingsWindows[id]) {
    let html = window.winManager.loadWindowContents('bot_settings', {
      bot_name: id
    });
    
    botSettingsWindows[id] = new WinBox("Settings: " + id, {
      ...window.winManager.defaults,
      html: html,
      onclose: function() {
        botSettingsWindows[id] = null;
      }
    });

    updateBotStartDependentElements();
  } else {
    setTimeout(() => {
      botSettingsWindows[id].focus(true);
      botSettingsWindows[id].restore();
    }, 10);
  }
}

