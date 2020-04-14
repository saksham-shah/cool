const AstBase = require('./astbase');

module.exports = class extends AstBase {
    constructor() {
        super();
    }

    isDefinition() {
        return true;
    }

    isExtract() {
        return false;
    }

    isFunction() {
        return false;
    }
}