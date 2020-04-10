const Expression = require('./expression');

module.exports = class extends Expression {
    constructor() {
        super();
    }

    isThis() {
        return true;
    }
}