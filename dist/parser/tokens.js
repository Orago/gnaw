export var TokenGroup = /*#__PURE__*/ function(TokenGroup) {
    TokenGroup["KEYWORD"] = "keyword";
    TokenGroup["OPERATOR"] = "operator";
    TokenGroup["STRING"] = "string";
    TokenGroup["NUMBER"] = "number";
    TokenGroup["BOOLEAN"] = "bool";
    // SEPARATOR = "seperator",
    TokenGroup["IDENTIFIER"] = "identifier";
    TokenGroup["PUNCTUATION"] = "punctuation";
    TokenGroup["DELIMITER"] = "delimiter";
    return TokenGroup;
}({});
export var TokenType = /*#__PURE__*/ function(TokenType) {
    // literals
    TokenType[TokenType["NUMBER"] = 0] = "NUMBER";
    TokenType[TokenType["STRING"] = 1] = "STRING";
    TokenType[TokenType["IDENTIFIER"] = 2] = "IDENTIFIER";
    // keywords
    TokenType[TokenType["KEYWORD"] = 3] = "KEYWORD";
    // BOOLEAN,
    // operators
    TokenType[TokenType["PLUS"] = 4] = "PLUS";
    TokenType[TokenType["MINUS"] = 5] = "MINUS";
    TokenType[TokenType["STAR"] = 6] = "STAR";
    TokenType[TokenType["SLASH"] = 7] = "SLASH";
    TokenType[TokenType["EQUAL"] = 8] = "EQUAL";
    TokenType[TokenType["LESS_THAN"] = 9] = "LESS_THAN";
    TokenType[TokenType["GREATER_THAN"] = 10] = "GREATER_THAN";
    TokenType[TokenType["EXCLAMATION"] = 11] = "EXCLAMATION";
    TokenType[TokenType["IS"] = 12] = "IS";
    TokenType[TokenType["NOT"] = 13] = "NOT";
    TokenType[TokenType["AND"] = 14] = "AND";
    TokenType[TokenType["OR"] = 15] = "OR";
    TokenType[TokenType["CAST"] = 16] = "CAST";
    // grouping
    TokenType[TokenType["PAREN_LEFT"] = 17] = "PAREN_LEFT";
    TokenType[TokenType["PAREN_RIGHT"] = 18] = "PAREN_RIGHT";
    TokenType[TokenType["BRACE_LEFT"] = 19] = "BRACE_LEFT";
    TokenType[TokenType["BRACE_RIGHT"] = 20] = "BRACE_RIGHT";
    TokenType[TokenType["BRACKET_LEFT"] = 21] = "BRACKET_LEFT";
    TokenType[TokenType["BRACKET_RIGHT"] = 22] = "BRACKET_RIGHT";
    // punctuation
    TokenType[TokenType["COMMA"] = 23] = "COMMA";
    TokenType[TokenType["DOT"] = 24] = "DOT";
    TokenType[TokenType["COLON"] = 25] = "COLON";
    TokenType[TokenType["SEMICOLON"] = 26] = "SEMICOLON";
    TokenType[TokenType["NEWLINE"] = 27] = "NEWLINE";
    TokenType[TokenType["INDENT"] = 28] = "INDENT";
    TokenType[TokenType["QUESTION_MARK"] = 29] = "QUESTION_MARK";
    TokenType[TokenType["EOF"] = 30] = "EOF";
    TokenType[TokenType["COMMENT"] = 31] = "COMMENT";
    return TokenType;
}({});
