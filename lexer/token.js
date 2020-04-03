module.exports = class {
    constructor(type, value, line, column, file) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
        this.file = file;
    }
}