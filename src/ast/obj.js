const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(properties = new Map()) {
        super();
        this.properties = properties;
    }

    isObjectLiteral() {
        return true;
    }
}