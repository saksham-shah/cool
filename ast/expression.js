const AstBase = require('./astbase');

module.exports = class extends AstBase {
    constructor() {
        super();
    }

    isExpression() {
        return true;
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

    isClass() {
        return false;
    }

    isFunction() {
        return false;
    }

    isFunctionCall() {
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

    isUnaryExpression() {
        return false;
    }
}