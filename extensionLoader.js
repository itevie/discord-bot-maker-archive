const {
    app
} = require("electron");

const toml = require("toml");
const fs = require("fs");
const errorManager = require("./errorManager");
const api = require("./api.js");

let actions = {

}
module.exports.actions = actions;

let modulesList = [];
module.exports.modulesList = modulesList;

let webActions = {};
module.exports.webActions = webActions;

// Load all the package directories
let packages = [ __dirname + "/discord/modules" ];
if (fs.existsSync(app.getPath("userData") + "/modules"))
    for (let i of fs.readdirSync(app.getPath("userData") + "/modules"))
        packages.push(app.getPath("userData") + "/modules" + "/" + i);

global.dbm.log("Found " + packages.length + " package(s)", "package-loader");

// Loop through the found packages
for (let i in packages) {
    global.dbm.log("Loading package " + packages[i], "package-loader");
    // Check if it has a manifest.toml
    if (!fs.existsSync(packages[i] + "/manifest.toml")) {
        return errorManager.fatalError(new Error("The package " + packages[i] + " does not have a manifest.toml"));
    }

    // Load and parse the toml
    let manifest = fs.readFileSync(packages[i] + "/manifest.toml");
    manifest = toml.parse(manifest);

    global.dbm.log("Package " + packages[i] + " manifest: v" + manifest.manifest_version + " name:" + manifest.information.name + "(" + manifest.information.version + ") by:" + manifest.information.author, "package-loader");

    // Find the module list
    if (!manifest.list?.module_list) {
        return errorManager.fatalError(new Error("The package " + packages[i] + "'s manifest file does not contain a list"));
    }
    let modules = manifest.list.module_list;

    // Loop through the modules
    for (let m in modules) {
        global.dbm.log("Loading module " + modules[m] + " from package " + manifest.information.name, "package-loader");

        // Check if the .js file exists
        if (!fs.existsSync(packages[i] + "/" + modules[m] + ".js")) {
            return errorManager.fatalError(new Error("Cannot find module " + packages[i] + "/" + modules[m] + ".js" + " at package " + manifest.information.name));
        }

        // Check if the module name is 'information', if so tell the user that they're stupid
        if (modules[m] == "information") {
            return errorManager.fatalError(new Error("Module name cannot be 'information' in module " + manifest.information.name + " at package " + manifest.information.name));
        }

        // Check if the manifest.toml has information about the module
        if (!manifest[modules[m]]) {
            return errorManager.fatalError(new Error("Module manifest cannot be found in package's manifest file, module " + modules[i] + " at package " + manifest.information.name));
        }

        // Load the module file
        let module = require(packages[i] + "/" + modules[m] + ".js");
        modulesList.push(manifest.information.name);

        let ac = module.actions;
        let moduleManifest = manifest[modules[m]];

        // Loop through the actions
        for (let i in ac) {
            global.dbm.log("Loading action " + i + " from module " + modules[m] + " from package " + manifest.information.name, "package-loader");
            
            // Add the action to the webAction information
            if (!webActions[manifest.information.name]) webActions[manifest.information.name] = {
                information: manifest.information
            };
            if (!webActions[manifest.information.name][moduleManifest.name]) webActions[manifest.information.name][moduleManifest.name] = {
                information: moduleManifest
            };

            // Get the name of the action
            let name = manifest.information.name + ":" + moduleManifest.name + ":" + i;
            actions[name] = ac[i];

            // Set the full information in the webActions
            webActions[manifest.information.name][moduleManifest.name][i] = {
                name: ac[i].name,
                inputs: ac[i].inputs || {},
                description: ac[i].description || "",
                allowedEvents: ac[i].allowedEvents || ["*"],
            }

            global.dbm.log("Loaded action: " + manifest.information.name + ":" + moduleManifest.name + ":" + i, "package-loader");
        }

        global.dbm.log("Loaded module: " + manifest.information.name + ":" + moduleManifest.name, "package-loader");
    }

    global.dbm.log("Loaded package: " + manifest.information.name, "package-loader");
}

global.dbm.log("Loaded " + Object.keys(actions).length + " actions from " + modulesList.length + " modules from " + packages.length + " packages!", "module-manager");

// Load plugins
global.dbm.log("Loading plugins", "plugin-loader");

let pluginList = {};
module.exports.plugins = pluginList;

let plugins = [];
if (fs.existsSync(app.getPath("userData") + "/plugins"))
    for (let i of fs.readdirSync(app.getPath("userData") + "/plugins"))
        plugins.push(app.getPath("userData") + "/plugins" + "/" + i);

for (let i in plugins) {
    global.dbm.log("Loading plugin " + packages[i], "plugin-loader");
    // Check if it has a manifest.toml
    if (!fs.existsSync(plugins[i] + "/manifest.toml")) {
        return errorManager.fatalError(new Error("The package " + plugins[i] + " does not have a manifest.toml"));
    }

    // Load and parse the toml
    let manifest = fs.readFileSync(plugins[i] + "/manifest.toml");
    manifest = toml.parse(manifest);

    global.dbm.log("Plugin " + packages[i] + " manifest: v" + manifest.manifest_version + " name:" + manifest.information.name + "(" + manifest.information.version + ") by:" + manifest.information.author, "plugin-loader");

    // Check for [settings].init
    if (!manifest.settings?.init) {
        return errorManager.fatalError(new Error("The plugin " + plugins[i] + "'s manifest.toml's either does not have an [settings] or [settings] does not contain key 'init'"))
    }

    // Check for UI and if it exists
    if (manifest.settings.ui) {
        if (fs.existsSync(plugins[i] + "/" + manifest.settings.ui) == false) {
            return errorManager.fatalError(new Error("The plugin " + plugins[i] + " failed to load due to missing UI: " + manifest.settings.ui));
        }
    }

    pluginList[manifest.information.id] = {
        name: manifest.information.name,
        description: manifest.information.description,
        author: manifest.information.author,
        version: manifest.information.version,
        hasSettingsPanel: manifest.settings.ui ? true : false,
        HTMLpath: plugins[i] + "/" + manifest.settings.ui
    }

    // Load and run init
    try {
        let initFile = require(plugins[i] + "/" + manifest.settings.init);
        initFile(new api.API(manifest.information.id));
    } catch (err) {
        errorManager.fatalError(new Error("The plugin " + plugins[i] + " failed to load at running " + manifest.settings.init + "!\n\n" + err.toString()));
    }

    global.dbm.log("Finished loading plugin: " + manifest.information.name, "plugin-loader");
}