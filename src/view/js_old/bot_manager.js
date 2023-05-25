document.addEventListener("DOMContentLoaded", () => {
  window.electron.registerEventListener('updateBotLists', () => {
    console.log('Updating bot lists...');
    updateBotStartDependentElements();
  });
});

let botCreationWindow = null;
let allowBotCreationWindowClosure = true;

function initiateBotCreation() {
  if (botCreationWindow == null) {
    let data = window.winManager.loadWindowContents('bot_creation');

    botCreationWindow = new WinBox("Create A Bot", {
      ...window.winManager.defaults,
      html: data,
      onclose: (force) => {
        if (allowBotCreationWindowClosure == false && !force) return !allowBotCreationWindowClosure;
        botCreationWindow = null
        allowBotCreationWindowClosure = true;
      },
      modal: true
    });

    setTimeout(() => {
      botCreationWindow.focus(true);
    }, 10);
  }
}

function updateBotStartDependentElements() {
  // Get started bots
  let started = window.electron.fetchStartedList();
  console.log(started);

  let isStarted = document.querySelectorAll("[data-visibleWhenBotStarted]");
  let isStopped = document.querySelectorAll("[data-visibleWhenBotNotStarted]");

  // Hide all stop elements
  isStopped.forEach(el => {
    el.style.display = el.getAttribute("data-disp-type") || "block";
  });

  // Show all start elements
  isStarted.forEach(el => {
    el.style.display = "none";
  });

  // Placeholder
  for (let i in started) {
    document.querySelectorAll(`[data-visibleWhenBotStarted="${started[i]}"]`).forEach(el => {
      el.style.display = el.getAttribute("data-disp-type") || "block";
    });

    document.querySelectorAll(`[data-visibleWhenBotNotStarted="${started[i]}"]`).forEach(el => {
      el.style.display = "none";
    });
  }
}

function startBot(name) {
  window.electron.startBot(name);
}

function stopBot(name) {
  window.electron.stopBot(name);
}

let editBotWindows = {};
function editBot(id) {
  if (!editBotWindows[id]) {
    let html = window.winManager.loadWindowContents('bot_editor', {
      bot_name: id
    });
    
    editBotWindows[id] = new WinBox("Edit Bot: " + id, {
      ...window.winManager.defaults,
      html: html,
      onclose: function() {
        editBotWindows[id] = null;
      }
    });

    updateBotStartDependentElements();
  } else {
    setTimeout(() => {
      editBotWindows[id].focus(true);
      editBotWindows[id].restore();
    }, 10);
  }
}

function createBot() {
  let cancelled = (reason) => {
    document.getElementById("bot_creation-create_button")
      .innerHTML = `Create!`;
    document.getElementById("bot_creation-create_button").disabled = false;
    allowBotCreationWindowClosure = true;

    error(reason);
  }

  // Modify button
  document.getElementById("bot_creation-create_button")
    .innerHTML = `Creating... <i class="fa fa-spinner fa-spin"></i>`;
  document.getElementById("bot_creation-create_button").disabled = true;
  allowBotCreationWindowClosure = false;

  // Validate values
  let name = document.getElementById("bot_creation-bot_name").value;
  let token = document.getElementById("bot_creation-bot_token").value;

  if (name.length == 0) return cancelled("Your bot's name cannot be empty");
  if (token.length == 0) return cancelled("Your bot's token cannot be empty");

  setTimeout(() => {
    let isCreated = window.electron.createBot({
      name: name,
      token: token
    });

    if (isCreated[0] == false) {
      return cancelled("Oops, " + isCreated[1], "Failed to create bot");
    } else {
      Swal.fire({
        title: "Success!",
        text: "Your Discord bot was created!",
        icon: "success"
      }).then(() => {
        botCreationWindow.hide();
        botCreationWindow = null;
        reloadBotList();
      });
    }
  }, 300);
}