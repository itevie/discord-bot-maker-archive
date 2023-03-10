module.exports.details = {
    name: "lists"
}

module.exports.actions = {
    "new-list": {
        name: "New List",
        description: "Creates a new, empty list at the specified variable name",
        inputs: {
            variable: {
                name: "variable name"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.variables[data.action.variable] = [];
                resolve();
            });
        }
    },
    "append-item": {
        name: "Append Item",
        description: "Adds a new item to a list",
        inputs: {
            variable: {
                name: "variable name"
            },
            content: {
                name: "Content"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                if (data.variables[data.action.variable]) {
                    if (!Array.isArray(data.varables[data.action.variable])) {
                        reject("Variable " + data.action.variable + " is not a list");
                    } 

                    data.variables[data.action.variable].push(data.action.content);
                    resolve();
                } else {
                    reject("Variable " + data.action.variable + " does not exist");
                }
            });
        }
    },
    "shift": {
        name: "Remove First Item",
        description: "Removes the first item of a list, returns the removed variable as {{result}}",
        inputs: {
            variable: {
                name: "variable name"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                if (data.variables[data.action.variable]) {
                    if (!Array.isArray(data.varables[data.action.variable])) {
                        reject("Variable " + data.action.variable + " is not a list");
                    } 

                    let v = data.variables[data.action.variable].shift();
                    resolve(v);
                } else {
                    reject("Variable " + data.action.variable + " does not exist");
                }
            });
        }
    },
    "pop": {
        name: "Remove Last Item",
        description: "Removes the last item of a list, returns the removed variable as {{result}}",
        inputs: {
            variable: {
                name: "variable name"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                if (data.variables[data.action.variable]) {
                    if (!Array.isArray(data.varables[data.action.variable])) {
                        reject("Variable " + data.action.variable + " is not a list");
                    } 

                    let v = data.variables[data.action.variable].pop();
                    resolve(v);
                } else {
                    reject("Variable " + data.action.variable + " does not exist");
                }
            });
        }
    }
}