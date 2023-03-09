module.exports.details = {
    name: "types"
}

module.exports.actions = {
    "set-variable-to-json": {
        name: "Set Variable To JSON",
        inputs: {
            id: {
                name: "variable id"
            }
        },
        execute: async (data) => {
            return new Promise(async (resolve, reject) => {
                if (data.variables[data.action.id]) {
                    data.variables[data.action.id] = JSON.parse(data.variables[data.action.id]);
                    resolve();
                } else resolve();
            });
        }
    },
    "set-variable-to-int": {
        name: "Set Variable To Number",
        inputs: {
            id: {
                name: "variable id"
            }
        },
        execute: async (data) => {
            return new Promise(async (resolve, reject) => {
                if (data.variables[data.action.id]) {
                    data.variables[data.action.id] = parseInt(data.variables[data.action.id]);
                    resolve();
                } else resolve();
            });
        }
    },
    "set-variable-to-string": {
        name: "Set Variable To String",
        inputs: {
            id: {
                name: "variable id"
            }
        },
        execute: async (data) => {
            return new Promise(async (resolve, reject) => {
                if (data.variables[data.action.id]) {
                    data.variables[data.action.id] = "" + data.variables[data.action.id];
                    resolve();
                } else resolve();
            });
        }
    }
}