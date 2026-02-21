import TokenIterator from "./iterable.js";
import {
	default_language_dicitionary,
	type LanguageDictionary,
	Lexer,
} from "./lexer.js";
import { type VariableLike, VariableType } from "./plugins/variables.js";
import { type AnyToken, SeparatorTokenType, TokenType } from "./tokens.js";
import { type HandlerBlob, LanguageHandlerList } from "./utility/handlers.js";

export class LineUtility {
	static captureIndentCount(iterator: TokenIterator): number {
		let count: number = 0;

		while (true) {
			const token = iterator.peek().value;

			if (
				token &&
				token.type == TokenType.SEPARATOR &&
				token.subset == SeparatorTokenType.INDENT
			) {
				iterator.next();
				count++;
			} else {
				break;
			}
		}

		return count;
	}
	static parseNextLine(iterator: TokenIterator, started: boolean = false) {
		const captured: AnyToken[] = [];

		for (const token of iterator.consumer()) {
			const is_new_line =
				token.type == TokenType.SEPARATOR &&
				token.subset == SeparatorTokenType.NEW_LINE;

			if (started == false) {
				// start on the first newline detected
				if (is_new_line) {
					started = true;
				}
				continue;
			} else {
				// stop if the next newline has started
				if (is_new_line) {
					break;
				}

				// fill captured
				captured.push(token);
			}
		}

		return captured;
	}
}

export class VecUtility {
	static captureVec (iterator: TokenIterator, options: {
		max_length: number;
	}){

		const captured: AnyToken[] = [];

iterator.dispose("if", (token) => {
			token.type == TokenType.IDENTIFIER
		})

		if ()

		for (const token of iterator.consumer()) {
			const is_new_line =
				token.type == TokenType.SEPARATOR &&
				token.subset == SeparatorTokenType.NEW_LINE;


		}

		return captured;
	}
}

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
					this.keywords.brace_right.includes(token.raw)) &&
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

	checkNewLine(iterator: TokenIterator) {
		const captured: AnyToken[] = [];
		let next = iterator.peek();
		let indent: number = 0;
		let offset = 1;

		while (true) {
			next = iterator.peek(offset++);

			if (next.done == true || next.value == undefined) {
				break;
			}
			const token = next?.value;
			if (
				token.type == TokenType.SEPARATOR &&
				token.subset == SeparatorTokenType.NEW_LINE
			) {
				break;
			} else if (
				token.type == TokenType.SEPARATOR &&
				token.subset == SeparatorTokenType.INDENT
			) {
				indent++;
			} else {
				captured.push(next.value);
			}
		}

		return [indent, captured] as [number, AnyToken[]];
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
				token.subset == SeparatorTokenType.NEW_LINE
			) {
				break;
			} else if (
				token.type == TokenType.SEPARATOR &&
				token.subset == SeparatorTokenType.INDENT
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

	evalIterator(iterator: TokenIterator) {
		while (true) {
			let handled: number = 0;
			// const [line_indent, line_tokens] = this.scrapeNewLine(iterator);
			// const line_iterator = new TokenIterator(line_tokens);
			const blob: HandlerBlob = {
				language: this,
				iterator: iterator,
			};

			while (
				iterator.dispose(
					"if",
					(t) =>
						t.type == TokenType.SEPARATOR &&
						t.subset == SeparatorTokenType.NEW_LINE
				)
			) {}

			for (const handler of this.handlers.getArray()) {
				if (
					handler.line_hooks == undefined ||
					handler.line_hooks?.length == 0
				) {
					continue;
				}

				for (const hook of handler.line_hooks) {
					if (hook?.test != undefined && hook.test(blob)) {
						hook.run(blob);
						handled++;
					}
				}
			}

			if (handled == 0) {
				this.error(
					"unhandled code\n------\n" +
						iterator
							.select("remaining")
							.map((e) => `${e.value}`)
							.join(" ") +
						"\n-----"
				);
				break;
			}

			const $ = iterator.peek();

			if ($.done == true) {
				break;
			}
		}
	}

	eval(text: string) {
		const tokens = Lexer.tokenize(Lexer.lex(text), {});
		const iterator = new TokenIterator(tokens);

		this.evalIterator(iterator);
	}
}
