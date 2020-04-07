const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(name, params, body) {
        super();
        this.name = name;
        this.params = params;
        this.body = body;
    }

    isFunction() {
        return true;
    }
}