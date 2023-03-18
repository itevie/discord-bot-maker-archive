// NOTE: THIS FILE HAS NO EXECUTIONAL USE, IT IS PURELY TO SHOW THE CLIENT THAT THESE COMMANDS EXIST
// THESE COMMANDS ARE EXECUTED IN utils/execute.js

module.exports.details = {
    name: "Variables"
}

module.exports.actions = {
    "create-variable": {
        name: "Create Variable",
        description: "A more advanced set variable",
        inputs: {
            id: {
                name: "id",
                allowEmpty: false
            },
            content: {
                name: "content"
            },
            type: {
                name: "type",
                type: "select",
                options: {
                    "String": "string",
                    "Number": "number",
                    "JSON": "json",
                    "Boolean": "boolean"
                }
            },
            forceType: {
                name: "enforce types",
                type: "checkbox"
            }
        }
    },
    "set-variable": {
        name: "Set Variable To",
        inputs: {
            id: {
                name: "id",
                allowEmpty: false
            },
            content: {
                name: "content"
            }
        }
    },
    "delete-variable": {
        name: "Delete Variable",
        inputs: {
            id: {
                name: "id",
                allowEmpty: false
            }
        }
    }
}