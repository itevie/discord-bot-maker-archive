document.addEventListener("DOMContentLoaded", () => {
    loadPackages();
});

function loadNewPackage() {
    window.electron.loadNewPackage();
}

function loadPackages() {
    document.getElementById("packages-installed").innerHTML = "";

    let packages = window.electron.fetchWebActions();
    let mainDiv = document.createElement("div");

    for (let i in packages) {
        // Craete packge div
        let packageDiv = document.createElement("div");
        packageDiv.style.padding = "5px";
        packageDiv.classList.add("inline-comment");

        // Create the package label and add it to the div
        let packageLabel = document.createElement("label");
        packageLabel.innerHTML = prettify(i);
        packageDiv.appendChild(packageLabel);

        // Add the drop down to view the package's module
        let packageDropDown = document.createElement("img");
        packageDropDown.src = "image/icon/down.png";
        packageDropDown.classList.add("icon");
        packageDropDown.style.width = "16px";
        packageDiv.appendChild(packageDropDown);
        packageDropDown.onclick = () => {
            document.getElementById("packages-installed-" + i).style.display =
                document.getElementById("packages-installed-" + i).style.display == "block" ? "none" : "block";
        }

        // Create the package modules div
        let packageModules = document.createElement("div");
        packageModules.style.padding = "5px";
        packageModules.style.display = "none";
        packageModules.id = "packages-installed-" + i;
        packageModules.classList.add("inline-comment");

        console.log(packages[i].information)
        // Load package description, author etc.
        let packageP = document.createElement("p");
        packageP.style.padding = "5px";
        packageP.classList.add("inline-comment");

        packageP.innerHTML += "Author: " + packages[i].information.author;
        packageP.innerHTML += "<br>Description: " + packages[i].information.description;
        packageP.innerHTML += "<br>Version: " + packages[i].information.version;
        packageModules.appendChild(packageP);

        // Loop through the package's modules
        for (let module in packages[i]) {
            if (module == "information") continue;

            // Create the module div
            let moduleDiv = document.createElement("div");
            
            // Create the module label
            let moduleLabel = document.createElement("label");
            moduleLabel.innerHTML = prettify(module);
            moduleDiv.appendChild(moduleLabel);

            // Create the module drop down to view the module's actions
            let moduleDropDown = document.createElement("img");
            moduleDropDown.src = "image/icon/down.png";
            moduleDropDown.classList.add("icon");
            moduleDropDown.style.width = "16px";
            moduleDiv.appendChild(moduleDropDown);
            moduleDropDown.onclick = () => {
                document.getElementById("packages-installed-" + i + "-modules-" + module).style.display =
                    document.getElementById("packages-installed-" + i + "-modules-" + module).style.display == "block" ? "none" : "block";
            }

            // Create the module's actions div
            let moduleActions = document.createElement("div");
            moduleActions.style.padding = "5px";
            moduleActions.style.display = "none";
            moduleActions.id = "packages-installed-" + i + "-modules-" + module;
            moduleActions.classList.add("inline-comment");

            let moduleDescription = [];
            if (packages[i][module].information.description) moduleDescription.push(packages[i][module].information.description);
            moduleDescription = moduleDescription.join("<br>");

            let moduleP = document.createElement("p");
            moduleP.classList.add("inline-comment");
            moduleP.innerHTML = moduleDescription;

            moduleActions.appendChild(moduleP);

            // Loop through the module's actions
            for (let action in packages[i][module]) {
                if (action == "information") continue;

                // Create the action's div
                let actionDiv = document.createElement("div");

                // Create the action label
                let actionLabel = document.createElement("label");
                actionLabel.innerHTML = prettify(packages[i][module][action].name);
                actionDiv.appendChild(actionLabel);
                
                // Create and set the action description
                let actionDescriptionText = [];
                actionDescriptionText.push(`${packages[i][module][action].description}`);
                if (packages[i][module][action].allowedEvents) 
                    actionDescriptionText.push(`Allowed Events: ${packages[i][module][action].allowedEvents.join(",")}`);

                actionDescriptionText = actionDescriptionText.join("<br>");

                // If the description is not empty add a button that'll show the action's description
                if (actionDescriptionText) {
                    let moduleDropDown = document.createElement("img");
                    moduleDropDown.src = "image/icon/down.png";
                    moduleDropDown.classList.add("icon");
                    moduleDropDown.style.width = "16px";
                    actionDiv.appendChild(moduleDropDown);
                    moduleDropDown.onclick = () => {
                        document.getElementById("packages-installed-" + i + "-modules-" + module + "-actions-" + action).style.display =
                            document.getElementById("packages-installed-" + i + "-modules-" + module + "-actions-" + action).style.display == "block" ? "none" : "block";
                    }
                }

                // Create the action description div
                let actionDescription = document.createElement("div");
                actionDescription.style.padding = "5px";
                actionDescription.style.display = "none";
                actionDescription.id = "packages-installed-" + i + "-modules-" + module + "-actions-" + action;
                actionDescription.classList.add("inline-comment");

                // Craete the action description
                let actionP = document.createElement("p");
                actionP.innerHTML = actionDescriptionText;

                actionDescription.appendChild(actionP);

                actionDiv.appendChild(actionDescription);

                moduleActions.appendChild(actionDiv);
            }

            moduleDiv.appendChild(moduleActions);

            packageModules.appendChild(moduleDiv);
        }

        packageDiv.appendChild(packageModules);

        mainDiv.appendChild(packageDiv);
    }

    document.getElementById("packages-installed").appendChild(mainDiv);
}