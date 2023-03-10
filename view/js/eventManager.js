let eventList = {
    "messageCreate": "A Message Is Sent",
    "messageDelete": "A Message Is Deleted",
    "messageEdited": "A Message Is Edited",
    "error": "An Error Occurs"
}

let editingEvent = "";

let eventTemplate = `
<td><b style="color: %setup%">%name%</b></td><td><img src="image/icon/edit.png" onclick="setupEvent('%id%')" class="icon"</td>
`;

document.addEventListener("DOMContentLoaded", () => {
    for (let i in eventList) {
        let div = document.createElement("tr");
        let n = eventTemplate
            .replace(/%id%/g, i)
            .replace(/%name%/g, eventList[i])
            .replace(/%setup%/g, "gray")
            .replace(/%btnsetup%/g, "Edit");

        div.innerHTML = n;
        document.getElementById("eventList").appendChild(div);
    }
});

function setupEvent(id) {
    editing = null;
    current = [];
    editingDiv = "event-actionList";
    editingEvent = id;
    if (currentBotData.events[id]) current = currentBotData.events[id].actions;
    updateList();

    document.getElementById("editEvent-type").innerHTML = id;

    showDiv("editEvent");
}

function createTheEvent() {
    let res = window.electron.createEvent({
        type: editingEvent,
        actions: current
    });
    
    if (res != true) showError("Failed to update event");
    else {
        showDiv("events");
        reloadAllData();
    }
}