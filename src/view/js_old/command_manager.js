function commandInit(forBot) {
  window.winManager.loadStatic("init_command", {
    title: `Create a command for ${forBot}`,
    denyReisize: true,
    width: 500,
    height: 300,
    hideMaximize: true,
    duplicates: true,
    htmlConfig: {
      bot_name: forBot,
      icid: Math.floor(Math.random() * 10000).toString()
    }
  });
}

function finishInitCommand(botName, icid) {
  let base = `init_command-${botName}-${icid}-`;
  let internalName = document.getElementById(base + "internal_name").value;
  let commandName = document.getElementById(base + "command_name").value;

  if (internalName.length == 0) return error(`The command's name cannot be empty!`);
  if (commandName.length == 0) return error(`The text that runs the command cannot be empty!`);
}