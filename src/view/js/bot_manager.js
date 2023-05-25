document.addEventListener('DOMContentLoaded', () => {
  window.ipcApi.registerEventListener('updateBotLists', () => {
    console.log('Updating bot lists...');
    botManager.updateElements();
  });
});

const botManager = {
  /**
   * Initiates the bot creation modal
   */
  initiateBotCreation: () => {
    if (windowManager.checkExistsByInternal('bot-creator') === false) {
      const win = windowManager.createWindow('Bot Creator', {
        internal: 'bot-creator',
        modal: true,
        loadfrom: 'bot_creation',
      });
    }
  },

  /**
   * Updates all elements that depend on bot things e.g. whether or not it has started
   */
  updateElements: () => {
    // Fetch the started bots
    const started = window.ipcApi.fetchStartedList();

    /*
      MANAGE THE START / STOP ELEMENTS
    */

    const isStarted = document.querySelectorAll('[data-visibleWhenBotStarted]');
    const isStopped = document.querySelectorAll(
      '[data-visibleWhenBotNotStarted]'
    );

    // Hide all started, show all hidden
    isStarted.forEach(el => (el.style.display = 'none'));
    isStopped.forEach(
      el => (el.style.display = el.getAttribute('data-disp-type') || 'block')
    );

    // Loop through started bots
    for (const botName of started) {
      document
        .querySelectorAll(`[data-visibleWhenBotStarted="${botName}"]`)
        .forEach(el => {
          el.style.display = el.getAttribute('data-disp-type') || 'block';
        });

      document
        .querySelectorAll(`[data-visibleWhenBotNotStarted="${botName}"]`)
        .forEach(el => {
          el.style.display = 'none';
        });
    }
  },

  /**
   * Starts a bot
   * @param {string} botName The bot name
   */
  startBot: botName => {
    window.ipcApi.startBot(botName);
  },

  /**
   * Stops a bot
   * @param {string} botName The bot name
   */
  stopBot: botName => {
    window.ipcApi.stopBot(botName);
  },

  /**
   * Open editor window
   * @param {string} botName The bot name
   */
  editBot: botName => {
    if (!windowManager.checkExistsByInternal(`bot-editors:${botName}`)) {
      windowManager.createWindow(`Edit Bot: ${botName}`, {
        loadfrom: 'bot_editor',
        htmlconfig: {
          bot_name: botName,
        },
        internal: `bot-editors:${botName}`,
      });

      botManager.updateElements();
    } else {
      windowManager.focusWindow(`bot-editors:${botName}`);
    }
  },

  /**
   * Reloads the bot manager window, such as the list
   * @param {string[]} botList The list of bots
   */
  reloadWindow: botList => {
    // Clear current bot list
    document.getElementById('bot_manager-bot_list').innerHTML = '';

    const botListTable = document.createElement('table');

    for (const i in botList) {
      const botComponent = document.createElement('tr');
      botComponent.innerHTML = htmlTemlates.botManagerBotListItem.replace(
        /%bot_name%/g,
        botList[i]
      );
      botListTable.appendChild(botComponent);
    }

    document.getElementById('bot_manager-bot_list').appendChild(botListTable);
  },

  /**
   * Reloads all bot lists
   */
  reloadLists: () => {
    const botList = window.ipcApi.fetchBotList();

    botManager.reloadWindow(botList);
    botManager.updateElements();
  },

  createBot: () => {
    const cancelled = reason => {
      document.getElementById('bot_creation-create_button').innerHTML =
        'Create!';
      document.getElementById('bot_creation-create_button').disabled = false;
      allowBotCreationWindowClosure = true;

      alerting.error(reason);
    };

    // Modify button
    document.getElementById('bot_creation-create_button').innerHTML =
      'Creating... <i class="fa fa-spinner fa-spin"></i>';
    document.getElementById('bot_creation-create_button').disabled = true;

    // Make it so the window can't be closed
    openWindows.get(
      windowManager.fetchWindow('bot-creator')
    ).denyclosing = true;

    // Fetch values
    const name = document.getElementById('bot_creation-bot_name').value;
    const token = document.getElementById('bot_creation-bot_token').value;

    // Validate values
    if (name.length === 0) return cancelled("Your bot's name cannot be empty");
    if (token.length === 0)
      return cancelled("Your bot's token cannot be empty");

    setTimeout(() => {
      // Create the bot
      const isCreated = window.ipcApi.createBot({
        name: name,
        token: token,
      });

      if (isCreated[0] === false) {
        return cancelled('Oops, ' + isCreated[1], 'Failed to create bot');
      } else {
        Swal.fire({
          title: 'Success!',
          text: 'Your Discord bot was created!',
          icon: 'success',
        }).then(() => {
          // Allow the window to be closed
          openWindows.get(
            windowManager.fetchWindow('bot-creator')
          ).denyclosing = false;

          // Close the window
          windowManager.fetchWindow('bot-creator').close();
          botManager.reloadLists();
        });
      }
    }, 300);
  },
};
