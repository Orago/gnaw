export enum TokenGroup {
		KEYWORD = "keyword",
	OPERATOR = "operator",
	STRING = "string",
	NUMBER = "number",
	BOOLEAN = "bool",
	SEPARATOR = "seperator",
	IDENTIFIER = "identifier",
	PUNCTUATION = "punctuation",
}

export enum TokenType {
	KEYWORD = "keyword",
	OPERATOR = "operator",
	STRING = "string",
	NUMBER = "number",
	BOOLEAN = "bool",
	SEPARATOR = "seperator",
	IDENTIFIER = "identifier",
	PUNCTUATION = "punctuation",
}

export enum OperatorTokenType {
	PLUS,
	MINUS,
	STAR,
	SLASH,
	EQUAL,
}

export enum SeparatorTokenType {
	LINE_END,
	NEW_LINE,
	INDENT,
	RETURN,

	// grouping
	BRACKET_LEFT,
	BRACKET_RIGHT,
	BRACE_LEFT,
	BRACE_RIGHT,
	PAREN_LEFT,
	PAREN_RIGHT,

	// punctuation
	COMMA,
	DOT,
	COLON,
	SEMICOLON,

	EOF,
}

export interface BaseToken {
	type: TokenType;
	raw: string;
	// value: string;
}

export interface StringToken extends BaseToken {
	type: TokenType.STRING;
	value: string;
}

export interface NumberToken extends BaseToken {
	type: TokenType.NUMBER;
	value: number;
}

export interface SeperatorToken extends BaseToken {
	type: TokenType.SEPARATOR;
	subset?: SeparatorTokenType;
	value: string;
	level?: number;
	line_end?: boolean;
}

export interface BooleanToken extends BaseToken {
	type: TokenType.BOOLEAN;
	value: boolean;
}

export interface IdentifierToken extends BaseToken {
	type: TokenType.IDENTIFIER;
	value: string;
}

export interface OperatorToken extends BaseToken {
	type: TokenType.OPERATOR;
	subset: OperatorTokenType;
	value: string;
}

export interface DelimiterToken extends BaseToken {}

export type AnyToken =
	| SeperatorToken
	| StringToken
	| NumberToken
	| BooleanToken
	| OperatorToken
	| IdentifierToken;
