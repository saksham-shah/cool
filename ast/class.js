const Definition = require('./definition');

module.exports = class extends Definition {
    constructor(name, superClass, properties = [], functions = []) {
        super();
        this.name = name;
        this.superClass = superClass;
        this.properties = properties;
        this.functions = functions;
    }

    isClass() {
        return true;
    }
}