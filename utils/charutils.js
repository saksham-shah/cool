module.exports = class {

    // a-z, A-Z
    static isLetter(char) {
        let code = char.charCodeAt(0);
        return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
    }

    // 0-9
    static isDigit(char) {
        let code = char.charCodeAt(0);
        return code >= 48 && code <= 57;
    }

    static isEquals(char) {
        return char === '=';
    }

    static isDot(char) {
        return char === '.';
    }

    static isComma(char) {
        return char === ',';
    }

    static isOperator(char) {
        return char === '=' || char === '+' || char === '-' || char === '*' || char === '/' || char === '!' || char === '>' || char === '<';
    }

    static isBracket(char) {
        return char === '(' || char === ')';
    }

    static isSpace(char) {
        return char === ' ';
    }

    static isNewline(char) {
        return char === '\n' || char === '\r\n';
    }

    // Uses regex to find whitespace
    static isWhitespace(char) {
        return /[ \n\t\r\f\v\u00A0\u2028\u2029]/.test(char);
    }

    static isStringMark(char) {
        return char === "\"" || char === "\'";
    }
}