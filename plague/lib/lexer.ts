import {
	AnyToken,
	DelimiterToken,
	OperatorToken,
	OperatorTokenType,
	PunctuationToken,
	SeparatorTokenType,
	TokenGroup,
	TokenType,
} from "./tokens.js";

export interface LanguageDictionary extends Record<string, string[]> {
	// grouping
	brace_left: string[];
	brace_right: string[];
	bracket_left: string[];
	bracket_right: string[];
	parenthesis_left: string[];
	parenthesis_right: string[];

	// punctuation
	comma: string[];
	dot: string[];
	colon: string[];
	semicolon: string[];
	newline: string[];
	indent: string[];

	// extra
	boolean_true: string[];
	boolean_false: string[];

	operators: string[];
	delimiters: string[];
}

export const default_language_dicitionary: LanguageDictionary = {
	// grouping
	brace_left: ["{"],
	brace_right: ["}"],
	bracket_left: ["["],
	bracket_right: ["]"],
	parenthesis_left: ["("],
	parenthesis_right: [")"],

	// operators
	plus: ["+"],
	minus: ["-"],
	star: ["*"],
	slash: ["/"],
	equal: ["="],
	greater_than: [">"],
	less_than: ["<"],
	exclamation: ["!"],

	// punctuation
	comma: [","],
	dot: ["."],
	colon: [":"],
	semicolon: [";"],
	newline: ["\n"],
	indent: ["\t"],

	// extra
	boolean_true: ["true"],
	boolean_false: ["false"],
	operators: ["+", "-", "<", ">", ".", ",", "/", ":"],
	delimiters: ["{", "}", "(", ")", "[", "]"],
};

class TypeHandler {
	static isNum = (num: any) => !isNaN(Number(num));

	static isA0 = (x: string) => x != undefined && /[a-z0-9]/i.test(x);
	static isA_0 = (x: string) => x != undefined && /[a-z0-9_]/i.test(x);

