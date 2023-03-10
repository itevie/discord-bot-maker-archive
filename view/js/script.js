let currentDiv = null;
let appSettings = null;

let toast = null;

let divHistory = [null, null];

setInterval(() => {
    if (divHistory[divHistory.length - 2]) {
        document.getElementById("sidebar-back").innerHTML = divHistory[divHistory.length - 2] || "Back";
    } else {
        document.getElementById("sidebar-back").innerHTML = "<i>No History</i>";
    }
}, 100);

setInterval(() => {
    let data = window.electron.getProcessData();
    let processRam = document.getElementById("appSettngs-processRam");
    processRam.value = data.memory.process.heapUsed;
    processRam.max = data.memory.process.heapTotal;
    document.getElementById("appSettings-processRam-text").innerHTML = "(" + (processRam.value / 1e+6).toFixed(2) + "mb / " + (processRam.max / 1e+6).toFixed(2) + "mb)";
    let globalRam = document.getElementById("appSettngs-globalRam");
    globalRam.value = data.memory.total - data.memory.free;
    globalRam.max = data.memory.total;
    document.getElementById("appSettings-globalRam-text").innerHTML = "(" + (globalRam.value / 1e+6).toFixed(2) + "mb / " + (globalRam.max / 1e+6).toFixed(2) + "mb)";
}, 1000);

function prettify(string) {
    string = string.replace(/[_\-]/g, " ");
    let words = string.split(" ");

    for (let i in words) {
        let word = words[i].split("");
        if (!word[0]) continue;
        word[0] = word[0].toUpperCase();
        words[i] = word.join("");
    }

    return words.join(" ");
}

document.addEventListener("DOMContentLoaded", () => {
    let faqs = window.electron.fetchFaqList();
    let h = "";
    for (let i in faqs) {
        h += `<button onclick="showFAQ('${faqs[i]}')">${prettify(faqs[i])}</button>`;
    }
    document.getElementById("faqList").innerHTML = h;

    Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    /*let images = document.querySelectorAll("img");
    for (let i in images) {
        if (typeof images[i] != "object") continue;
        images[i].onclick = () => {
            document.getElementById("image-viewer-img").src = images[i].src;
            document.getElementById("image-viewer").style.display = "block";
        }
    }*/

    let dataDivChangers = document.querySelectorAll("[data-div-change]");
    let dataDivIDs = document.querySelectorAll("[data-div-id]");

    for (let i in dataDivChangers) {
        if (typeof dataDivChangers[i] != "object") continue;
        let change = dataDivChangers[i].getAttribute("data-div-change");

        let toRun = dataDivChangers[i].onclick;

        let x = () => {
            for (let e in dataDivIDs) {
                if (typeof dataDivIDs[e] != "object") continue;
                let id = dataDivIDs[e].getAttribute("data-div-id");

                if (change == id) {
                    setDivHistory(id);
                    dataDivIDs[e].style.display = "block";
                    dataDivIDs[e].classList.add("fadeIn");
                } else {
                    dataDivIDs[e].style.display = "none";
                    dataDivIDs[e].classList.remove("fadeIn");
                }
            }

            currentDiv = change;

            if (toRun) toRun();
        }

        dataDivChangers[i].onclick = x;
    }

    let enters = document.querySelectorAll("[data-enter-send]");
    let recievers = document.querySelectorAll("[data-enter-recieve]");
    for (let i in enters) {
        if (typeof enters[i] != "object") continue;
        enters[i].onkeyup = (e) => {
            if (e.key == "Enter") {
                for (let i in recievers) {
                    if (typeof enters[i] != "object") continue;
                    if (recievers[i].getAttribute("data-enter-recieve") == enters[i].getAttribute("data-enter-send")) {
                        recievers[i].click();
                    }
                }
            }
        }
    }

    let tooltips = document.querySelectorAll("[data-tooltip]");

    for (let i in tooltips) {
        if (typeof dataDivChangers[i] != "object") continue;
        tippy(tooltips[i], {
            content: tooltipText(tooltips[i].getAttribute("data-tooltip")),
            allowHTML: true,
            animation: "shift-away",
            interactive: true
        });
    }

    reloadSettings();

    showDiv("home");
    fetchBot();
    loadBotList();

    if (localStorage.getItem("reloadTo")) {
        showDiv(localStorage.getItem("reloadTo"));
        localStorage.removeItem("reloadTo");
    }
});

function showDiv(id) {
    let dataDivIDs = document.querySelectorAll("[data-div-id]");
    for (let i in dataDivIDs) {
        if (typeof dataDivIDs[i] != "object") continue;
        let did = dataDivIDs[i].getAttribute("data-div-id");

        if (id == did) {
            setDivHistory(did);
            dataDivIDs[i].style.display = "block";
            dataDivIDs[e].classList.add("fadeIn");
        } else {
            dataDivIDs.style.display = "none";
            dataDivIDs[e].classList.remove("fadeIn");
        }
    }

    currentDiv = id;
}

function setDivHistory(id) {
    divHistory[0] = divHistory[1];
    divHistory[1] = id;
}

