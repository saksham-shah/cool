const Expression = require('../ast/expression');
const FunctionCall = require('../ast/functioncall');

const Obj = require('./object');
const Types = require('../types/types');

const Report = require('../utils/report');

module.exports = class {
    constructor() {

    }

    // RETURNS: Obj (an Object in Cool)
    static evaluate(context, expression) {
        if (expression.isAssignment()) {
            return this.evaluateAssignment(context, expression);
        }

        if (expression.isBinaryExpression()) {
            return this.evaluateBinaryExpression(context, expression);
        }

        if (expression.isBlock()) {
            return this.evaluateBlock(context, expression);
        }

        if (expression.isFunctionCall()) {
            return this.evaluateFunctionCall(context, expression);
        }

        if (expression.isNumberLiteral()) {
            return this.evaluateNumberLiteral(context, expression);
        }

        if (expression.isNativeExpression()) {
            return this.evaluateNativeExpression(context, expression);
        }

        if (expression.isReference()) {
            return this.evaluateReference(context, expression);
        }

        if (expression.isUnaryExpression()) {
            return this.evaluateUnaryExpression(context, expression);
        }
    }

    static evaluateAssignment(context, assignment) {
        let value = this.evaluate(context, assignment.value);

        context.environment.setValue(assignment.identifier, value);

        return value;
    }

    static evaluateBinaryExpression(context, expression) {
        let call = new FunctionCall(expression.left, expression.operator, [expression.right]);
        call.copyLocation(expression);
        return this.evaluateFunctionCall(context, call);
    }

    static evaluateBlock(context, block) {
        let latest = Obj.create(context, Types.Undefined);

        context.environment.enterScope();

        for (let expression of block.expressions) {
            latest = this.evaluate(context, expression);
        }

        context.environment.exitScope();

        return latest;
    }

    static evaluateFunctionCall(context, call) {
        let object, func;

        if (call.object != undefined) {
            object = this.evaluate(context, call.object);
            func = object.getFunction(call.name);
        } else {
            object = context.self;
            func = context.environment.getValue(call.name);
        }

        // Very messy code, need to standardise this rather than use awkward if statements
        if (func == undefined) {
            throw new Error(Report.error(`Function '${call.name}' does not exist in current scope`, call.line, call.column, call.file));
        }

        if (func instanceof Obj) {
            if (func.type != Types.Function) {
                console.log(func);
                throw new Error(Report.error(`${call.name} is not a function`, call.line, call.column, call.file));
            }

            func = func.getProperty('function');
        } 

        return this.evaluateFunctionCallImpl(context, object, func, call);
    }

    static evaluateFunctionCallImpl(context, object, func, call) {
        let argObjects = [];

        for (let i = 0; i < func.params.length; i++) {
            let thisArgument;
            if (i >= call.args.length) {
                thisArgument = Obj.create(context, Types.Undefined);
            } else {
                thisArgument = this.evaluate(context, call.args[i]);
            }
            argObjects.push(thisArgument);
            // context.environment.setValue(func.params[i], thisArgument);
        }

        context.environment.enterScope();

        for (let i = 0; i < func.params.length; i++) {
            context.environment.setValue(func.params[i], argObjects[i]);
        }

        let self = context.self;
        context.self = object;

        let value = this.evaluate(context, func.body);

        context.environment.exitScope();

        context.self = self;

        return value;
    }

    static evaluateNumberLiteral(context, number) {
        let obj = Obj.create(context, Types.Int);
        obj.setProperty('value', number.value);
        return obj;
    }

    static evaluateNativeExpression(context, expression) {
        return expression.func(context);
    }

    static evaluateReference(context, reference) {
        let value = context.environment.getValue(reference.identifier);

        if (value instanceof Expression) {
            value = this.evaluate(context, value);
        }

        return value;
    }

    static evaluateUnaryExpression(context, expression) {
        let call = new FunctionCall(expression.expression, 'unary_' + expression.operator);
        return this.evaluateFunctionCall(context, call);
    }
}