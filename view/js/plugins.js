let pluginTemplate = `<h2>%name%</h2>
<p class="inline-comment">%description%</p><br>
Version: %version% By: %author%
<button style="float: right; display:%ui%" onclick="editPlugin('%id%')">Settings</button><br><br><hr>`

let plugins = window.electron.fetchPluginList();

document.addEventListener("DOMContentLoaded", () => {
    console.log(plugins)
    for (let i in plugins) {
        let pl = pluginTemplate.replace(/%name%/g, plugins[i].name)
            .replace(/%description%/g, plugins[i].description)
            .replace(/%author%/g, plugins[i].author)
            .replace(/%version%/g, plugins[i].version)
            .replace(/%id%/g, i)
            .replace(/%ui%/g, plugins[i].hasSettingsPanel == true ? "block" : "none");
        document.getElementById("pluginList").innerHTML += pl;
    }
});

async function editPlugin(id) {
    let data = await fetch(plugins[id].HTMLpath);
    let pluginHtml = await data.text();
    showDiv("pluginEditor");
    document.getElementById("pluginEditor").innerHTML = pluginHtml;
}