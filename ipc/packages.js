const {
    ipcMain,
    ipcRenderer,
    dialog,
    app
} = require('electron');
const fs = require("fs");
const toml = require("toml");
const uuid = require("uuid");
const decompress = require("decompress");

ipcMain.on("loadNewPackage", (event) => {
    dialog.showOpenDialog(global.dbm.mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: "Compressed Archives", extensions: [ "zip" ] }
        ],
        title: "Install a package to Discord Bot Maker"
    }).then(files => {
        // Check if the user cancelled it
        if (files.canceled == false) {
            global.dbm.log("Packages to be installed: " + files.filePaths.join(", "), "package-installer");
            global.dbm.log("Creating temp directory", "package-installer");

            // Create temp path
            let tempPath = app.getPath("userData") + "/temp";

            if (fs.existsSync(tempPath))
                fs.rmSync(tempPath, { recursive: true });

            fs.mkdirSync(tempPath);
            global.dbm.log("Created directory " + tempPath, "package-installer");

            global.dbm.log("Installing packages", "package-installer");

            // Loop through paths
            let paths = files.filePaths;
            for (let i in paths) {
                global.dbm.log("Installing package: " + paths[i], "package-installer");

                // Create the directory in the temp/ directory
                let id = uuid.v4();
                let packageDirPath = tempPath + "/" + id

                fs.mkdirSync(packageDirPath);
                global.dbm.log("Created directory " + packageDirPath, "package-installer");

                // Copy the zip file to the temp/ directory
                global.dbm.log("Copying file to " + packageDirPath, "package-installer");
                let packageId = uuid.v4();
                let packagePath = packageDirPath + "/" + packageId + ".zip";
                fs.copyFileSync(paths[i], packagePath);

                global.dbm.log("Package's temp is " + packagePath, "package-installer");

                // Decompress the zip
                global.dbm.log("Decompressing package: " + packagePath, "package-installer");
                decompress(packagePath, packageDirPath + "/output").then(() => {
                    global.dbm.log("Successfully decompressed: " + packagePath, "package-installer");
                    // Check if the zip contained only a folder
                    let files = fs.readdirSync(packageDirPath + "/output");

                    // Create the final directory
                    fs.mkdirSync(packageDirPath + "/final");
                    
                    global.dbm.log("Parsing package " + packagePath, "package-installer");
                    if (files.length == 1 && fs.lstatSync(packageDirPath + "/output/" + files[0]).isDirectory()) {
                        // Copy the files to final/
                        global.dbm.log("Package contains only directory, moving it", "package-installer");
                        let f = fs.readdirSync(packageDirPath + "/output/" + files[0]);
                        for (let i in f) {
                            global.dbm.log("Moving file: " + f[i]);
                            fs.copyFileSync(packageDirPath + "/output/" + files[0] + "/" + f[i], packageDirPath + "/final/" + f[i]);
                        }
                    } else {
                        // Copy the files to final/
                        global.dbm.log("Moving files", "package-installer");
                        let f = fs.readdirSync(packageDirPath + "/output");
                        for (let i in f) {
                            global.dbm.log("Moving file: " + f[i], "package-installer");
                            fs.copyFileSync(packageDirPath + "/output/" + f[i], packageDirPath + "/final/" + f[i]);
                        }
                    }

                    // Check the package
                    global.dbm.log("Checking package...", "package-installer");
                    let fpath = packageDirPath + "/final";

                    // Check if manifest exists
                    if (!fs.existsSync(fpath + "/manifest.toml")) {
                        return global.dbm.error("Failed to load package " + paths[i] + ": packag does not contain manifest.toml");
                    }

                    let manifest = toml.parse(fs.readFileSync(fpath + "/manifest.toml"));
                    
                    // Check if manifest contains information
                    if (!manifest.information) {
                        return global.dbm.error("The manifest file for " + paths[i] + " does not contain information category");
                    }

                    // Check if manifest information contains keys
                    for (let key of ["author", "description", "version", "name"]) {
                        if (!manifest.information[key]) {
                            return global.dbm.error("The manifest file for " + paths[i] + " does not contain " + key + " in information category");
                        }
                    }

                    if (!manifest.list) {
                        return global.dbm.error("The manifest file for " + paths[i] + " does not contain list category");
                    }

                    if (!manifest.list.module_list) {
                        return global.dbm.error("The manifest file for " + paths[i] + " does not contain module_list in list category");
                    }

                    if (Array.isArray(manifest.list.module_list) == false) {
                        return global.dbm.error("The manifest file for " + paths[i] + " module_list in category list must be an array");
                    }

                    // Finalise
                    global.dbm.log("Finalising package import", "package-installer");

                    if (!fs.existsSync(app.getPath("userData") + "/modules")) {
                        fs.mkdirSync(app.getPath("userData") + "/modules");
                        global.dbm.log("The modules folder didn't exist, created it", "package-installer");
                    }

                    let modulePath = app.getPath("userData") + "/modules";

                    if (fs.existsSync(modulePath + "/" + manifest.information.name)) {
                        return global.dbm.error("The package already exists in module folder: " + manifest.information.name, "package-installer");
                    }

                    fs.mkdirSync(modulePath + "/" + manifest.information.name);
                    let mPath = modulePath + "/" + manifest.information.name;

                    for (let i of fs.readdirSync(fpath)) {
                        fs.copyFileSync(fpath + "/" + i, mPath + "/" + i);
                        global.dbm.log("Copied file: " + i + " to final destination", "package-installer");
                    }

                    global.dbm.log("Cleaning up", "package-installer");
         
                    fs.rmSync(tempPath, { recursive: true });

                    global.dbm.log("Finished importing package: " + paths[i], "package-installer");

                    global.dbm.window.notification("Imported package", "success", "Imported package: " + manifest.information.name + ". The application will now restart.");
                    setTimeout(() => {
                        app.relaunch();
                        app.quit();
                    }, 3000);
                });
            }
        }
    });
});