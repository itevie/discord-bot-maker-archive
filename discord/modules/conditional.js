// NOTE: THIS FILE HAS NO EXECUTIONAL USE, IT IS PURELY TO SHOW THE CLIENT THAT THESE COMMANDS EXIST
// THESE COMMANDS ARE EXECUTED IN utils/execute.js

module.exports.details = {
    name: "Conditional"
}

module.exports.actions = {
    "if": {
        name: "Start If",
        inputs: {
            statement1: {
                name: "statement 1"
            },
            operator: {
                name: "operator"
            },
            statement2: {
                name: "statement 2"
            }
        }
    },
    "one-action-if-equals": {
        name: "One Action If Equals",
        inputs: {
            statement1: {
                name: "statement 1"
            },
            statement2: {
                name: "statement 2"
            }
        }
    },
    "one-action-if-not-equals": {
        name: "One Action If Not Equals",
        inputs: {
            statement1: {
                name: "statement 1"
            },
            statement2: {
                name: "statement 2"
            }
        }
    },
    "one-action-if-starts-with": {
        name: "One Action If Starts With",
        inputs: {
            statement1: {
                name: "statement 1"
            },
            statement2: {
                name: "statement 2"
            }
        }
    },
    "one-action-if-ends-with": {
        name: "One Action If Ends With",
        inputs: {
            statement1: {
                name: "statement 1"
            },
            statement2: {
                name: "statement 2"
            }
        }
    },
    "one-action-if-includes": {
        name: "One Action If Includes",
        inputs: {
            statement1: {
                name: "statement 1"
            },
            statement2: {
                name: "statement 2"
            }
        }
    },
    "else": {
        name: "Else"
    },
    "end": {
        name: "End If"
    }
}