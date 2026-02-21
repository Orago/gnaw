import {
	AnyToken,
	OperatorTokenType,
	SeparatorTokenType,
	TokenType,
} from "./tokens.js";

export interface LanguageDictionary extends Record<string, string[]> {
	brace_left: string[];
	brace_right: string[];
	bracket_left: string[];
	bracket_right: string[];
	parenthesis_left: string[];
	parenthesis_right: string[];
	seperator_open: string[];
	seperator_close: string[];

	line_new: string[];
	line_end: string[];
	indent: string[];
	seperators: string[];

	boolean_true: string[];
	boolean_false: string[];
	operators: string[];
	delimiters: string[];
}

export const default_language_dicitionary: LanguageDictionary = {
	brace_left: ["{"],
	brace_right: ["}"],
	bracket_left: ["["],
	bracket_right: ["]"],
	parenthesis_left: ["("],
	parenthesis_right: [")"],

	seperator_open: ["{", "[", "("],
	seperator_close: ["}", "]", ")"],
	line_new: ["\n"],
	line_end: [";"],
	indent: ["\t"],
	seperators: ["\r", "\t", "\n"],
	delimiters: ["{", "}", "(", ")", "[", "]"],

	boolean_true: ["true"],
	boolean_false: ["false"],
	operators: ["+", "-", "<", ">", ".", ",", "/", ":"],
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

	static parseOperator(value: string) {
		switch (value) {
			case "+":
				return OperatorTokenType.PLUS;
			case "-":
				return OperatorTokenType.MINUS;
			case "*":
				return OperatorTokenType.STAR;
			case "/":
				return OperatorTokenType.SLASH;
			case "=":
				return OperatorTokenType.EQUAL;
			default:
				return undefined;
		}
	}

	static parseToken(
		value: string,
		level: number,
		keywords: LanguageDictionary
	): { token: AnyToken; level: number } {
		let token: AnyToken;

		if (keywords.brace_left.includes(value)) {
			token = {
				type: TokenType.SEPARATOR,
				raw: value,
				value,
				level: ++level,
				subset: SeparatorTokenType.BRACE_LEFT,
			};
		} else if (keywords.brace_right.includes(value)) {
			token = {
				type: TokenType.SEPARATOR,
				raw: value,
				value,
				level: level--,
				subset: SeparatorTokenType.BRACE_RIGHT,
			};
		} else if (keywords.brace_left.includes(value)) {
			token = {
				type: TokenType.SEPARATOR,
				raw: value,
				value,
				subset: SeparatorTokenType.BRACKET_LEFT,
			};
		} else if (keywords.brace_right.includes(value)) {
			token = {
				type: TokenType.SEPARATOR,
				raw: value,
				value,
				subset: SeparatorTokenType.BRACE_RIGHT,
			};
		} else if (keywords.parenthesis_left.includes(value)) {
			token = {
				type: TokenType.SEPARATOR,
				raw: value,
				value,
				subset: SeparatorTokenType.PAREN_LEFT,
			};
		} else if (keywords.parenthesis_right.includes(value)) {
			token = {
				type: TokenType.SEPARATOR,
				raw: value,
				value,
				subset: SeparatorTokenType.PAREN_RIGHT,
			};
		} else if (keywords.line_end.includes(value)) {
			token = {
				type: TokenType.SEPARATOR,
				raw: value,
				value,
				line_end: true,
				subset: SeparatorTokenType.LINE_END,
			};
		} else if (TypeHandler.isString(value)) {
			token = {
				type: TokenType.STRING,
				raw: value,
				value: TypeHandler.parseString(value) ?? "",
			};
		} else if (!isNaN(Number.parseFloat(value))) {
			token = {
				type: TokenType.NUMBER,
				raw: value,
				value: Number.parseFloat(value),
			};
		} else if (keywords.boolean_true.includes(value)) {
			token = {
				type: TokenType.BOOLEAN,
				raw: value,
				value: true,
			};
		} else if (keywords.boolean_false.includes(value)) {
			token = {
				type: TokenType.BOOLEAN,
				raw: value,
				value: false,
			};
		} else if (keywords.line_new.includes(value)) {
			token = {
				type: TokenType.SEPARATOR,
				raw: value,
				value,
				subset: SeparatorTokenType.NEW_LINE,
			};
		} else if (keywords.indent.includes(value)) {
			token = {
				type: TokenType.SEPARATOR,
				raw: value,
				value,
				subset: SeparatorTokenType.INDENT,
			};
		} else if (keywords.seperators.includes(value)) {
			token = {
				type: TokenType.SEPARATOR,
				raw: value,
				value,
			};
		} else if (keywords.operators.includes(value)) {
			const operator_type = this.parseOperator(value);

			if (operator_type != undefined) {
				token = {
					type: TokenType.OPERATOR,
					subset: operator_type,
					raw: value,
					value,
				};
			}
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
