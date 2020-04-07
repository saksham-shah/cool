const Expression = require('./expression');

module.exports = class extends Expression {
    constructor(name, superClass, properties = [], functions = [], statics = []) {
        super();
        this.name = name;
        this.superClass = superClass;
        this.properties = properties;
        this.functions = functions;
        this.statics = statics;
    }

    isClass() {
        return true;
    }
}