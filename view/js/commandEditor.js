let current = [];
let editing = null;
let actionList = window.electron.getActionList();
let editingDiv = null;
let actionCodeMode = true;
let currentEditingCommand = null;

document.addEventListener("DOMContentLoaded", () => {
    Array.from(document.getElementById("editAction-type").options).forEach(function (op) {
        if (!actionList.includes(op.value)) {
            op.disabled = true;
        }
    });
});

let actionTemplate = `
<div class="action" onmouseover="document.getElementById('action-button-%id%').style.display = 'block';" onmouseleave="document.getElementById('action-button-%id%').style.display = 'none';">
    <b>%indent%#%index%</b>&nbsp;<label>%type%</label>
    <div style="float: right; display: none;" id="action-button-%id%">
        <table>
            <tr>
                <td><img src="image/icon/up.png" onclick="moveActionUp(%id%)" class="icon"></td>
                <td><img src="image/icon/down.png" onclick="moveActionDown(%id%)" class="icon"></td>
                <td><img src="image/icon/edit.png" onclick="editAction(%id%)" class="icon"></td>
                <td><img src="image/icon/delete.png" onclick="deleteAction(%id%)" class="icon danger-icon"></td>
            </tr>
        </table>
    </div>
</div>
`;

function validateActionCode() {
    let res = parseActionCode();
    if (Array.isArray(res)) {
        if (res[0] == false) {
            document.getElementById(editingDiv + "-codeEditor-" + "info").innerHTML = "Error: at line " + res[1] + ": " + res[2];
            current = null;
            return
        }
    }

    for (let i in res) {
        if (actionArray.includes(res[i].type) == false && res[i].type) {
            document.getElementById(editingDiv + "-codeEditor-" + "info").innerHTML = "Error: The action " + res[i].type + " is not a recognised (did you mean " + closestMatch(res[i].type, actionArray) + "?) action (possibly at line " + (+i + 1) + ")";
            current = null;
            return; 
        }
    }
    current = res;
    document.getElementById(editingDiv + "-codeEditor-" + "info").innerHTML = ""
}

function updateList(code) {
    document.getElementById(editingDiv).innerHTML = "";
    if (!editingDiv) return;
    if (actionCodeMode) {
        let codeEditor = document.createElement("textarea");
        codeEditor.id = editingDiv + "-codeEditor"
        codeEditor.classList.add("codeEditor");
        if (code) codeEditor.value = code;
        let codeEditorInfo = document.createElement("p");
        codeEditorInfo.id = editingDiv + "-codeEditor-" + "info";
        codeEditorInfo.style.color = "red";
        document.getElementById(editingDiv).appendChild(codeEditorInfo);
        document.getElementById(editingDiv).appendChild(codeEditor);
        document.getElementById(editingDiv + "-addAnother").style.display = "none";

        codeEditor.onkeyup = () => {
            validateActionCode();
        }

        return;
    }

    document.getElementById(editingDiv + "-addAnother").style.display = "block";

    for (let i in current) {
        let div = document.createElement("div");
        div.setAttribute("data-newCommand-outerDivId", i);

        let type = current[i].type;
        let nType = null;

        let select = document.getElementById("editAction-type");
        for (let i in select.options) {
            if (select.options[i].value == type) {
                nType = select.options[i].innerHTML;
                if (!nType) return;
                if (nType.length > 25) {
                    nType = nType.substring(0, 25);
                    nType += "...";
                }
                break;
            }
        }

        let indent = "";

        if (current[i - 1]) {
            if (current[i -1].type.startsWith("conditional:one-action-")) {
                indent += "&nbsp;&nbsp;&nbsp;";
            }
        }

        div.innerHTML = actionTemplate.replace(/%id%/g, i)
            .replace(/%index%/g, parseInt(i) + 1)
            .replace(/%type%/g, nType || type)
            .replace(/%indent%/g, indent);

        document.getElementById(editingDiv).appendChild(div);
    }
}

function moveActionUp(id) {
    if (id == 0) return;

    let temp = current[id - 1];
    current[id - 1] = current[id];
    current[id] = temp;

    updateList();
}

