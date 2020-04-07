const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(identifier, operator, value, object) {
        super();
        this.identifier = identifier;
        this.operator = operator;
        this.value = value;
        this.object = object;
    }

    isAssignment() {
        return true;
    }
}