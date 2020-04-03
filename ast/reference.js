const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(identifier) {
        super();
        this.identifier = identifier;
    }

    isReference() {
        return true;
    }
}