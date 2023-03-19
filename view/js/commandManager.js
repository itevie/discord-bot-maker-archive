function createCommand() {
    if (current == null) return;

    let commandName = document.getElementById("newCommand-commandName").value;
    if (commandName.length == 0) {
        return showError("Please provide a command name larger than 1 character long");
    }

    let command = {
        type: document.querySelector('input[name="newCommand-commandType"]:checked').value.toLowerCase().replace(/ /g, "-") || "prefix",
        name: commandName,
        ignoreBots: document.getElementById("newCommand-ignoreBots").checked,
        actions: current,
        comment: document.getElementById("newCommand-comment").value,
        code: document.getElementById("newCommand-actionList-codeEditor")?.value || currentBotData.commands[commandName] || ""
    }

    let res = window.electron.createCommand(command);
    if (res == true) {
        showSuccess("Command created!");
        showDiv("botCommads");
        resetNewCommandsDiv();
        reloadAllData();
    }
}

function deleteCommand(id) {
    Swal.fire({
        title: "Confirm",
        html: "Are you sure you want to delete the command <b>" + id + "</b>, this cannot be undone",
        icon: "question",
        showCancelButton: true
    }).then(result => {
        if (result.isConfirmed) {
            let res = window.electron.deleteCommand(id);
            if (res == true) {
                showInfo("Command deleted!");
            }
            reloadAllData();
        }
    });
}

function newCommand() {
    resetNewCommandsDiv();
    current = [];
    editing = null;
    updateList();
    editingDiv = "newCommand-actionList";

    showDiv("newCommand");
}

function resetNewCommandsDiv() {
    document.getElementById("newCommand-commandName").value = "";
    document.getElementById("newCommand-comment").value = "";
    document.getElementById("newCommand-commandType-prefix").checked = true;
}