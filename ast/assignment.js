const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(identifier, operator, value) {
        super();
        this.identifier = identifier;
        this.operator = operator;
        this.value = value;
    }

    isAssignment() {
        return true;
    }
}