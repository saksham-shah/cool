const Class = require('../../ast/class');
const Func = require('../../ast/func');
const NativeExpression = require('../../ast/nativeexpression');
const Reference = require('../../ast/reference');

const Obj = require('../object');
const Types = require('../../types/types');

// Function Class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Function;

        this.superClass = new Reference(Types.Object);

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            let str = Obj.create(context, Types.String);
            str.setProperty('.value', '<Function>' + context.self.getProperty('.name'));
            return str;
        })));

        // May later have methods like 'bind' and 'apply'

        // Maybe async in the future?
    }
}