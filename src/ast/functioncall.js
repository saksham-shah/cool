const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(reference, args = []) {
        super();
        this.reference = reference;
        this.args = args;

        // Whether it is a constructor call
        this.constructor = false;
    }

    isFunctionCall() {
        return true;
    }
}