import TokenIterator from "./iterable.js";
import {
	default_language_dicitionary,
	type LanguageDictionary,
	Lexer,
} from "./lexer.js";
import { type VariableLike, VariableType } from "./plugins/variables.js";
import { type AnyToken, SeparatorTokenType, TokenType } from "./tokens.js";
import { type HandlerBlob, LanguageHandlerList } from "./utility/handlers.js";

export class Language {
	keywords: LanguageDictionary = default_language_dicitionary;
	errors: string[] = [];
	handlers = new LanguageHandlerList();

	constructor() {}

	chunkTokens(tokens: AnyToken[]) {
		const chunks: AnyToken[][] = [];
		let chunk: AnyToken[] = [];

		let scope_depth: number = 0;

		for (const token of tokens) {
			if (token.type == TokenType.SEPARATOR && token.level != undefined) {
				scope_depth = token.level;
			}

			if (
				token.type == TokenType.SEPARATOR &&
				(token.line_end == true ||
					this.keywords.block_close.includes(token.raw)) &&
				scope_depth === 0
			) {
				chunks.push(chunk);
				chunk = [];
			} else {
				chunk.push(token);
			}
		}

		return chunks;
	}

	scrapeNewLine(iterator: TokenIterator) {
		const captured: AnyToken[] = [];
		let next = iterator.peek();
		let indent: number = 0;

		while (true) {
			next = iterator.next();

			if (next.done == true || next.value == undefined) {
				break;
			}
			const token = next?.value;
			if (
				token.type == TokenType.SEPARATOR &&
				token.separator == SeparatorTokenType.NEW_LINE
			) {
				break;
			} else if (
				token.type == TokenType.SEPARATOR &&
				token.separator == SeparatorTokenType.INDENT
			) {
				indent++;
			} else {
				captured.push(next.value);
			}
		}

		return [indent, captured] as [number, AnyToken[]];
	}

	expectValue(iterator: TokenIterator): VariableLike {
		for (const handler of this.handlers.getArray()) {
			if (handler.handleValue == undefined) {
				continue;
			}
			const result = handler.handleValue({ language: this, iterator });
			if (result != false) {
				return result;
			}
		}

		const next = iterator.next();
		const token = next?.value;

		switch (token?.type) {
			case TokenType.IDENTIFIER: {
				for (const handler of this.handlers.getArray()) {
					if (handler.handleIdentifier == undefined) {
						continue;
					}
					const result = handler.handleIdentifier({
						language: this,
						iterator,
					});
					if (result != false) {
						return result;
					}
				}
				break;
			}
			case TokenType.STRING:
				return {
					type: VariableType.STRING,
					value: token.value,
				};

			case TokenType.NUMBER:
				return {
					type: VariableType.NUMBER,
					value: token.value,
				};
		}

		return {
			type: VariableType.NULL,
			value: 0,
		};
	}

	error(value: string) {
		throw "Got error: " + value;
	}

	eval(text: string) {
		const tokens = Lexer.tokenize(Lexer.lex(text), {});
		const iterator = new TokenIterator(tokens);
		let line_start = true;

		while (true) {
			// const [line_indent, line_tokens] = this.scrapeNewLine(iterator);
			// const line_iterator = new TokenIterator(line_tokens);
			const blob: HandlerBlob = {
				language: this,
				iterator: iterator,
			};

			if (line_start == true) {
				for (const handlers of this.handlers.getArray()) {
					if (
						handlers.handleLineTest != undefined &&
						handlers.handleLineRun != undefined &&
						handlers.handleLineTest(blob)
					) {
						handlers.handleLineRun(blob);
						line_start = false;
					}
				}
			}

			const $ = iterator.next();

			if (
				$.value?.type == TokenType.SEPARATOR &&
				$.value.separator == SeparatorTokenType.NEW_LINE
			) {
				line_start = true;
			}

			if ($.done == true) {
				break;
			}
		}
	}
}
