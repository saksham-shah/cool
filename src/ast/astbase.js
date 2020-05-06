module.exports = class {
    constructor() {
        this.line = -1;
        this.column = -1;
        this.file = '';
    }

    copyLocation(otherBase) {
        this.line = otherBase.line;
        this.column = otherBase.column;
        this.file = otherBase.file;
    }

    isDefinition() {
        return false;
    }

    isExpression() {
        return false;
    }
}