import { StatementType } from "../shared/enums.js";
import { Statement } from "../shared/interfaces.js";
import { ExpressionParser } from "./expressions.js";
import { ParserContext } from "./types.js";

export class StatementParser {
	static parse(ctx: ParserContext): Statement {
		const { iterator } = ctx;

		for (const plugin of ctx.system.plugins) {
			const handlers = plugin.getStatements();
			if (handlers == undefined) continue;

			for (const handler of handlers) {
				if (iterator.match(handler.case)) {
					if (handler.trim_case == true) {
						iterator.expect(handler.case);
					}
					return handler.createStatement(ctx) as Statement;
				}
			}
		}

		return {
			type: StatementType.EXPRESSION,
			expression: ExpressionParser.parse(ctx),
		};
	}
}
