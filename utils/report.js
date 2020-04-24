// Utility class for error reporting
module.exports = class Report {
    static latestObj = undefined;
    
    static err(message, line, column, file = '') {
        console.log("Illegal error");
        if (line == undefined && column == undefined) return message;
        return `${file}:${line}:${column}: ${message}`;
    }

    static throwError(message, line, column, file = '') {
        console.log("Illegal error");
        throw new Error(Report.error(message, line, column, file));
    }

    static error(message, obj) {
        if (obj == undefined) {
            obj = Report.latestObj;
        }

        if (obj != undefined) {
            message = `${obj.file}:${obj.line}:${obj.column}: ${message}`;
        }

        throw new Error(message);
    }
}