function moveActionDown(id) {
    if (id == current.length - 1) return;

    let temp = current[id + 1];
    current[id + 1] = current[id];
    current[id] = temp;

    updateList();
}

function editCommand(id) {
    let command = currentBotData.commands[id];
    currentEditingCommand = id;

    document.getElementById("commandEditor-editCode").innerHTML = "Edit Code";
    document.getElementById("commandEditor-editCode").disabled = false;
    document.getElementById("commandEditor-editCode").onclick = () => window.electron.showEditor({
        type: "command",
        command: id
    });
    
    //editingDiv = "newCommand-actionList";
    document.getElementById("newCommand-commandName").value = id;
    document.getElementById("newCommand-comment").value = command.comment || "";
    //current = command.actions;
    //updateList(command.code);
    //showDiv("newCommand");
    document.getElementById("commandEditor").style.display = "block";
}

function updateEditActionSelection(data = {}) {
    let type = document.getElementById("editAction-type");
    let id = type.options[type.selectedIndex].getAttribute("data-action-id");
    let action = selectActions[id];
    document.getElementById("editAction-inputs").innerHTML = "";

    document.getElementById("editAction-details").innerHTML = action.description || "";

    for (let i in action.inputs) {
        let input = action.inputs[i];
        let div = document.createElement("div");
        let label = document.createElement("label");
        let inp = document.createElement(input.type == "select" ? "select" : "input");

        let type = input.type || "text";

        let tag = input.name;
        if (type != "checkbox") {
            if (tag.trim().endsWith(":") == false) tag = tag.trim() + ": ";
        }

        label.innerHTML = prettify(tag);

        if (type == "select") {
            for (let i in input.options) {
                let option = document.createElement("option");
                option.innerHTML = input.options[i];
                option.value = i;
                inp.options.add(option);
            }
        } else {
            inp.type = input.type || "text";
        }
        inp.id = "editAction-inputs-" + i;

        if (data != {} && data[i]) inp.value = data[i];

        if (type == "checkbox") {
            div.appendChild(inp);
            div.appendChild(label);
        } else {
            div.appendChild(label);
            div.appendChild(inp);
        }

        document.getElementById("editAction-inputs").appendChild(div);
    }
}

function addAnotherAction() {
    current.push({
        type: "none"
    });

    updateList();
    editAction(current.length - 1);
}

function deleteAction(id) {
    if (current[id]) {
        current.splice(id, 1);
    }

    updateList();
}

function saveAction() {
    let select = document.getElementById("editAction-type");
    let type = select.options[select.selectedIndex];
    let id = type.getAttribute("data-action-id");
    let action = selectActions[id];

    current[editing] = {
        type: type.value
    }

    for (let i in action.inputs) {
        let el = document.getElementById("editAction-inputs-" + i);
        let value = action.inputs[i].type == "select" ? el.options[el.selectedIndex].value : el.value;

        if (action.inputs[i].validator && !value.match(action.inputs[i].validator)) {
            return document.getElementById("editAction-input-error").innerHTML = prettify(action.inputs[i].name) + ": " + (action.inputs[i].validatorMessage || "Invalid inputs");
        } else if (action.inputs[i].allowEmpty == false && value.trim() == "") {
            return document.getElementById("editAction-input-error").innerHTML = prettify(action.inputs[i].name) + ": This field cannot be empty!"; 
        } 

        current[editing][i] = value;
    }

    document.getElementById("editAction-input-error").innerHTML = "";

    editing = null;

    document.getElementById("editAction").style.display = "none";

    updateList();
}

function editAction(id) {
    document.getElementById("editAction").style.display = "block";
    editing = id;

    let c = current[id];
    let select = document.getElementById("editAction-type");
    for (let i in select.options) {
        if (select.options[i].value == c.type) select.options[i].selected = true;
        else select.options[i].selected = false;
    }
    
    updateEditActionSelection(current[editing]);
}

function cancelActionCreation() {
    editing = null;
    document.getElementById("editAction").style.display = "none";
}