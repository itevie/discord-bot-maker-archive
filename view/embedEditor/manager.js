document.addEventListener("DOMContentLoaded", () => {
    let c = window.electron.getCurrentEmbed();
    jsonObject = {
        content: "",
        embeds: c.data
    }

    let old = "";
    setInterval(() => {
        if (old != JSON.stringify(jsonObject)) {
            old = JSON.stringify(jsonObject);
            window.electron.updateEmbed({
                name: c.name,
                data: jsonObject.embeds || jsonObject.embed
            });
        }
    }, 1000);
})

document.addEventListener("keydown", (e) => {
    if (e.key == "Escape") window.electron.closeEmbed();
})