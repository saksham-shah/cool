const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(value) {
        super();
        this.value = value;
    }

    isBooleanLiteral() {
        return true;
    }
}