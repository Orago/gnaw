// I did not know what else to name this file
// it's generally just for quick preset schemas
import { TokenType } from "./tokens.js";
import { TypeCasts } from "../shared/casts.js";
import { FunctionParameter } from "../shared/interfaces.js";
import { StatementParser } from "./statements.js";
import { ParserContext } from "./types.js";

export class ParserQuick {
	static parseBlock<T>(
		ctx: ParserContext,
		collect: () => T,
		left: TokenType = TokenType.BRACE_LEFT,
		right: TokenType = TokenType.BRACE_RIGHT
	): T[] {
		const { iterator } = ctx;
		iterator.expect(left);
		const items: T[] = [];
		while (!iterator.isDone() && iterator.peek().type !== right) {
			items.push(collect());
		}
		iterator.expect(right);
		return items;
	}

	static parseStatementBlock(ctx: ParserContext) {
		return ParserQuick.parseBlock(ctx, () => {
			return StatementParser.parse(ctx);
		});
	}

	static parseParameters(
		ctx: ParserContext,
		left: TokenType = TokenType.PAREN_LEFT,
		right: TokenType = TokenType.PAREN_RIGHT
	): FunctionParameter[] {
		const { iterator } = ctx;
		iterator.expect(left);
		const params: FunctionParameter[] = [];

		while (iterator.peek().type !== right) {
			const parameter: FunctionParameter = {
				name: iterator.expectResult(TokenType.IDENTIFIER).value,
			};

			if (iterator.disposeIf(TokenType.COLON)) {
				if (iterator.disposeIf(TokenType.EXCLAMATION)) {
					parameter.expect = true;
				}
				const type_name = iterator.expectResult(
					TokenType.IDENTIFIER
				).value;
				const type = TypeCasts.getCastType(type_name);
				parameter.type = type;
			}

			params.push(parameter);
			iterator.disposeIf(TokenType.COMMA);
		}

		iterator.expect(right);

		return params;
	}
}
