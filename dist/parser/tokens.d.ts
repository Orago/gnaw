export declare enum TokenGroup {
    KEYWORD = "keyword",
    OPERATOR = "operator",
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "bool",
    IDENTIFIER = "identifier",
    PUNCTUATION = "punctuation",
    DELIMITER = "delimiter"
}
export declare enum TokenType {
    NUMBER = 0,
    STRING = 1,
    IDENTIFIER = 2,
    KEYWORD = 3,
    PLUS = 4,
    MINUS = 5,
    STAR = 6,
    SLASH = 7,
    EQUAL = 8,
    LESS_THAN = 9,
    GREATER_THAN = 10,
    EXCLAMATION = 11,
    IS = 12,
    NOT = 13,
    AND = 14,
    OR = 15,
    CAST = 16,
    PAREN_LEFT = 17,
    PAREN_RIGHT = 18,
    BRACE_LEFT = 19,
    BRACE_RIGHT = 20,
    BRACKET_LEFT = 21,
    BRACKET_RIGHT = 22,
    COMMA = 23,
    DOT = 24,
    COLON = 25,
    SEMICOLON = 26,
    NEWLINE = 27,
    INDENT = 28,
    QUESTION_MARK = 29,
    EOF = 30,
    COMMENT = 31
}
export interface BaseToken<Group extends TokenGroup | undefined, Type extends TokenType> {
    group?: Group;
    type: Type;
    raw: string;
}
export interface CommentToken extends BaseToken<undefined, TokenType.COMMENT> {
    value: string;
}
export interface StringToken extends BaseToken<undefined, TokenType.STRING> {
    value: string;
}
export interface NumberToken extends BaseToken<undefined, TokenType.NUMBER> {
    value: number;
}
export interface BooleanToken extends BaseToken<TokenGroup.BOOLEAN, TokenType.NUMBER> {
    value: 0 | 1;
}
export interface IdentifierToken extends BaseToken<undefined, TokenType.IDENTIFIER> {
    value: string;
}
export interface OperatorToken extends BaseToken<TokenGroup.OPERATOR, TokenType.PLUS | TokenType.MINUS | TokenType.STAR | TokenType.SLASH | TokenType.EQUAL | TokenType.IS | TokenType.NOT | TokenType.EXCLAMATION | TokenType.CAST | TokenType.LESS_THAN | TokenType.GREATER_THAN> {
    value: string;
}
export interface EOFToken extends BaseToken<undefined, TokenType.EOF> {
}
export interface PunctuationToken extends BaseToken<TokenGroup.PUNCTUATION, TokenType.COMMA | TokenType.DOT | TokenType.COLON | TokenType.SEMICOLON | TokenType.NEWLINE | TokenType.INDENT | TokenType.QUESTION_MARK> {
    value: string;
}
export interface DelimiterToken extends BaseToken<TokenGroup.DELIMITER, TokenType.PAREN_LEFT | TokenType.PAREN_RIGHT | TokenType.BRACE_LEFT | TokenType.BRACE_RIGHT | TokenType.BRACKET_LEFT | TokenType.BRACKET_RIGHT | TokenType.NEWLINE | TokenType.INDENT> {
    value: string;
    level?: number;
}
export type AnyToken = CommentToken | StringToken | NumberToken | BooleanToken | OperatorToken | IdentifierToken | PunctuationToken | DelimiterToken | EOFToken;
export type TokenOf<T extends TokenType> = Extract<AnyToken, {
    type: T;
}>;
