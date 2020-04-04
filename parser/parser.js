const Lexer = require('../lexer/lexer')
const TokenType = require('../lexer/tokenType');

const Assignment = require('../ast/assignment');
const BinaryExpression = require('../ast/binaryexpression');
const Block = require('../ast/block');
const IntegerLiteral = require('../ast/integer');
const Reference = require('../ast/reference');
const UnaryExpression = require('../ast/unaryexpression');

const Report = require('../utils/report');

// const BinaryExpression;
// const BinaryExpression;
// const BinaryExpression;
// const BinaryExpression;

module.exports = class {
    constructor(input, file) {
        this.lexer = new Lexer(input, file);
        this.currentToken = this.lexer.nextToken();
    }

    test() {
        while (!this.isNext(TokenType.Endofinput)) {
            console.log(this.parseValue());
        }
    }

    parseValue() {
        let token = this.currentToken;

        if (this.isNext(TokenType.Endofinput)) {
            throw new Error(Report.error(`Unexpected end of input`, token.line, token.column, token.file));
        }

        let value = null;

        if (this.isNext(TokenType.Number)) {
            value = new IntegerLiteral(this.expect(TokenType.Number).value);

        } else if (this.unaryOperatorIsNext()) {
            let operator = token.value;
            this.currentToken = this.lexer.nextToken();

            value = new UnaryExpression(operator, this.parseValue());

        } else if (this.isNext(TokenType.OpenBracket)) {
            value = this.parseBracket();

        } else if (this.isNext(TokenType.Identifier)) {
            let nextToken = this.lexer.lookahead();

            if (nextToken.type == TokenType.Equal) {
                value = this.parseAssignment();
            } else {
                value = new Reference(this.expect(TokenType.Identifier).value);
            }
        }

        if (value === null) {
            throw new Error(Report.error(`Unexpected '${token.value}'`, token.line, token.column, token.file));
        }

        value.copyLocation(token);

        return value;
    }

    parseProgram() {
        let token = this.currentToken;

        let expressions = [];
        while (!this.isNext(TokenType.Endofinput)) {
            expressions.push(this.parseExpression());
        }

        let block = new Block(expressions);

        block.copyLocation(token);

        return block;
    }

    parseBinaryExpression(operatorIsNext, levelUp) {
        let token = this.currentToken;

        let left = levelUp.apply(this);

        while(operatorIsNext.apply(this)) {
            let operator = this.currentToken.value;

            this.currentToken = this.lexer.nextToken();

            let right = levelUp.apply(this);

            left = new BinaryExpression(left, operator, right);
        }

        left.copyLocation(token);

        return left;
    }

    parseExpression() {
        return this.parseAddition();
    }

    parseAddition() {
        return this.parseBinaryExpression(this.additionIsNext, this.parseMultiplication);
    }

    parseMultiplication() {
        return this.parseBinaryExpression(this.multiplicationIsNext, this.parseValue);
    }

    parseAssignment() {     
        let identifier = this.expect(TokenType.Identifier).value;

        let operator = this.currentToken.value;

        this.currentToken = this.lexer.nextToken();

        return new Assignment(identifier, operator, this.parseExpression());
    }

    parseBracket() {
        this.expect(TokenType.OpenBracket);

        let expression = this.parseExpression();

        this.expect(TokenType.CloseBracket);

        return expression;
    }

    isNext(...tokenTypes) {
        return tokenTypes.indexOf(this.currentToken.type) >= 0;
    }

    expect(tokenType) {
        let token = this.currentToken;

        if (token.type !== tokenType) {
            throw new Error(Report.error(`Expected ${tokenType} but instead received ${token.type}`), token.line, token.column, token.file);
        }

        this.currentToken = this.lexer.nextToken();

        return token;
    }

    additionIsNext() {
        return this.isNext(TokenType.Plus, TokenType.Minus);
    }

    multiplicationIsNext() {
        return this.isNext(TokenType.Times, TokenType.Divide);
    }

    unaryOperatorIsNext() {
        return this.isNext(TokenType.Plus, TokenType.Minus);
    }
}