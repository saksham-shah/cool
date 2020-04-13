const AstBase = require('./astbase');

module.exports = class extends AstBase {
    constructor() {
        super();
    }

    isExpression() {
        return true;
    }

    isArrayLiteral() {
        return false;
    }

    isAssignment() {
        return false;
    }

    isBinaryExpression() {
        return false;
    }

    isBlock() {
        return false;
    }

    isBooleanLiteral() {
        return false;
    }

    isClass() {
        return false;
    }

    isFunction() {
        return false;
    }

    isFunctionCall() {
        return false;
    }

    isIfElse() {
        return false;
    }

    isNumberLiteral() {
        return false;
    }

    isNativeExpression() {
        return false;
    }

    isReference() {
        return false;
    }

    isStringLiteral() {
        return false;
    }

    isThis() {
        return false;
    }

    isUnaryExpression() {
        return false;
    }

    isWhile() {
        return false;
    }
}