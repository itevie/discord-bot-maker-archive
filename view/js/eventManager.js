let eventList = {
    "messageCreate": "A Message Is Sent",
    "messageDelete": "A Message Is Deleted",
    "messageEdited": "A Message Is Edited",
    "error": "An Error Occurs"
}

let editingEvent = "";

let eventTemplate2 = `
<td><b style="color: %setup%">%name%</b></td><td><img src="image/icon/edit.png" onclick="setupEvent('%id%')" class="icon"</td>
`;

let eventTemplate = `
<div>
    <label class="noselect" onclick="setupEvent('%id%');setSelectedEvent('%name%')">%name%</label>
</div>
`

function setSelectedEvent(name) {
    let eventsElements = document.getElementById("eventList");
    for (let i = 0; i < eventsElements.children.length; i++) {
        let child = eventsElements.children[i].children[0];
        if (child.innerHTML == name) child.style["font-weight"] = "bold";
        else child.style["font-weight"] = 100;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    for (let i in eventList) {
        let n = eventTemplate
            .replace(/%id%/g, i)
            .replace(/%name%/g, eventList[i])
            .replace(/%setup%/g, "gray")
            .replace(/%btnsetup%/g, "Edit");

        document.getElementById("eventList").innerHTML += n;
    }
});

function setupEvent(id) {
    editing = null;
    current = [];
    editingDiv = "event-actionList";
    editingEvent = id;
    if (currentBotData.events[id]) current = currentBotData.events[id].actions;
    updateList(currentBotData.events[id]?.code);

    //document.getElementById("editEvent-type").innerHTML = id;
}

function createTheEvent() {
    let res = window.electron.createEvent({
        type: editingEvent,
        actions: current,
        code: (document.getElementById("event-actionList-codeEditor").value != undefined ? document.getElementById("event-actionList-codeEditor").value : (currentBotData.events[editingEvent].code || undefined))
    });
    
    if (res != true) showError("Failed to update event");
    else {
        reloadAllData();
    }
}