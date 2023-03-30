let queryCommands = [
    //DIV SHOWERS
    {
        triggers: [ "commands", "cmds" ],
        execute: () => showDiv("botCommads")
    },
    {
        triggers: [ "as", "appsettings" ],
        execute: () => showDiv("appSettings")
    },
    {
        triggers: [ "s" ],
        execute: () => showDiv("settings")
    },
    {
        triggers: [ "det", "details" ],
        execute: () => showDiv("details")
    },
    {
        triggers: [ "log" ],
        execute: () => showDiv("log")
    },
    {
        triggers: [ "bots" ],
        execute: () => showDiv("changeBot")
    },

    {
        triggers: [ "unlock", "unlockbuttons", "releasebuttons" ],
        execute: () => {
            enableAll();
        }
    },

    {
        triggers: [ "nc", "newcommand", "newc", "newcmd" ],
        execute: () => {
            showDiv("botCommads");
            newCommand();
        }
    },
    {
        triggers: [ "cmd", "c", "command" ],
        execute: (args) => {
            if (args.length == 0) {
                return Swal.fire({
                    title: "Missing",
                    text: "Missing input: you must put a command name after",
                    icon: "error"
                });
            }

            showDiv("botCommads")
            editCommand(args.join(" "))
        }
    },
    {
        triggers: [ "abt", "about", "aboutapp" ],
        execute: () => window.electron.showAbout()
    },

    {
        triggers: [ "restartapp", "resapp" ],
        execute: () => window.electron.restartApp()
    },
    {
        triggers: [ "reload", "rd" ],
        execute: () => location.reload()
    },

    {
        triggers: [ "del" ],
        execute: () => {
            if (currentDiv == "botCommads") {
                if (currentEditingCommand)
                    deleteCommand();
            }
        }
    },
    {
        triggers: [ "start", "st", "starbot" ],
        execute: (args) => {
            if (args.length != 0) startSpecific(args.join(" "));
            else startBot();
        }
    },
    {
        triggers: [ "stop", "sp", "stopbot" ],
        execute: (args) => {
            if (args.length != 0) stopSpecific(args.join(" "));
            else stopBot();
        }
    },
    {
        triggers: [ "res", "restart", "restarbot" ],
        execute: (args) => {
            if (args.length != 0) restartSpecific(args.join(" "));
            else restartBot();
        }
    },
    {
        triggers: [ "sel", "select", "selectbot" ],
        execute: (args) => {
            if (args.length == 0) return Swal.fire({
                title: "Missing",
                text: "You must provide a bot name",
                icon: "error"
            });
            selectBot(args.join(" ")); 
        }
    }
]

document.addEventListener("keydown", (e) => {
    let key = e.key.toLowerCase();

    if (e.ctrlKey && key == "s") {
        if (currentDiv == "botCommads") {
            createCommand();
        }
    }
    else if (e.ctrlKey && key == "n") {
        if (currentDiv == "botCommads") {
            addAnotherAction();
        }
    }
    else if (key == "s") {
        const element = document.activeElement;
    
        if (element.tagName == "BODY") {
            // Show searcher
            Swal.fire({
                title: "Searcher",
                text: "Enter your search query here",
                input: "text",
                inputValidator: (value) => {
                    let valid = false;
                    let potential = [];

                    
                    let args = value.split(" ");
                    let command = args[0];
                    args.shift();

                    for (let i in queryCommands) {
                        if (queryCommands[i].triggers.includes(command)) valid = true;
                    }

                    if (valid == false) {
                        for (let i in queryCommands) {
                            for (let t in queryCommands[i].triggers) {
                                if (queryCommands[i].triggers[t].toLowerCase().startsWith(command)) potential.push(queryCommands[i].triggers[t]);
                            }
                        }
                    }

                    if (valid == false) return "Unknown command: " + command + ", did you mean: " + potential.join(", ");
                }
            }).then(res => {
                if (res.isConfirmed) {
                    let args = res.value.split(" ");
                    let command = args[0];
                    args.shift();

                    for (let i in queryCommands) {
                        if (queryCommands[i].triggers.includes(command)) {
                            queryCommands[i].execute(args);
                        }
                    }
                }
            })
        }
    }
});