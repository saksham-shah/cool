const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(reference, operator, value) {
        super();
        this.reference = reference;
        this.operator = operator;
        this.value = value;
    }

    isAssignment() {
        return true;
    }
}