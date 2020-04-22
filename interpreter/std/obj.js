const Class = require('../../ast/class');
const Func = require('../../ast/func');
const NativeExpression = require('../../ast/nativeexpression');
const NumberLiteral = require('../../ast/number');

const Evaluator = require('../../interpreter/evaluator');

const Obj = require('../object');
const Types = require('../../types/types');

const TokenType = require('../../lexer/tokenType');

// The base Object Class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Object;

        this.statics.set('hello', new NumberLiteral(5));
        this.statics.set('bye', new NumberLiteral(3));

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            let type = context.self.type == undefined ? 'Object' : context.self.type;

            let str = Evaluator.create(context, Types.String);

            if (context.self.address != undefined) {
                str.set('value', `<${type}@${context.self.address}>`);
            } else {
                str.set('value', `<unstored ${type}>`);
            }

            return str;
        })));
    }
}