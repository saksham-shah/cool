// Possible tokens in Cool
module.exports = {
    // Literals
    String: 'STRING',
    Number: 'NUMBER',
    Identifier: 'IDENTIFIER',

    // Operators
    
    // Arithmetic
    Plus: '+',
    Minus: '-',
    Times: '*',
    Divide: '/',
    Mod: '%',

    // Assignment
    Equal: '=',
    PlusEqual: '+=',
    MinusEqual: '-=',
    TimesEqual: '*=',
    DivideEqual: '/=',
    ModEqual: '%=',

    // Increment
    PlusPlus: '++',
    MinusMinus: '--',

    // Comparison
    DoubleEquals: '==',
    NotEqual: '!=',
    Not: '!',

    GreaterThan: '>',
    LessThan: '<',
    GreaterThanOrEqual: '>=',
    LessThanOrEqual: '<=',

    // Brackets
    OpenBracket: '(',
    CloseBracket: ')',
    OpenSquare: '[',
    CloseSquare: ']',
    OpenBrace: '{',
    CloseBrace: '}',

    // Other
    Dot: '.',
    Comma: ',',

    // Keywords
    // Var: 'var',
    True: 'yes',
    False: 'no',
    And: 'and',
    Or: 'or',

    End: 'end',
    If: 'if',
    Else: 'else',
    While: 'while',
    For: 'for',

    Undefined: 'Undefined',

    Extract: 'extract',

    // Special
    Newline: 'new line',
    Endofinput: 'end of input'
}