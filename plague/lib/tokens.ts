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
	LESS_THAN, // `<`
	GREATER_THAN, // `>`
	EXCLAMATION, // `!`
	IS, // `==` or `is`
	NOT, //`!=` or `not`
	AND, // `&&` or `and`
	OR, // `||` or `or`

	CAST, // as

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
	QUESTION_MARK,

	EOF,
	COMMENT,
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

export interface CommentToken extends BaseToken<undefined, TokenType.COMMENT> {
	value: string;
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
		| TokenType.IS
		| TokenType.NOT
		| TokenType.EXCLAMATION
		| TokenType.CAST
		| TokenType.LESS_THAN
		| TokenType.GREATER_THAN
	> {
	value: string;
}

export interface EOFToken extends BaseToken<undefined, TokenType.EOF> {}

export interface PunctuationToken
	extends BaseToken<
		TokenGroup.PUNCTUATION,
		| TokenType.COMMA
		| TokenType.DOT
		| TokenType.COLON
		| TokenType.SEMICOLON
		| TokenType.NEWLINE
		| TokenType.INDENT
		| TokenType.QUESTION_MARK
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
	| CommentToken
	| StringToken
	| NumberToken
	| BooleanToken
	| OperatorToken
	| IdentifierToken
	| PunctuationToken
	| DelimiterToken
	| EOFToken;
