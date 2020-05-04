const Class = require('../../ast/class');
const Reference = require('../../ast/reference');

const Types = require('../../types/types');

// Function Class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Function;

        this.superClass = new Reference(Types.Object);
    }
}