let oldEmbedList = "";

function reloadResources() {
    let embeds = window.electron.getAllEmbeds();
    if (oldEmbedList == JSON.stringify(embeds)) return;
    oldEmbedList = JSON.stringify(embeds);

    document.getElementById("embedList").innerHTML = "";
    
    for (let i in embeds) {
        let embedId = "resource-embed-" + (Math.random() + "").replace(".", "");

        let btn = document.createElement("button");
        btn.id = embedId;
        btn.onclick = () => window.electron.showEmbed(i);
        btn.innerHTML = i;

        document.getElementById("embedList").appendChild(btn);

        btn.oncontextmenu = () => {
            Swal.fire({
                title: "Confirm",
                text: "Are you sure you want to delete the embed " + i + "?",
                showCancelButton: true,
                icon: "question"
            }).then(res => {
                if (res.isConfirmed) {
                    window.electron.deleteEmbed(i);
                }
            });
        }
    }
}

function newEmbed() {
    Swal.fire({
        title: "Name your new embed",
        text: "Give your new embed a name, this will be used to use this embed in your commands",
        input: "text",
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value.match(/^([a-zA-Z_0-9\-]{1,})$/)) {
                return "Your embed name can only contain letters, numbers and _ -"
            }
        }
    }).then(result => {
        if (result.isConfirmed) {
            window.electron.showEmbed(result.value);
        }
    });
}