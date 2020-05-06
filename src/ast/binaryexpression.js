const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(left, operator, right) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    isBinaryExpression() {
        return true;
    }
}