// Utility class for error reporting
module.exports = class Report {
    static error(message, line, column, file = '') {
        if (line == undefined && column == undefined) return message;
        return `${file}:${line}:${column}: ${message}`;
    }

    static throwError(message, line, column, file = '') {
        throw new Error(Report.error(message, line, column, file));
    }
}