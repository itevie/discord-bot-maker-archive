let langs = window.electron.fetchLangs();
let cLang = "en";

document.addEventListener("DOMContentLoaded", () => {
    let lang = document.querySelectorAll("[data-lang]");
    for (let i in lang) {
        if (typeof lang[i] != "object") continue;
        let value = lang[i].getAttribute("data-lang");

        if (!langs[cLang][value]) {
            lang[i].innerHTML = value;
        } else {
            lang[i].innerHTML = langs[cLang][value];
        }
    }
});