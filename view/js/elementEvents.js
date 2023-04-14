// This file has all the events for elements, such as buttons that change divs (sidebar)

document.addEventListener("DOMContentLoaded", () => {
    // Load buttons that change the current selected div
    let dataDivChangers = document.querySelectorAll("[data-div-change]");
    let dataDivIDs = document.querySelectorAll("[data-div-id]");

    for (let i in dataDivChangers) {
        if (typeof dataDivChangers[i] != "object") continue;
        let change = dataDivChangers[i].getAttribute("data-div-change");

        let toRun = dataDivChangers[i].onclick; // Preserve that buttons onclick

        let x = () => {
            let shown = false;

            for (let e in dataDivIDs) {
                if (typeof dataDivIDs[e] != "object") continue;
                let id = dataDivIDs[e].getAttribute("data-div-id");

                if (change == id) {
                    //setDivHistory(id);
                    dataDivIDs[e].style.display = "block";
                    dataDivIDs[e].classList.add("fadeIn");
                    shown = true;
                    currentDiv = id;
                } else {
                    dataDivIDs[e].style.display = "none";
                    dataDivIDs[e].classList.remove("fadeIn");
                }
            }

            if (shown == false) {
                Swal.fire("Oops", "Looks like this feature has not been implemented yet", "info");
            }

            if (toRun) toRun();
        }

        dataDivChangers[i].onclick = x;
    }

    // When enter is clicked, run a button, load all of them
    let enters = document.querySelectorAll("[data-enter-send]");
    let recievers = document.querySelectorAll("[data-enter-recieve]");

    for (let i in enters) {
        if (typeof enters[i] != "object") continue;
        enters[i].onkeyup = (e) => { // Register event
            if (e.key == "Enter") { // Check if it is enter
                for (let i in recievers) {
                    if (typeof enters[i] != "object") continue;
                    if (recievers[i].getAttribute("data-enter-recieve") == enters[i].getAttribute("data-enter-send")) {
                        recievers[i].click();
                    }
                }
            }
        }
    }

    // Load all tooltips
    let tooltips = document.querySelectorAll("[data-tooltip]");

    for (let i in tooltips) {
        if (typeof dataDivChangers[i] != "object") continue;
        tippy(tooltips[i], {
            content: tooltipText(tooltips[i].getAttribute("data-tooltip")),
            allowHTML: true,
            animation: "shift-away",
            interactive: true,
            delay: 500
        });
    }

    // Load tabs
    let tabbers = document.querySelectorAll("[data-tab-change]");
    let defaultTabs = [];

    for (let i in tabbers) {
        if (typeof tabbers[i] != "object") continue;
        let tabGroup = tabbers[i].getAttribute("data-tab-group");
        let tabs = document.querySelectorAll(`[data-tab-group="${tabGroup}"]`);

        if (tabbers[i].hasAttribute("data-tab-default"))
            defaultTabs.push(tabbers[i]);

        tabbers[i].onclick = () => {
            for (let t in tabs) {
                if (typeof tabs[t] != "object") continue;
                if (tabs[t].hasAttribute("data-tab-change")) continue;
                tabs[t].style.display = "none";
                if (tabs[t].getAttribute("data-tab-id") == tabbers[i].getAttribute("data-tab-change"))
                    tabs[t].style.display = "block";
            }
        }
    }

    // Click all default tabs
    for (let i in defaultTabs) {
        defaultTabs[i].onclick();
    }
});

function tooltipText(text) {
    let faqs = text.match(/%faq:[a-zA-Z_]+%/g);
    for (let i in faqs) {
        let faq = faqs[i].split(":")[1].replace("%", "");
        text = text.replace(faqs[i], `<button onclick="showFAQ('${faq}')">Here</button>`);
    }

    return text;
}