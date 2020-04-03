const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(operator, expression) {
        super();
        this.operator = operator;
        this.expression = expression;
    }

    isUnaryExpression() {
        return true;
    }
}