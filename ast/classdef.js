const Definition = require('./definition');

module.exports = class extends Definition {
    constructor(classExpr) {
        super();

        this.classExpr = classExpr;
    }

    isClass() {
        return true;
    }
}