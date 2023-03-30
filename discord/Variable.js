const Types = require(__dirname + "/Types.js");

class Variable {
    constructor(value, data) {
        this.#value = value;
        this.type = data.type ? data.type : "any";
        this.enforceType = data.enforceType || false;

        this.#update();
    }

    get valueAsString() {
        return this.#value.valueAsString;
    }

    get value() {
        return this.#value.value;
    }

    set value(data) {
        let value = data.value;
        let type = data.type;

        if (type != this.type) {
            throw new Error("Type mismatch: attempted to assign type " + type + " to a variable with enforced type " + this.type);
        }

        this.type = type;
        this.#value = value;

        this.#update();
    }

    #update() {
        if (this.type == "number")
            this.#value = new Types.Number(this.#value);
        else if (this.type == "any")
            this.#value = new Types.Any(this.#value);
        else if (this.type == "string")
            this.#value = new Types.String(this.#value);
    }

    type = "any";
    #value = new Types.Any(undefined);

    enforceType = false;
}

module.exports = Variable;