function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
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
    TokenType[TokenType["BOOLEAN"] = 2] = "BOOLEAN";
    TokenType[TokenType["IDENTIFIER"] = 3] = "IDENTIFIER";
    // keywords
    TokenType[TokenType["KEYWORD"] = 4] = "KEYWORD";
    // BOOLEAN,
    // operators
    TokenType[TokenType["PLUS"] = 5] = "PLUS";
    TokenType[TokenType["MINUS"] = 6] = "MINUS";
    TokenType[TokenType["STAR"] = 7] = "STAR";
    TokenType[TokenType["SLASH"] = 8] = "SLASH";
    TokenType[TokenType["EQUAL"] = 9] = "EQUAL";
    TokenType[TokenType["LESS_THAN"] = 10] = "LESS_THAN";
    TokenType[TokenType["GREATER_THAN"] = 11] = "GREATER_THAN";
    TokenType[TokenType["EXCLAMATION"] = 12] = "EXCLAMATION";
    TokenType[TokenType["IS"] = 13] = "IS";
    TokenType[TokenType["NOT"] = 14] = "NOT";
    TokenType[TokenType["AND"] = 15] = "AND";
    TokenType[TokenType["OR"] = 16] = "OR";
    TokenType[TokenType["CAST"] = 17] = "CAST";
    // grouping
    TokenType[TokenType["PAREN_LEFT"] = 18] = "PAREN_LEFT";
    TokenType[TokenType["PAREN_RIGHT"] = 19] = "PAREN_RIGHT";
    TokenType[TokenType["BRACE_LEFT"] = 20] = "BRACE_LEFT";
    TokenType[TokenType["BRACE_RIGHT"] = 21] = "BRACE_RIGHT";
    TokenType[TokenType["BRACKET_LEFT"] = 22] = "BRACKET_LEFT";
    TokenType[TokenType["BRACKET_RIGHT"] = 23] = "BRACKET_RIGHT";
    // punctuation
    TokenType[TokenType["COMMA"] = 24] = "COMMA";
    TokenType[TokenType["DOT"] = 25] = "DOT";
    TokenType[TokenType["COLON"] = 26] = "COLON";
    TokenType[TokenType["SEMICOLON"] = 27] = "SEMICOLON";
    TokenType[TokenType["NEWLINE"] = 28] = "NEWLINE";
    TokenType[TokenType["INDENT"] = 29] = "INDENT";
    TokenType[TokenType["QUESTION_MARK"] = 30] = "QUESTION_MARK";
    TokenType[TokenType["EOF"] = 31] = "EOF";
    TokenType[TokenType["COMMENT"] = 32] = "COMMENT";
    return TokenType;
}({});
var _obj;
export var token_group_map = (_obj = {}, _define_property(_obj, 20, "delimiter"), _define_property(_obj, 21, "delimiter"), _define_property(_obj, 22, "delimiter"), _define_property(_obj, 23, "delimiter"), _define_property(_obj, 18, "delimiter"), _define_property(_obj, 19, "delimiter"), _define_property(_obj, 24, "punctuation"), _define_property(_obj, 25, "punctuation"), _define_property(_obj, 26, "punctuation"), _define_property(_obj, 27, "punctuation"), _define_property(_obj, 28, "punctuation"), _define_property(_obj, 29, "punctuation"), _define_property(_obj, 0, "number"), _define_property(_obj, 2, "bool"), _define_property(_obj, 17, "operator"), _define_property(_obj, 5, "operator"), _define_property(_obj, 6, "operator"), _define_property(_obj, 7, "operator"), _define_property(_obj, 8, "operator"), _define_property(_obj, 9, "operator"), _define_property(_obj, 12, "operator"), _define_property(_obj, 10, "operator"), _define_property(_obj, 11, "operator"), _obj);
