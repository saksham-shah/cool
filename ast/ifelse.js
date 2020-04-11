const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(condition, thenBlock, elseBlock) {
        super();
        this.condition = condition;
        this.thenBlock = thenBlock;
        this.elseBlock = elseBlock;
    }

    isIfElse() {
        return true;
    }
}