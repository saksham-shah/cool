const Class = require('../../ast/class');
const Func = require('../../ast/func');
const NativeExpression = require('../../ast/nativeexpression');
const NumberLiteral = require('../../ast/number');

const Obj = require('../object');
const Types = require('../../types/types');

const TokenType = require('../../lexer/tokenType');

// The base Object Class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Object;

        this.statics.set('hello', new NumberLiteral(5));
        // this.statics.set('bye', new NumberLiteral(3));
    }
}