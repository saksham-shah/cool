const Definition = require('./definition');

module.exports = class extends Definition {
    constructor(klass) {
        super();
        this.klass = klass;
    }

    isExtract() {
        return true;
    }
}