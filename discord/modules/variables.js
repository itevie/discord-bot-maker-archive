// NOTE: THIS FILE HAS NO EXECUTIONAL USE, IT IS PURELY TO SHOW THE CLIENT THAT THESE COMMANDS EXIST
// THESE COMMANDS ARE EXECUTED IN utils/execute.js

module.exports.details = {
    name: "Variables"
}

module.exports.actions = {
    "set-variable": {
        name: "Set Variable To",
        inputs: {
            id: {
                name: "id"
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
                name: "id"
            }
        }
    }
}