const Expression = require('./expression');

module.exports = class extends Expression {
    constructor() {
        super();
    }

    isUndefinedLiteral() {
        return true;
    }
}