import { AnyToken, TokenType } from "./tokens.js";

export interface LanguageDictionary extends Record<string, string[]> {
	// grouping
	brace_left: string[];
	brace_right: string[];
	bracket_left: string[];
	bracket_right: string[];
	parenthesis_left: string[];
	parenthesis_right: string[];

	// operators
	plus: string[];
	minus: string[];
	star: string[];
	slash: string[];
	equals: string[];
	greater_than: string[];
	less_than: string[];
	exclamation: string[];
	hashtag: string[];

	is: string[];
	not: string[];
	cast: string[];

	// punctuation
	comma: string[];
	dot: string[];
	colon: string[];
	semicolon: string[];
	newline: string[];
	indent: string[];
	question_mark: string[];

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
	equals: ["="],
	greater_than: [">"],
	less_than: ["<"],
	exclamation: ["!"],
	hashtag: ["#"],

	is: ["=="],
	not: ["!="],
	cast: ["as"],

	// punctuation
	comma: [","],
	dot: ["."],
	colon: [":"],
	semicolon: [";"],
	newline: ["\n"],
	indent: ["\t"],
	question_mark: ["?"],

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

	private static resolveKW<T extends TokenType>(
		value: string | undefined,
		pairs: [keywords: string[], token_type: T][]
	): T | undefined {
		if (value == undefined) return undefined;
		for (const [keywords, token_type] of pairs) {
			if (keywords.includes(value)) {
				return token_type;
			}
		}
		return undefined;
	}

	private static _parseOperator(
		value: string | undefined,
		keywords: LanguageDictionary
	) {
		return Lexer.resolveKW(value, [
			[keywords.plus, TokenType.PLUS], // `+`
			[keywords.minus, TokenType.MINUS], // `-`
			[keywords.star, TokenType.STAR], // `*`
			[keywords.slash, TokenType.SLASH], // `/`
			[keywords.equals, TokenType.EQUAL], // `=`
			[keywords.exclamation, TokenType.EXCLAMATION], // `!`
			[keywords.less_than, TokenType.LESS_THAN], // `<`
			[keywords.greater_than, TokenType.GREATER_THAN], // `>`
		]);
	}

	private static _parsePunctuation(
		value: string,
		keywords: LanguageDictionary
	) {
		return Lexer.resolveKW(value, [
			[keywords.comma, TokenType.COMMA],
			[keywords.dot, TokenType.DOT],
			[keywords.colon, TokenType.COLON],
			[keywords.semicolon, TokenType.SEMICOLON],
			[keywords.newline, TokenType.NEWLINE],
			[keywords.indent, TokenType.INDENT],
			[keywords.question_mark, TokenType.QUESTION_MARK],
		]);
	}

	private static _parseDelimiter(
		value: string,
		keywords: LanguageDictionary
	) {
		return Lexer.resolveKW(value, [
			[keywords.bracket_left, TokenType.BRACKET_LEFT],
			[keywords.bracket_right, TokenType.BRACKET_RIGHT],
			[keywords.parenthesis_left, TokenType.PAREN_LEFT],
			[keywords.parenthesis_right, TokenType.PAREN_RIGHT],
		]);
	}

	static parseToken(
		lexed: string[],
		raw: string,
		index: number,
		level: number,
		keywords: LanguageDictionary
	): { token: AnyToken; level: number; index: number } {
		let token: AnyToken;
		let tmptoken: TokenType | undefined;

		if (keywords.brace_left.includes(raw)) {
			// increase level before
			++level;

			token = { type: TokenType.BRACE_LEFT, raw, value: raw, level };
		} else if (keywords.brace_right.includes(raw)) {
			token = { type: TokenType.BRACE_RIGHT, raw, value: raw, level };
			// decrease level after
			--level;
		} else if (
			(tmptoken = this._parseDelimiter(raw, keywords)) != undefined
		) {
			token = { type: tmptoken, raw, value: raw };
		} else if (TypeHandler.isString(raw)) {
			const value = TypeHandler.parseString(raw) ?? "";
			token = { type: TokenType.STRING, raw, value };
		} else if (
			(tmptoken = this._parsePunctuation(raw, keywords)) != undefined
		) {
			token = { type: tmptoken, raw, value: raw };
		} else if (!isNaN(Number.parseFloat(raw))) {
			token = {
				type: TokenType.NUMBER,
				raw,
				value: Number.parseFloat(raw),
			};
		} else if (keywords.boolean_true.includes(raw)) {
			token = { type: TokenType.BOOLEAN, raw, value: +true as 1 };
		} else if (keywords.boolean_false.includes(raw)) {
			token = { type: TokenType.BOOLEAN, raw, value: +false as 0 };
		} else if (keywords.is.includes(raw)) {
			token = { type: TokenType.IS, value: raw, raw };
		} else if (keywords.not.includes(raw)) {
			token = { type: TokenType.NOT, value: raw, raw };
		} else if (keywords.cast.includes(raw)) {
			token = { type: TokenType.CAST, value: raw, raw };
		}
		// comments
		else if (keywords.hashtag.includes(raw)) {
			index++;
			let text: string[] = [];
			while (keywords.newline.includes(lexed[index]) != true) {
				text.push(lexed[++index]);
			}
			let string = text.join(" ");
			token = {
				type: TokenType.COMMENT,
				value: string,
				raw: "#COMMENT: " + string,
			};
		} else if (
			(tmptoken = this._parseOperator(raw, keywords)) != undefined
		) {
			token = { type: tmptoken, raw, value: raw };

			const next_value = lexed[index + 1];
			const next_token = this._parseOperator(next_value, keywords);
			if (next_token != undefined) {
				const matching = (left: TokenType, right: TokenType) =>
					token.type == left && next_token == right;

				if (matching(TokenType.EQUAL, TokenType.EQUAL)) {
					token.type = TokenType.IS;
					token.value = token.value + next_value;
					token.raw = token.value;
					index++;
				} else if (matching(TokenType.EXCLAMATION, TokenType.EQUAL)) {
					token.type = TokenType.NOT;
					token.value = token.value + next_value;
					token.raw = token.value;
					index++;
				}
			}
		} else if (raw != "\t" && raw != "\r") {
			token = { type: TokenType.IDENTIFIER, raw, value: raw };
		}

		return { token: token!, level, index };
	}

	static tokenize(
		lexed: string[],
		options: {
			keywords?: LanguageDictionary;
		}
	): AnyToken[] {
		const keywords = options.keywords ?? default_language_dicitionary;
		const tokens: AnyToken[] = [];
		let level_i: number = 0;

		for (let i = 0; i < lexed.length; i++) {
			const value = lexed[i];
			const p_ctx = this.parseToken(lexed, value, i, level_i, keywords);

			level_i = p_ctx.level;
			i = p_ctx.index;
			tokens.push(p_ctx.token);
		}

		tokens.push({ type: TokenType.EOF });

		return tokens;
	}

	static including(list: AnyToken[], include: TokenType[]): AnyToken[] {
		return list.filter((token) => include.includes(token.type));
	}

	static excluding(list: AnyToken[], exclude: TokenType[]): AnyToken[] {
		return list.filter((token) => exclude.includes(token.type) != true);
	}
}
