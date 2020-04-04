const Class = require('../../ast/class');
const Types = require('../../types/types');

module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Object;
    }
}