const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(func) {
        super();
        this.func = func;
    }

    isNativeExpression() {
        return true;
    }
}