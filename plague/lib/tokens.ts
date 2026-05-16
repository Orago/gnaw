export enum TokenGroup {
	KEYWORD = "keyword",
	OPERATOR = "operator",
	STRING = "string",
	NUMBER = "number",
	BOOLEAN = "bool",
	// SEPARATOR = "seperator",
	IDENTIFIER = "identifier",
	PUNCTUATION = "punctuation",
	DELIMITER = "delimiter",
}

export enum TokenType {
	// literals
	NUMBER,
	STRING,
	IDENTIFIER,

	// keywords
	KEYWORD,
	// BOOLEAN,

	// operators
	PLUS, // `+`
	MINUS, // `-`
	STAR, // `*`
	SLASH, // `/`
	EQUAL, // `=`
	GREATER_THAN, // `>`
	LESS_THAN, // `<`
	EXCLAMATION, // `!`

	// grouping
	PAREN_LEFT, // `)`
	PAREN_RIGHT, // `)`
	BRACE_LEFT, // `{`
	BRACE_RIGHT, // `}`
	BRACKET_LEFT, // `[`
	BRACKET_RIGHT, // `]`

	// punctuation
	COMMA, // `,`
	DOT, // `.`
	COLON, // .
	SEMICOLON, // `;`
	NEWLINE, // `\n`
	INDENT, // `\t`

	EOF,
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

export interface BaseToken<
	Group extends TokenGroup | undefined,
	Type extends TokenType
> {
	group?: Group;
	type: Type;
	raw: string;
	// value: string;
}

export interface StringToken extends BaseToken<undefined, TokenType.STRING> {
	value: string;
}

export interface NumberToken extends BaseToken<undefined, TokenType.NUMBER> {
	value: number;
}

export interface BooleanToken
	extends BaseToken<TokenGroup.BOOLEAN, TokenType.NUMBER> {
	value: 0 | 1;
}

export interface IdentifierToken
	extends BaseToken<undefined, TokenType.IDENTIFIER> {
	value: string;
}

export interface OperatorToken
	extends BaseToken<
		TokenGroup.OPERATOR,
		| TokenType.PLUS
		| TokenType.MINUS
		| TokenType.STAR
		| TokenType.SLASH
		| TokenType.EQUAL
	> {
	value: string;
}

export interface PunctuationToken
	extends BaseToken<
		TokenGroup.PUNCTUATION,
		| TokenType.COMMA
		| TokenType.DOT
		| TokenType.COLON
		| TokenType.SEMICOLON
		| TokenType.NEWLINE
		| TokenType.INDENT
	> {
	value: string;
}

export interface DelimiterToken
	extends BaseToken<
		TokenGroup.DELIMITER,
		| TokenType.PAREN_LEFT
		| TokenType.PAREN_RIGHT
		| TokenType.BRACE_LEFT
		| TokenType.BRACE_RIGHT
		| TokenType.BRACKET_LEFT
		| TokenType.BRACKET_RIGHT
		| TokenType.NEWLINE
		| TokenType.INDENT
	> {
	// subset?: SeparatorTokenType;
	value: string;
	level?: number;
}

export type AnyToken =
	| StringToken
	| NumberToken
	| BooleanToken
	| OperatorToken
	| IdentifierToken
	| PunctuationToken
	| DelimiterToken;
