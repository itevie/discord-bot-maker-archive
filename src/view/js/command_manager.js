const commandManager = {
  initNewCommand: forBot => {
    windowManager.createWindow(`Create a command for ${forBot}`, {
      denyresize: true,
      width: 500,
      height: 300,
      loadfrom: 'init_command',
      htmlconfig: {
        bot_name: forBot,
        icid: Math.floor(Math.random() * 10000).toString(),
      },
    });
  },

  /**
   * Initially creates the command
   * @param {*} botName The bot name
   * @param {*} icid The init command ID
   */
  createCommand: (botName, icid) => {
    // Get values
    const base = `init_command-${botName}-${icid}-`;
    const internalName = document.getElementById(base + 'internal_name').value;
    const commandName = document.getElementById(base + 'command_name').value;

    // Validate values
    if (internalName.length === 0)
      return alerting.error("The command's name cannot be empty!");
    if (commandName.length === 0)
      return alerting.error('The text that runs the command cannot be empty!');
  },
};
