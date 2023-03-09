let eventList = {
    "messageCreate": "A Message Is Sent",
    "messageDelete": "A Message Is Deleted",
    "messageEdited": "A Message Is Edited"
}

let editingEvent = "";

let eventTemplate = `
<b style="color: %setup%">%name%</b><button onclick="setupEvent('%id%')">%btnsetup%</button>
`;

document.addEventListener("DOMContentLoaded", () => {
    for (let i in eventList) {
        let div = document.createElement("div");
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