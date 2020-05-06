const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(expressions, definitions) {
        super();
        this.expressions = expressions;
        this.definitions = definitions;
    }

    isBlock() {
        return true;
    }
}