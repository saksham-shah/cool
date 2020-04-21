const Class = require('../../ast/class');
const Func = require('../../ast/func');
const FunctionCall = require('../../ast/functioncall');
const NativeExpression = require('../../ast/nativeexpression');
const Reference = require('../../ast/reference');
const This = require('../../ast/this');

const Evaluator = require('../../interpreter/evaluator');

const Obj = require('../object');
const Types = require('../../types/types');

const TokenType = require('../../lexer/tokenType');

// Undefined Class - used for all errors and is probably the most unique thing about Cool
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Undefined;

        this.superClass = new Reference(Types.Object);
    }
}