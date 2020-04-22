const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(reference, operator, value, forceNewScope = false) {
        super();
        this.reference = reference;
        this.operator = operator;
        this.value = value;
        // Whether it forces a new variable to be created in the current scope
        // e.g. using let in JavaScript
        this.forceNewScope = forceNewScope;
    }

    isAssignment() {
        return true;
    }
}