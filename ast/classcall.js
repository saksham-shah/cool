const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(object, name, args = []) {
        super();
        this.object = object;
        this.name = name;
        this.args = args;
    }

    isConstructorCall() {
        return true;
    }
}