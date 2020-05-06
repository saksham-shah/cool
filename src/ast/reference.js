const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(identifier, object) {
        super();
        this.identifier = identifier;
        this.object = object;
    }

    isReference() {
        return true;
    }
}