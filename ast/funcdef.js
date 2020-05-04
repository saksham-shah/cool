const Definition = require('./definition');

module.exports = class extends Definition {
    constructor(funcExpr) {
        super();

        this.funcExpr = funcExpr;
        // this.name = name;
        // this.params = params;
        // this.body = body;

        // Whether the function is a method of a class
        // this.isClassMethod = false;
    }

    isFunction() {
        return true;
    }
}