function sidebarBack() {
    if (divHistory[0]) {
        if (divHistory[0] && divHistory[0].startsWith("FAQ:")) {
            showFAQ(divHistory[0].replace("FAQ:", ""));
        }
        else {
            showDiv(divHistory[0]);
            setDivHistory(divHistory[0]);
        }
    }
}

function tooltipText(text) {
    let faqs = text.match(/%faq:[a-zA-Z_]+%/g);
    for (let i in faqs) {
        let faq = faqs[i].split(":")[1].replace("%", "");
        text = text.replace(faqs[i], `<button onclick="showFAQ('${faq}')">Here</button>`);
    }

    return text;
}

function showFAQ(faq) {
    let data = window.electron.getFAQ(faq);
    document.getElementById("faqViewer").innerHTML = data;
    showDiv("faqViewer");
    setDivHistory("FAQ:" + faq);
}

function showDiv(sid) {
    let dataDivIDs = document.querySelectorAll("[data-div-id]");

    for (let e in dataDivIDs) {
        if (typeof dataDivIDs[e] != "object") continue;
        let id = dataDivIDs[e].getAttribute("data-div-id");

        if (sid == id) dataDivIDs[e].style.display = "block";
        else dataDivIDs[e].style.display = "none";
    }
}

function validate(el, regex) {
    let text = el.value;
    if (!text.match(regex)) {
        el.style["border-color"] = "red";
        return false;
    } else {
        el.style["border-color"] = "green";
        return true;
    }
}

function showInfo(text, data = {}) {
    if (appSettings.showInformationalAlerts || data.force) {
        swal.fire("Info", text, "info");
    }

    if (data.reload) data.reload = -1;
    handleAlertData(data);
}

function showError(text, data = {}) {
    swal.fire("Error", text, "error");
    handleAlertData(data);
}

function showSuccess(text, data = {}) {
    if (appSettings.showInformationalAlerts || data.force) {
        swal.fire("Success", text, "success");
    }

    if (data.reload) data.reload = -1;
    handleAlertData(data);
}

window.showSuccess = showSuccess;

function handleAlertData(data = {}) {
    if (data.reload == -1) {
        window.location.reload();
    } else if (data.reload == true) {
        setTimeout(() => {
            swal.close();
            setTimeout(() => {
                window.location.reload()
            }, 100);
        }, 100);
    } else if (data.reload) {
        setTimeout(() => {
            swal.close()
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }, data.reload - 100 || 0)
    }
}

let runningBotList = `
    <div class="contentDiv">
        <table>
            <tr>
                <td>%pfp%</td>
                <td style="font-size: 20px;">%id%</td>
            </tr>
        </table>
        <p>Uptime: %uptime%</p>
        <i style="display: %pendingRestart%; color: yellow;">Pending restart</i>
        <img onclick="stopSpecific('%id%')" src="image/icon/close.png" class="icon danger-icon">
        <img onclick="restartSpecific('%id%')" src="image/icon/restart.png" class="icon">
        <!--<button onclick="stopSpecific('%id%')" class="dangerButton">Stop</button>
        <button onclick="restartSpecific('%id%')">Restart</button>-->
    </div>
`;

function loadRunningList() {
    let running = window.electron.fetchRunningList();
    document.getElementById("runningBots").innerHTML = "";
    for (let i in running) {
        document.getElementById("runningBots").innerHTML += runningBotList.replace(/%id%/g, running[i].id)
            .replace(/%uptime%/g, running[i].uptime)
            .replace(/%pendingRestart%/g, running[i].pendingRestart == true ? "block" : "none")
            .replace(/%pfp%/g, `<img class="pfp" src="${running[i].profile?.pfp || "image/noPfp.png"}">`);
    }
}

function reloadTo(divID) {
    localStorage.setItem("reloadTo", divID);
    location.reload();
}

function disableAll() {
    let buttons = document.getElementsByTagName("button");
    let imgs = document.getElementsByName("img");
    for (const button of buttons) {
        if (button.hasAttribute("data-onsidebar") || button.hasAttribute("data-nodisable")) continue;
        button.disabled = true;
    }

    for (const button of buttons) {
        if (button.hasAttribute("data-onsidebar") || button.hasAttribute("data-nodisable")) continue;
        button.disabled = true;
    }
}

function enableAll() {
    let buttons = document.getElementsByTagName("button");
    let imgs = document.getElementsByName("img");
    for (const button of buttons) {
        if (button.hasAttribute("data-onsidebar")) continue;
        button.disabled = false;
    }

    for (const img of imgs) {
        if (img.hasAttribute("data-onsidebar") || img.hasAttribute("data-nodisable")) continue;
        img.disabled = true;
    }
}

function notification(title, icon = "info", desc = "") {
    if (appSettings.showNotifications) {
        Toast.fire({
            icon: icon,
            title: title,
            text: desc
        });
    }
}

function cropText(s, len) {
    if (s.length - 3 > len) {
        s = s.substring(0, s.length - (s.length - len));
        showDiv += "...";
    }

    console.log(s)

    return s;
} 