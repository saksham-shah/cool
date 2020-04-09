const Class = require('../../ast/class');
const Func = require('../../ast/func');
const NativeExpression = require('../../ast/nativeexpression');

const Obj = require('../object');
const Types = require('../../types/types');

// The base Object Class
module.exports = class extends Class {
    constructor() {
        super();

        this.name = Types.Object;

        this.functions.set('toString', new Func('toString', [], new NativeExpression(context => {
            let str = Obj.create(context, Types.String);
            str.setProperty('value', '<Object>Object')
            return str;
        })));

        // Could have methods like instanceof
    }
}