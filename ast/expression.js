module.exports = class {
    constructor() {
        this.line = -1;
        this.column = -1;
        this.file = '';
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

    isIntegerLiteral() {
        return false;
    }

    isReference() {
        return false;
    }

    isUnaryExpression() {
        return false;
    }
}