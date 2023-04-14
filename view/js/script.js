let currentDiv = null;
let appSettings = null;

let toast = null; // Swal MIXIN for toasts

// Interval for updating the setting stuff
setInterval(() => {
    let data = window.electron.getProcessData();
    
    // Load the process ram
    let processRam = document.getElementById("appSettngs-processRam");
    processRam.value = data.memory.process.heapUsed;
    processRam.max = data.memory.process.heapTotal;
    document.getElementById("appSettings-processRam-text").innerHTML = "(" + (processRam.value / 1e+6).toFixed(2) + "mb / " + (processRam.max / 1e+6).toFixed(2) + "mb)";
    
    // Load the global ram
    let globalRam = document.getElementById("appSettngs-globalRam");
    globalRam.value = data.memory.total - data.memory.free;
    globalRam.max = data.memory.total;
    document.getElementById("appSettings-globalRam-text").innerHTML = "(" + (globalRam.value / 1e+6).toFixed(2) + "mb / " + (globalRam.max / 1e+6).toFixed(2) + "mb)";
}, 1000);

document.addEventListener("DOMContentLoaded", () => {
    // Load if it should be action code mode
    document.getElementById("appSettings-useActionCode").checked = localStorage.getItem("useActionCode") != undefined ? (localStorage.getItem("useActionCode") == "true" ? true : false) : false;    
    actionCodeMode = localStorage.getItem("useActionCode") != undefined ? (localStorage.getItem("useActionCode") == "true" ? true : false) : false;

    // Load all the FAQs
    let faqs = window.electron.fetchFaqList();
    let h = "";
    for (let i in faqs) {
        h += `<button onclick="showFAQ('${faqs[i]}')">${prettify(faqs[i])}</button>`;
    }
    document.getElementById("faqList").innerHTML = h;

    // Load the swal mixin toast
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

    reloadSettings();

    // Load stuff
    showDiv("home");
    fetchBot();
    loadBotList();

    // Check if there is a reloadto in the localstorage, if so, navigate to it
    if (localStorage.getItem("reloadTo")) {
        showDiv(localStorage.getItem("reloadTo"));
        localStorage.removeItem("reloadTo");
    }
});

// Function to show a div
function showDiv(sid) {
    let dataDivIDs = document.querySelectorAll("[data-div-id]");
    let shown = false;
    for (let e in dataDivIDs) {
        if (typeof dataDivIDs[e] != "object") continue;
        let id = dataDivIDs[e].getAttribute("data-div-id");

        if (sid == id) {
            currentDiv = id;
            dataDivIDs[e].style.display = "block";
            shown = true;
        }
        else dataDivIDs[e].style.display = "none";
    }

    if (shown == false) {
        Swal.fire("Oops", "Looks like this feature has not been implemented yet", "information");
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

function loadRunningList(botList, divId) {
    let running = botList || window.electron.fetchRunningList();
    document.getElementById(divId || "runningBots").innerHTML = "";
    for (let i in running) {
        document.getElementById(divId || "runningBots").innerHTML += runningBotList.replace(/%id%/g, (botList ? "ext:" : "") + running[i].id)
            .replace(/%uptime%/g, running[i].uptime)
            .replace(/%pendingRestart%/g, running[i].pendingRestart == true ? "block" : "none")
            .replace(/%pfp%/g, `<img class="pfp" src="${running[i].profile?.pfp || "image/noPfp.png"}">`);
    }
}