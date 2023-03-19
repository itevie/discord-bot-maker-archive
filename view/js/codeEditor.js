function parseActionCode() {
    let data = document.getElementById(editingDiv + "-codeEditor").value.replace(/<br>/g, "\n").replace(/<\/?div>/g, "\n").split("\n");
    console.log(data)
    let output = [];
    let imports = {};
    
    let currentIf = {};
    let elseUsed = false;

    for (let i in data) {
        let line = data[i].trim();
        let args = splitNotString(line);
        let action = {};

        if (args.length == 0) continue;

        if (args[0].toLowerCase().match(/^(import\(?)/)) {
            let importLine = data[i];
            importLine = importLine.replace(/^(import *\(? *)/, "");
            let things = importLine.split(")")[0].split(",");
            if (things.length == 0)
                return [ false, i, "Expected at least 1 name in import ()" ];

            let after = importLine.split(")")[1].trim();
            if (after.startsWith("from") == false)
                return [ false, i, "Expected from keyword after import ()" ];

            after = after.replace("from", "");
            let package = after.trim();

            for (let x in things) {
                imports[things[x]] = package + ":" + things[x];
            }

            continue;
        }

        // Check for ifs
        if (args[0].toLowerCase() == "if") {
            if (args.length != 3 && args.length != 4) return [ false, i + 1, "If expected needs 3 or 4 arguments, got " + args.length];
            let s1 = args[1];
            let operator = args[2];
            let s2 = args[3];

            if (operator == "=") action.type = "built-in:conditional:one-action-if-equals";
            else if (operator == "!=") action.type = "built-in:conditional:one-action-if-not-equals";
            else if (operator == "^-") action.type = "built-in:conditional:one-action-if-starts-with";
            else if (operator == "$-") action.type = "built-in:conditional:one-action-if-ends-with";
            else if (operator == "contains") action.type = "built-in:conditional:one-action-if-includes";
            else if (operator == "!contains") action.type = "built-in:conditional:one-action-if-not-includes";
            else if (operator == "exists") action.type = "built-in:conditional:one-action-if-exists";
            else if (operator == "!exists") action.type = "built-in:conditional:one-action-if-not-exists";

            action.statement1 = s1;
            action.statement2 = s2;

            currentIf = action;
            continue;
        }

        if (args[0].toLowerCase() == "else") {
            if (currentIf == {})
                return [ false, i, "Unexpected else statement" ];
            if (elseUsed)
                return [ false, i, "Two else's cannot be used with one if statement" ];

            // Swap the operator
            if (currentIf.type == "built-in:conditional:one-action-if-equals") {
                currentIf.type = "built-in:conditional:one-action-if-not-equals";
            } else if (currentIf.type == "built-in:conditional:one-action-if-not-equals") {
                currentIf.type = "built-in:conditional:one-action-if-equals";
            } else if (currentIf.type == "built-in:conditional:one-action-if-exists") {
                currentIf.type = "built-in:conditional:one-action-if-not-exists";
            } else if (currentIf.type == "built-in:conditional:one-action-if-not-includes") {
                currentIf.type = "built-in:conditional:one-action-if-includes";
            } else {
                return [ false, i, "The operator " + currentIf.type + " is not allowed to be swapped at this moment in time." ];
            }

            elseUsed = true;
            continue;
        }

        if (args[0].toLowerCase() == "end") {
            currentIf = {};
            elseUsed = false;
            continue;
        }

        if (currentIf) output.push(JSON.parse(JSON.stringify(currentIf)));

        // Check for calls
        if (args[0].match(/^([a-zA-Z0-9\:\-]+ *\( *\)?)$/)) {
            let name = args[0].match(/[a-zA-Z0-9\:\-]+/)[0];
            action.type = name;

            args.shift();

            let inKey = true;
            let currentKey = null;

            for (let a in args) {
                if (args[a].trim() == ")") break;
                if (args[a].trim() == "") continue;

                if (args[a].match(/^([a-zA-Z0-9]+\:)$/) && inKey == false) {
                    return [ false, i, "Expected parameter value after key for function call (arg " + args[a] + ")" ];
                } else if (!args[a].match(/^([a-zA-Z0-9]+\:)$/) && inKey == true) {
                    return [ false, i, "Expected parameter key for function call (arg " + args[a] + ")" ];
                }

                if (inKey == true) {
                    let keyName = args[a].match(/[a-zA-Z0-9]+/);
                    currentKey = keyName;
                    inKey = false;
                } else {
                    action[currentKey] = args[a];
                    inKey = true;
                }
            }
        }

        output.push(action);
    }

    for (let i in output) {
        if (!output[i].type) {
            output[i] = "DEL";
            continue;
        }

        if (imports[output[i].type]) output[i].type = imports[output[i].type];
    }

    for (let i in output) {
        if (output[i] == "DEL") output.splice(i, 1);
    }

    return output;
}

function splitNotString(str) {
    let output = [];
    let inString = false;
    let current = "";

    for (let i in str) {
        if (str[i] == '"') {
            inString = inString == false ? true : false; 
            continue;
        } 
        
        if ((str[i] == ":" || str[i] == "(") && inString == false) {
            current += str[i];
            output.push(current);
            current = "";
            continue;
        }

        if (str[i] == " " && inString == false) {
            output.push(current);
            current = "";
            continue;
        }

        current += str[i];
    }

    if (current) output.push(current);
    
    for (let i in output) output[i] = output[i].trim();

    return output;
}