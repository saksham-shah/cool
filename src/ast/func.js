const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(name, params, body) {
        super();
        this.name = name;
        this.params = params;
        this.body = body;

        // Whether the function is a method of a class
        this.isClassMethod = false;
    }

    isFunction() {
        return true;
    }
}