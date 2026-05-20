import { Lexer } from "./lexer.js";
import TokenIterator from "./token-iterator.js";
import { AnyToken, TokenType } from "./tokens.js";
import { Statement } from "../shared/interfaces.js";
import { StatementParser } from "./statements.js";
import { ParserContext } from "./types.js";
import { System } from "../shared/data.js";
export class Parser {
	static createContext(system: System, tokens: AnyToken[]): ParserContext {
		const iterator = new TokenIterator(tokens);
		return {
			iterator,
			system,
		};
	}
	static parseString(system: System, script: string) {
		const lexed = Lexer.lex(script);
		let tokens = Lexer.tokenize(lexed, {
			keywords: system.keywords,
		});

		tokens = Lexer.excluding(tokens, [
			TokenType.NEWLINE,
			TokenType.INDENT,
			// TokenType.COMMENT,
		]);
		return this.parseTokens(system, tokens);
	}

	static parseTokens(system: System, tokens: AnyToken[]): Statement[] {
		const statements: Statement[] = [];
		const ctx: ParserContext = this.createContext(system, tokens);

		while (ctx.iterator.peek().type != TokenType.EOF) {
			statements.push(StatementParser.parse(ctx));
		}

		return statements;
	}
}
