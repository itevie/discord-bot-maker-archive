const actualToolbox = {
    kind: "categoryToolbox",
    contents: [ 
        {
            "kind": "category",
            "name": "Logic",
            colour: 210,
            "contents": [
                {
                    "kind": "block",
                    "type": "controls_if"
                },
                {
                    kind: "block",
                    type: "logic_operation"
                },
                {
                    kind: "block",
                    type: "logic_ternary"
                },
                {
                    "kind": "block",
                    "type": "logic_compare"
                },
                {
                    "kind": "block",
                    "type": "logic_boolean"
                },
                {
                    kind: "block",
                    type: "logic_negate"
                },
                {
                    kind: "block",
                    type: "logic_null"
                }
            ]
        },
        {
            "kind": "category",
            "name": "Predefined Variables",
            "contents": [],
            colour: 290,
        },
        {
            "kind": "category",
            "name": "Variables",
            "contents": [
                {
                    kind: "block",
                    type: "get_variable"
                },
                {
                    kind: "block",
                    type: "set_variable"
                }
            ],
            colour: 290,
        },
        {
            "kind": "category",
            "name": "Text",
            colour: 160,
            "contents": [
                {
                    "kind": "block",
                    "type": "text"
                },
                {
                    kind: "block",
                    type: "text_length"
                },
                {
                    kind: "block",
                    type: "text_isEmpty"
                },
                {
                    kind: "block",
                    type: "text_append"
                },
                {
                    kind: "block",
                    type: "text_join"
                },
                {
                    kind: "block",
                    type: "text_indexOf"
                },
                {
                    kind: "block",
                    type: "text_getSubstring"
                },
                {
                    kind: "block",
                    type: "text_changeCase"
                },
                {
                    kind: "block",
                    type: "text_trim"
                },
                {
                    kind: "block",
                    type: "text_count"
                },
                {
                    kind: "block",
                    type: "text_replace"
                },
                {
                    kind: "block",
                    type: "text_reverse"
                },
            ]
        },
        {
            kind: "category",
            name: "Math",
            colour: 230,
            contents: [
                {
                    "kind": "block",
                    "type": "math_number"
                },
                {
                    kind: "block",
                    type: "math_arithmetic"
                },
                {
                    kind: "block",
                    type: "math_round"
                },
                {
                    kind: "block",
                    type: "math_modulo"
                },
                {
                    kind: "block",
                    type: "math_constrain"
                },
                {
                    kind: "block",
                    type: "math_random_int"
                },
                {
                    kind: "block",
                    type: "math_random_float"
                },
            ]
        }
    ]
};

let predefinedVariables = {
    result: `>>>result`,
    message_content: `>>>message:content`,
    message_id: `>>>message:id`,
    author_id: `>>>message:author:id`,
    author_username: `>>>message:author:username`,
    author_discriminator: ">>>message:author:discriminator",
    message_channel_id: `>>>message:channel:id`,
    message_guild_id: `>>>message:guild:id`
}

for (let i in predefinedVariables) {
    actualToolbox.contents[1].contents.push({
        "kind": "block",
        "type": "predefined_variable_" + i
    });

    Blockly.Blocks["predefined_variable_" + i] = {
        init: function() {
            this.jsonInit({
                "message0": prettify(i),
                output: null,
                colour: 290,
            });
        }
    }

    Blockly.JavaScript["predefined_variable_" + i] = function (block) {
        if (predefinedVariables[i].startsWith(">>>"))
            return [`await __data.getVariable("${predefinedVariables[i].replace('>>>', '')}")`, Blockly.JavaScript.ORDER_ATOMIC]
    }
}

Blockly.Blocks["get_variable"] = {
    init: function() {
        this.jsonInit({
            message0: "Get variable %1",
            colour: 290,
            args0: [
                {
                   type: "field_input",
                   name: "variable_name",
                   text: "variable" 
                }
            ],
            output: null
        })
    }
}

Blockly.Blocks["set_variable"] = {
    init: function() {
        this.jsonInit({
            message0: "Set variable %1 to %2",
            colour: 290,
            args0: [
                {
                   type: "field_input",
                   name: "variable_name",
                   text: "variable" 
                },
                {
                    type: "input_value",
                    name: "set_it_to"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null
        });
    }
}

Blockly.JavaScript["get_variable"] = function (block) {
    let variable = block.getFieldValue("variable_name");
    return [`await __data.getVariable("${variable}")`, Blockly.JavaScript.ORDER_ATOMIC];
}

Blockly.JavaScript["set_variable"] = function (block) {
    let variable = block.getFieldValue("variable_name");
    let setTo = Blockly.JavaScript.valueToCode(block, "set_it_to", Blockly.JavaScript.ORDER_ATOMIC);
    console.log(`await __data.setVariable("${variable}", ${setTo})`)
    return `await __data.setVariable("${variable}", ${setTo})`
}

document.addEventListener("DOMContentLoaded", () => {
    for (let package in packages) {
        if (package == "information") continue;
        for (let module in packages[package]) {
            if (module == "information") continue;
            let toAdd = [];
            let category = prettify(`${package}: ${module}`);

            for (let action in packages[package][module]) {
                if (action == "information") continue;
                let actionId = `${package}:${module}:${action}`;
                let act = packages[package][module][action];

                let data = {
                    "message0": `${prettify(packages[package][module][action].name)}`,
                    "previousStatement": null,
                    "nextStatement": null,
                    colour: 65
                };

                let current = 1;
                for (let i in act.inputs) {
                    data["message" + current] = prettify(act.inputs[i].name || i) + " %1";
                    data["args" + current] = [
                        { "type": "input_value", name: i }
                    ]
                    current++;
                }
                
                Blockly.Blocks[actionId] = {
                    init: function() {
                        this.jsonInit(data)
                    }
                }

                Blockly.JavaScript[actionId] = function (block) {
                    if (Object.keys(act.inputs).length > 0) {
                        var args = "{"
                        for (let i in act.inputs) {
                            if (!Blockly.JavaScript.valueToCode(block, i, Blockly.JavaScript.ORDER_ATOMIC)) {
                                args += `"${i}": "",`
                            }
                            else args += `"${i}": ${Blockly.JavaScript.valueToCode(block, i, Blockly.JavaScript.ORDER_ATOMIC)},`
                        }
                        args = args.substring(0, args.length - 1);
                        args += "}"
                    } else args = "{}";

                    return `await __data.executeAction("${actionId}", { args: ${args.replace(/\\"/g, '"')}});\n`;
                }

                toAdd.push({
                    kind: "block",
                    type: actionId
                });
            }

            actualToolbox.contents.push({
                kind: "category",
                name: category,
                contents: toAdd,
                colour: 65
            });
        }
    }

    Blockly.Blocks['base'] = {
        init: function() {
            this.jsonInit({
                message0: "When command is ran",
                message1: "Do %1",
                args1: [
                    {
                        "type": "input_statement", 
                        "name": "do"
                    }
                ],
                deletable: false,
                moveable: false,
                editable: false,
                colour: 260
            });

            this.setDeletable(false);
        }
    }

    Blockly.JavaScript.base = function(block) {
        let blockJS = Blockly.JavaScript.statementToCode(block, "do");
        return `async function __run() {\n${blockJS}\n}\n__run();`;
    }
});