	private static str_reg = /(['"])(.*?)\1/;

	static isString = (input: string) => this.str_reg.test(input);
	static parseString = (input: string) => this.str_reg.exec(input)?.[2];
}

export class Lexer {
	static lex(input: string) {
		const output = input.match(
			/(['"])(.*?)\1|\w+|(?!\\)[~!@#$%^&*{}()-_+"'\\/.;:\[\]\s]|[\uD83C-\uDBFF\uDC00-\uDFFF]+/g
		);

		if (output == null) {
			throw "This is a blank file!";
		}
		while (output.indexOf(" ") != -1) {
			output.splice(output.indexOf(" "), 1);
		}

		return output;
	}

	/**
	 *  @deprecated
	 */
	static chunk(
		lexed: string[],
		options?: {
			line_end?: string | string[];
		}
	): string[][] {
		const line_end = Array.isArray(options?.line_end)
			? options.line_end
			: [options?.line_end ?? ";"];

		const chunks: string[][] = [];
		let chunk: string[] = [];
		let scope_depth: number = 0;

		for (const item of lexed) {
			if (item === "{") scope_depth++;
			else if (item === "}") {
				scope_depth--;

				if (scope_depth == 0) {
					chunk.push(item);
					chunks.push(chunk);
					chunk = [];
					continue;
				}
			}

			if (line_end.includes(item) && scope_depth === 0) {
				chunks.push(chunk);
				chunk = [];
			} else if (!["\n", "\t", "\r"].includes(item)) chunk.push(item);
		}

		return chunks;
	}

	private static _parseOperator(
		value: string
	): OperatorToken["type"] | undefined {
		switch (value) {
			case "+":
				return TokenType.PLUS;
			case "-":
				return TokenType.MINUS;
			case "*":
				return TokenType.STAR;
			case "/":
				return TokenType.SLASH;
			case "=":
				return TokenType.EQUAL;
			default:
				return undefined;
		}
	}

	private static _parsePunctuation(
		value: string,
		keywords: LanguageDictionary
	): PunctuationToken["type"] | undefined {
		if (keywords.comma.includes(value)) {
			return TokenType.COMMA;
		} else if (keywords.dot.includes(value)) {
			return TokenType.DOT;
		} else if (keywords.colon.includes(value)) {
			return TokenType.COLON;
		} else if (keywords.semicolon.includes(value)) {
			return TokenType.SEMICOLON;
		} else if (keywords.newline.includes(value)) {
			return TokenType.NEWLINE;
		} else if (keywords.indent.includes(value)) {
			return TokenType.INDENT;
		}

		return undefined;
	}

	private static _parseDelimiter(
		value: string,
		keywords: LanguageDictionary
	): DelimiterToken["type"] | undefined {
		if (keywords.brace_left.includes(value)) {
			return TokenType.BRACKET_LEFT;
		} else if (keywords.brace_right.includes(value)) {
			return TokenType.BRACE_RIGHT;
		} else if (keywords.parenthesis_left.includes(value)) {
			return TokenType.PAREN_LEFT;
		} else if (keywords.parenthesis_right.includes(value)) {
			return TokenType.PAREN_RIGHT;
		} else if (keywords.newline.includes(value)) {
			return TokenType.NEWLINE;
		} else if (keywords.indent.includes(value)) {
			return TokenType.INDENT;
		}
	}

	static parseToken(
		value: string,
		level: number,
		keywords: LanguageDictionary
	): { token: AnyToken; level: number } {
		let token: AnyToken;
		let tmptoken: TokenType | undefined;

		if (keywords.brace_left.includes(value)) {
			token = {
				group: TokenGroup.DELIMITER,
				type: TokenType.BRACE_LEFT,
				raw: value,
				value,
				level: ++level,
			};
		} else if (keywords.brace_right.includes(value)) {
			token = {
				group: TokenGroup.DELIMITER,
				type: TokenType.BRACE_RIGHT,
				raw: value,
				value,
				level: level--,
			};
		} else if (
			(tmptoken = this._parseDelimiter(value, keywords)) != undefined
		) {
			token = {
				group: TokenGroup.DELIMITER,
				type: tmptoken,
				raw: value,
				value,
			};
		} else if (TypeHandler.isString(value)) {
			token = {
				// group: TokenGroup.STRING,
				type: TokenType.STRING,
				raw: value,
				value: TypeHandler.parseString(value) ?? "",
			};
		} else if (
			(tmptoken = this._parsePunctuation(value, keywords)) != undefined
		) {
			token = {
				group: TokenGroup.PUNCTUATION,
				type: tmptoken,
				raw: value,
				value,
			};
		} else if (!isNaN(Number.parseFloat(value))) {
			token = {
				// group: TokenGroup.NUMBER,
				type: TokenType.NUMBER,
				raw: value,
				value: Number.parseFloat(value),
			};
		} else if (keywords.boolean_true.includes(value)) {
			token = {
				group: TokenGroup.BOOLEAN,
				type: TokenType.NUMBER,
				raw: value,
				value: +true as 1,
			};
		} else if (keywords.boolean_false.includes(value)) {
			token = {
				group: TokenGroup.BOOLEAN,
				type: TokenType.NUMBER,
				raw: value,
				value: +false as 0,
			};
		} else if ((tmptoken = this._parseOperator(value)) != undefined) {
			token = {
				group: TokenGroup.OPERATOR,
				type: tmptoken,
				raw: value,
				value,
			};
		} else if (value != "\t" && value != "\r") {
			token = {
				type: TokenType.IDENTIFIER,
				raw: value,
				value,
			};
		}

		return {
			token: token!,
			level,
		};
	}

	static tokenize(
		lexed: string[],
		options: {
			keywords?: LanguageDictionary;
		}
	): AnyToken[] {
		const keywords = options.keywords ?? default_language_dicitionary;
		const tokens: AnyToken[] = [];
		let level: number = 0;

		for (const value of lexed) {
			const { token, level: new_level } = this.parseToken(
				value,
				level,
				keywords
			);

			tokens.push(token);
			level = new_level;
		}

		return tokens;
	}
}
