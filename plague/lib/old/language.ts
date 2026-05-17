import TokenIterator from "../token-iterator.js";
import {
	default_language_dicitionary,
	type LanguageDictionary,
	Lexer,
} from "../lexer.js";
import { type VariableLike, VariableType } from "./plugins/variables.js";
import { type AnyToken, TokenGroup, TokenType } from "../tokens.js";
import {
	type HandlerContext,
	LanguageHandlerList,
} from "./plugins/utility/handlers.js";

export class LineUtility {
	static captureIndentCount(iterator: TokenIterator): number {
		let count: number = 0;

		while (true) {
			const token = iterator.peek().value;

			if (token && token.type == TokenType.INDENT) {
				iterator.advance();
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
			const is_new_line = token.type == TokenType.NEWLINE;

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
	static captureVec(
		language: Language,
		iterator: TokenIterator
	): [VariableLike[], consumed: number] {
		const captured: VariableLike[] = [];
		const start = iterator.offset;
		let depth: number = 0;
		let expect_comma = false;

		while (true) {
			if (iterator.disposeIf("is", TokenType.PAREN_LEFT)) {
				depth++;
			}

			if (depth == 0) {
				return [captured, iterator.offset - start];
			}
			if (iterator.disposeIf("is", TokenType.PAREN_RIGHT)) {
				depth--;

				if (depth == 0) {
					break;
				}
			}

			if (expect_comma == false) {
				expect_comma = true;
				captured.push(language.expectValue(iterator));
				continue;
			}

			if (expect_comma == true && iterator.match(TokenType.COMMA)) {
				expect_comma = false;
				iterator.advance();
				continue;
			}
		}

		return [captured, iterator.offset - start];
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
			if (
				token.group == TokenGroup.DELIMITER &&
				token.level != undefined
			) {
				scope_depth = token.level;
			}

			if (
				(token.type == TokenType.SEMICOLON ||
					token.type == TokenType.BRACE_RIGHT) &&
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
			if (token.type == TokenType.NEWLINE) {
				break;
			} else if (token.type == TokenType.INDENT) {
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
			next = iterator.advance();

			if (next.done == true || next.value == undefined) {
				break;
			}
			const token = next?.value;
			if (token.type == TokenType.NEWLINE) {
				break;
			} else if (token.type == TokenType.INDENT) {
				indent++;
			} else {
				captured.push(next.value);
			}
		}

		return [indent, captured] as [number, AnyToken[]];
	}

	readValue(iterator: TokenIterator): [VariableLike, consumed: number] {
		let start: number = iterator.offset;
		function resolve(_var: VariableLike): [VariableLike, consumed: number] {
			let end = iterator.offset;
			iterator.offset = start;
			return [_var, end - start];
		}

		for (const handler of this.handlers.getArray()) {
			if (handler.handleValue == undefined) {
				continue;
			}
			const result = handler.handleValue({ language: this, iterator });
			if (result != false) {
				return resolve(result);
			}
		}

		const next = iterator.advance();
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
						return resolve(result);
					}
				}

				return resolve({
					type: VariableType.IDENTIFIER,
					value: token.value,
				});
			}
			case TokenType.STRING:
				return resolve({
					type: VariableType.STRING,
					value: token.value,
				});

			case TokenType.NUMBER:
				return resolve({
					type: VariableType.NUMBER,
					value: token.value,
				});
		}

		return resolve({
			type: VariableType.NULL,
			value: 0,
		});
	}

	expectValue(iterator: TokenIterator): VariableLike {
		const result = this.readValue(iterator);
		iterator.offset += result[1];
		return result[0];
	}

	error(value: string) {
		throw "Got error: " + value;
	}

	evalIterator(iterator: TokenIterator) {
		while (true) {
			let handled: number = 0;
			// const [line_indent, line_tokens] = this.scrapeNewLine(iterator);
			// const line_iterator = new TokenIterator(line_tokens);
			const blob: HandlerContext = {
				language: this,
				iterator: iterator,
			};

			while (iterator.disposeIf("is", TokenType.NEWLINE)) {}
			while (iterator.disposeIf("is", TokenType.INDENT)) {}

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
