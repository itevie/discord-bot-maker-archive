const botSettings = {
  /**
   * Show a settings window for a bot
   * @param {string} botName The bot name
   */
  showSettings: botName => {
    if (!windowManager.checkExistsByInternal(`bot-settings:${botName}`)) {
      // Get bot's already settings
      const settings = window.ipcApi.fetchBot(botName);

      windowManager.createWindow(`Bot settings: ${botName}`, {
        loadfrom: 'bot_settings',
        internal: `bot-settings:${botName}`,
        htmlconfig: {
          bot_name: botName,
          prefix: settings.prefix,
          token: settings.token,
          name: settings.name,
        },
      });

      botManager.updateElements();
    } else {
      windowManager.focusWindow(`bot-settings:${botName}`);
    }
  },
};
