const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(reference, name, args = []) {
        super();
        this.reference = reference;
        this.name = name;
        this.args = args;

        // Whether it is a constructor call
        this.constructor = false;
    }

    isFunctionCall() {
        return true;
    }
}