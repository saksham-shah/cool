const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(condition, body) {
        super();
        this.condition = condition;
        this.body = body;
    }

    isWhile() {
        return true;
    }
}