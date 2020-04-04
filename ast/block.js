const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(expressions) {
        super();
        this.expressions = expressions;
    }

    isBlock() {
        return true;
    }
}