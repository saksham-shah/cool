const Lexer = require('../lexer/lexer')
const TokenType = require('../lexer/tokenType');

// Expressions
const ArrayLiteral = require('../ast/array');
const Assignment = require('../ast/assignment');
const BinaryExpression = require('../ast/binaryexpression');
const Block = require('../ast/block');
const BooleanLiteral = require('../ast/boolean');
const FunctionCall = require('../ast/functioncall');
const IfElse = require('../ast/ifelse');
const NumberLiteral = require('../ast/number');
const Reference = require('../ast/reference');
const StringLiteral = require('../ast/string');
const UnaryExpression = require('../ast/unaryexpression');
const While = require('../ast/while');

// Definitions
const Extract = require('../ast/extract');

const Report = require('../utils/report');

// Parser takes a text input and uses a Lexer to generate tokens
// Tokens are parsed into Expressions
module.exports = class {
    constructor(input, file) {
        this.lexer = new Lexer(input, file);
        this.currentToken = this.lexer.nextToken();
    }

    // Base parse function - parses the next value (e.g. (1+3), "hi", -6.5, x=4, this)
    // RETURNS: Expression
    parseValue() {
        let token = this.currentToken;

        if (this.isNext(TokenType.Endofinput)) {
            throw new Error(Report.error(`Unexpected end of input`, token.line, token.column, token.file));
        }

        let value = null;

        if (this.isNext(TokenType.Number)) {
            value = new NumberLiteral(this.expect(TokenType.Number).value);

        } else if (this.isNext(TokenType.String)) {
            value = new StringLiteral(this.expect(TokenType.String).value);

        } else if (this.isNext(TokenType.True, TokenType.False)) {
            value = new BooleanLiteral(this.currentToken.type == TokenType.True);

            this.currentToken = this.lexer.nextToken();

        } else if (this.isNext(TokenType.If)) {
            value = this.parseIfElse();

        } else if (this.isNext(TokenType.While)) {
            value = this.parseWhile();

        } else if (this.unaryOperatorIsNext()) {
            let operator = token.value;
            this.currentToken = this.lexer.nextToken();

            value = new UnaryExpression(operator, this.parseValue());

        } else if (this.isNext(TokenType.OpenBracket)) {
            value = this.parseBracket();

        } else if (this.isNext(TokenType.OpenSquare)) {
            value = this.parseArray();

        } else if (this.isNext(TokenType.OpenBrace)) {
            value = this.parseBlock();

        } else if (this.isNext(TokenType.Identifier)) {
            let nextToken = this.lexer.lookahead();

            // Parses according to the next token
            if (this.tokenIsAssignment(nextToken)) {
                value = this.parseAssignment();
            } else if (nextToken.type == TokenType.OpenBracket) {
                value = this.parseFunctionCall();
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

    // Converts the entire program into a Block Expression
    // RETURNS: Block Expression
    parseProgram() {
        let token = this.currentToken;

        let expressions = [];
        let definitions = [];

        while (!this.isNext(TokenType.Endofinput)) {
            let ast = this.parseAnything();
            if (ast.isExpression()) {
                expressions.push(ast);
            } else {
                definitions.push(ast);
            }
            // expressions.push(this.parseAnything());
        }

        let block = new Block(expressions, definitions);

        block.copyLocation(token);

        return block;
    }

    // Gets a binary expression, e.g. 3 + 5, -8 * 10
    
    // operatorIsNext checks if a particular operator (e.g. addition: + or -) is next
    
    // levelUp is a function which parses an expression which has a higher priority
    // than the operator in operatorIsNext
    // E.g. if operatorIsNext was about addition, levelUp would be multiplication

    // RETURNS: Binary Expression
    parseBinaryExpression(operatorIsNext, levelUp) {
        let token = this.currentToken;

        // Parse the higher priority expression first
        let left = levelUp.apply(this);

        // Make a chain of this operator - e.g. 1 + 2*3 + 4 + (5) + ...
        while(operatorIsNext.apply(this)) {
            let operator = this.currentToken.value;

            this.currentToken = this.lexer.nextToken();

            // Parse the higher priority expression on the right side
            let right = levelUp.apply(this);

            // Kind of recursion? Binary Expressions within Binary Expressions
            left = new BinaryExpression(left, operator, right);
        }

        left.copyLocation(token);

        return left;
    }

    // Another base parse function - parses an expression instead of a value (e.g. 3 + 5)
    // For the above, parseValue would parse the number 3 and ignore the addition expression
    // RETURNS: Expression
    parseExpression() {
        return this.parseOr();
    }

    // Checks if a definition is next and parses appropriately
    // RETURNS: Expression or Definition
    parseAnything() {
        let token = this.currentToken;
        let value = null;
        if (this.isNext(TokenType.Extract)) {
            this.expect(TokenType.Extract);
            let classToExtract = this.parseProperty();
            value = new Extract(classToExtract);
        }

        if (value == null) {
            value = this.parseExpression();
        } else {
            value.copyLocation(token);
        }

        return value;
    }

    // RETURNS: Expression
    // parseBooleanExpression() {
    //     return this.parseBinaryExpression(this.booleanIsNext, this.parseComparison);
    // }

    // UNUSED
    // RETURNS: Expression
    parseBooleanExpression() {
        return this.parseBinaryExpression(this.booleanIsNext, this.parseOr);
    }

    // Currently the lowest priority operation
    // RETURNS: Expression
    parseOr() {
        return this.parseBinaryExpression(this.orIsNext, this.parseAnd);
    }

    // RETURNS: Expression
    parseAnd() {
        return this.parseBinaryExpression(this.andIsNext, this.parseComparison);
    }

    // Similar to the above
    // RETURNS: Expression
    parseComparison() {
        return this.parseBinaryExpression(this.comparisonIsNext, this.parseAddition);
    }

    // RETURNS: Expression
    parseAddition() {
        return this.parseBinaryExpression(this.additionIsNext, this.parseMultiplication);
    }

    // RETURNS: Expression
    parseMultiplication() {
        return this.parseBinaryExpression(this.multiplicationIsNext, this.parseProperty);
    }

    // Currently the highest priority 'operation'
    // Handles dots - e.g. Console.print
    // Handles square bracket properties - e.g. array[7]
    // The only thing higher up is parseValue which deals with things like brackets
    // RETURNS: Expression
    parseProperty() {
        let value = this.parseValue();

        while (this.isNext(TokenType.Dot, TokenType.OpenSquare)) {
            if (this.isNext(TokenType.Dot)) {
                this.expect(TokenType.Dot);

                let nextToken = this.lexer.lookahead();

                // Parses according to the next token
                if (nextToken.type == TokenType.Equal) {
                    value = this.parseAssignment(value);
                } else if (nextToken.type == TokenType.OpenBracket) {
                    value = this.parseFunctionCall(value);
                } else {
                    value = new Reference(this.expect(TokenType.Identifier).value, value);
                }
            } else {
                this.expect(TokenType.OpenSquare);
                // Any expression can be inside the square brackets
                let expr = this.parseExpression();
                this.expect(TokenType.CloseSquare);
    
                let token = this.currentToken;
    
                // Parses according to the next token
                // Sends an expression to be used as the identifier or function Name
                if (token.type == TokenType.Equal) {
                    value = this.parseAssignment(value, expr);
                } else if (token.type == TokenType.OpenBracket) {
                    value = this.parseFunctionCall(value, expr);
                } else {
                    value = new Reference(expr, value);
                }
            }
        }

        return value;
    }

    // RETURNS: ArrayLiteral Expression
    parseArray() {
        let token = this.currentToken;

        this.expect(TokenType.OpenSquare);

        let items = [];

        // Keep pushing items to the array
        while(!this.isNext(TokenType.CloseSquare)) {
            items.push(this.parseExpression());
            
            if (!this.isNext(TokenType.CloseSquare)) {
                this.expect(TokenType.Comma);
            }
        }

        this.expect(TokenType.CloseSquare);

        let array = new ArrayLiteral(items);
        array.copyLocation(token);

        return array;
    }
   
    // RETURNS: Assignment Expression
    parseAssignment(object, identifier) {
        if (identifier == undefined) {
            identifier = this.expect(TokenType.Identifier).value;
        }

        let operator = this.currentToken.value;

        this.currentToken = this.lexer.nextToken();

        return new Assignment(identifier, operator, this.parseExpression(), object);
    }

    // RETURNS: Block Expression
    parseBlock() {
        let token = this.currentToken;

        this.expect(TokenType.OpenBrace);

        let expressions = [];
        let definitions = [];

        while (!this.isNext(TokenType.CloseBrace)) {
            let ast = this.parseAnything();
            if (ast.isExpression()) {
                expressions.push(ast);
            } else {
                definitions.push(ast);
            }
        }

        this.expect(TokenType.CloseBrace);

        let block = new Block(expressions, definitions);

        block.copyLocation(token);

        return block;
    }

    // RETURNS: Expression
    parseBracket() {
        this.expect(TokenType.OpenBracket);

        let expression = this.parseExpression();

        this.expect(TokenType.CloseBracket);

        return expression;
    }

    // RETURNS: Function Call Expression
    parseFunctionCall(object, functionName) {
        let token = this.currentToken;

        if (functionName == undefined) {
            functionName = this.expect(TokenType.Identifier).value;
        }

        let args = this.parseArguments();

        let func = new FunctionCall(object, functionName, args);
        
        func.copyLocation(token);

        return func;
    }

    // Parses arguments for functions
    // RETURNS: array of Expressions
    parseArguments() {
        this.expect(TokenType.OpenBracket);

        let args = [];

        // Similar to parseArray
        while(!this.isNext(TokenType.CloseBracket)) {
            args.push(this.parseExpression());
            
            if (!this.isNext(TokenType.CloseBracket)) {
                this.expect(TokenType.Comma);
            }
        }

        this.expect(TokenType.CloseBracket);

        return args;
    }

    parseIfElse() {
        let token = this.currentToken;

        this.expect(TokenType.If);

        let condition = this.parseExpression();
        let thenBlock = this.parseExpression();
        let elseBlock = undefined;

        if (this.isNext(TokenType.Else)) {
            this.expect(TokenType.Else);
            elseBlock = this.parseExpression();
        }

        let ifElse =  new IfElse(condition, thenBlock, elseBlock);

        ifElse.copyLocation(token);

        return ifElse;
    }

    parseWhile() {
        let token = this.currentToken;

        this.expect(TokenType.While);

        let condition = this.parseExpression();
        let body = this.parseExpression();

        let whileExpr =  new While(condition, body);

        whileExpr.copyLocation(token);

        return whileExpr;
    }

    // Checks whether the next token is a particular type
    // RETURNS: Boolean
    isNext(...tokenTypes) {
        return tokenTypes.indexOf(this.currentToken.type) >= 0;
    }

    // Checks whether the next token is a particular type
    // If it isn't, throws an error
    // Used when only a particular token would be acceptable (e.g. closing brackets after opening them)
    // RETURNS: Token
    expect(tokenType) {
        let token = this.currentToken;

        if (token.type !== tokenType) {
            throw new Error(Report.error(`Expected ${tokenType} but instead received ${token.type}`, token.line, token.column, token.file));
        }

        // Moves to the next token
        this.currentToken = this.lexer.nextToken();

        return token;
    }

    // The below functions check if particular operators are next
    // RETURNS: Boolean

    booleanIsNext() {
        return this.isNext(TokenType.DoubleEquals, TokenType.NotEqual);
    }

    orIsNext() {
        return this.isNext(TokenType.Or);
    }

    andIsNext() {
        return this.isNext(TokenType.And);
    }

    comparisonIsNext() {
        return this.isNext(TokenType.DoubleEquals, TokenType.NotEqual, TokenType.GreaterThan, TokenType.GreaterThanOrEqual, TokenType.LessThan, TokenType.LessThanOrEqual);
    }

    additionIsNext() {
        return this.isNext(TokenType.Plus, TokenType.Minus);
    }

    multiplicationIsNext() {
        return this.isNext(TokenType.Times, TokenType.Divide, TokenType.Mod);
    }

    unaryOperatorIsNext() {
        return this.isNext(TokenType.Plus, TokenType.Minus, TokenType.Not);
    }

    // Similar to the above, but assignment operators are detected slightly differently
    // RETURNS: Boolean
    tokenIsAssignment(token) {
        return token.type === TokenType.Equal || token.type === TokenType.PlusEqual
            || token.type === TokenType.MinusEqual || token.type === TokenType.TimesEqual
            || token.type === TokenType.DivideEqual || token.type === TokenType.ModEqual
    }
}