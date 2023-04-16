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
        reloadAllData();
    }
}

function deleteCommand(id) {
    if (!id && currentEditingCommand) id = currentEditingCommand;

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
            document.getElementById("commandEditor").style.display = "none";
        }
    });
}

function newCommand() {
    document.getElementById("commandEditor-editCode").disabled = true;
    document.getElementById("commandEditor-editCode").innerHTML = "Edit Code (Create the command to use this)"
    currentEditingCommand = null;
    resetNewCommandsDiv();
    current = [];
    editing = null;
    document.getElementById("commandEditor").style.display = "block";
}

function resetNewCommandsDiv(clicked) {
    document.getElementById("newCommand-commandName").value = "";
    document.getElementById("newCommand-comment").value = "";
    document.getElementById("newCommand-commandType-prefix").checked = true;
}

let commandItemTemplate2 = `
    <div class="contentDiv" style="display: inline-block">
        <b>%id%</b><br>
        <label>Action Count: %actionCount%</label>
        <br>
        <label>Type: %type%</label>
        <br>
        <div style="display: %showcomment%">
            <div class="inline-comment">
                <label>%comment%</label>
            </div>
        </div>
        <img src="image/icon/edit.png" onclick="editCommand('%id%')" class="icon">
        <img src="image/icon/delete.png" onclick="deleteCommand('%id%')" class="icon danger-icon">
    </div>
`;

let commandItemTemplate = `
    <div>
        <%lt% class="noselect" onclick="editCommand('%id%');loadCommands();">%id%</%lt%>
    </div>
`

function loadCommands() {
    if (currentBotData) {
        document.getElementById("commandList").innerHTML = "";
        for (let i in currentBotData.commands) {
            let t = commandItemTemplate
                .replace(/%id%/g, i)
                .replace(/%actionCount%/g, currentBotData.commands[i].actions.length)
                .replace(/%type%/g, currentBotData.commands[i].type || "Unknown");
            t = t.replace(/%lt%/g, currentEditingCommand == i ? "b" : "label");

            let comment = currentBotData.commands[i].comment;
            if (!comment || comment.trim() == "") t = t.replace(/%showcomment%/g, "none");
            else t.replace(/%showcomment%/g, "block");
            t = t.replace(/%comment%/g, comment);
            document.getElementById("commandList").innerHTML += t;
        }
    }
}