class Number {
    constructor(value) {
        try {
            this.#value = parseFloat(value);
            if (isNaN(this.#value)) throw new Error("Failed to parse number: " + newVal + ": got NaN when parsing");
        } catch (err) {
            throw new Error("Failed to parse number: " + value + " " + err);
        }
    }

    get valueAsString() {
        return this.#value.toString();    
    }

    get value() {
        return this.#value;
    }

    set value(newVal) {
        try {
            this.#value = parseFloat(newVal);
            if (this.#value == NaN) throw new Error("Failed to parse number: " + newVal + ": got NaN when parsing");
        } catch (err) {
            throw new Error("Failed to parse number: " + newVal + " " + err);
        }
    }

    #value = NaN;
}

class Any {
    constructor(value) {
        this.#value = value;
    } 
    
    get valueAsString() {
        return this.#value.toString();    
    }

    get value() {
        return this.#value;
    }

    set value(newVal) {
        this.value = newVal;
    }

    #value = undefined;
}

class String {
    constructor(value) {
        this.#value = value.toString();
    } 
    
    get valueAsString() {
        return this.#value.toString();    
    }

    get value() {
        return this.#value;
    }

    set value(newVal) {
        this.value = newVal.toString();
    }

    #value = "";
}

module.exports = {
    Number: Number,
    Any: Any,
    String: String
}