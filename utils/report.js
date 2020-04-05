// Utility class for error reporting
module.exports = class {
    static error(message, line, column, file = '') {
        if (line == undefined && column == undefined) return message;
        return `${file}:${line}:${column}: ${message}`;
    }
}