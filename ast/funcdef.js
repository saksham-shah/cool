const Definition = require('./definition');

module.exports = class extends Definition {
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