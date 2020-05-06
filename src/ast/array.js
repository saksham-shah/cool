const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(items = []) {
        super();
        this.items = items;
    }

    isArrayLiteral() {
        return true;
    }
}