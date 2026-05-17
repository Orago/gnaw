import type { IterableCheck } from "../token-iterator.js";
import { TokenType } from "../tokens.js";
import {
	type Expression,
	ExpressionType,
	type PlagueParserContext,
	ReturnStatement,
	type Statement,
	StatementType,
	TableEntry,
} from "./interfaces.js";
import { PlagueParser } from "./parser.js";
import { PlagueLanguage } from "./language.js";
import { PlaguePlugin } from "./plugin-utility.js";
import type { PlagueScope } from "./states.js";
import { DataTypes } from "./variables.js";

export class VariablePlugin extends PlaguePlugin<{
	statement: {
		type: StatementType.VARIABLE;
		name: string;
		value: Expression;
	};
}> {
	id = "variable";
	constructor() {
		super();

		this.statement = {
			case: (t) => t.type == TokenType.IDENTIFIER && t.value == "let",
			handleStatement(statement, scope) {
				const value = PlagueLanguage.evaluateExpression(
					statement.value,
					scope
				);
				scope.set(statement.name, value);
			},
			createStatement: (ctx) => {
				const { iterator } = ctx;
				iterator.expect(this.statement!.case);
				const name = iterator.expectResult(TokenType.IDENTIFIER).value;
				iterator.expect(TokenType.EQUAL);
				const value = PlagueParser.parseExpression(ctx);
				return {
					type: StatementType.VARIABLE,
					name,
					value,
				};
			},
		};
	}
}

export class FunctionPlugin extends PlaguePlugin<{
	statement: {
		type: StatementType.FUNCTION;
		name: string;
		params: string[];
		body: Statement[];
	};
}> {
	id = "function";

	constructor() {
		super();

		this.statement = {
			case: (t) => t.type == TokenType.IDENTIFIER && t.value == "fn",
			handleStatement: (statement, scope) => {
				const fn = PlagueLanguage.createFunction(
					statement.params,
					statement.body,
					scope
				);
				scope.set(statement.name, fn);
			},
			createStatement: (ctx) => {
				const { iterator } = ctx;
				iterator.expect(this.statement.case);
				const name = iterator.expectResult(TokenType.IDENTIFIER).value;
				const params = PlagueParser.parseBlock(
					ctx,
					() => {
						const v = ctx.iterator.expectResult(
							TokenType.IDENTIFIER
						).value;
						ctx.iterator.disposeIf("is", TokenType.COMMA);
						return v;
					},
					TokenType.PAREN_LEFT,
					TokenType.PAREN_RIGHT
				);

				const body = PlagueParser.parseBlock(ctx, () => {
					return PlagueParser.parseStatement(ctx);
				});

				return {
					type: StatementType.FUNCTION,
					name: name,
					params,
					body,
				};
			},
		};
	}
}

export class ReturnPlugin extends PlaguePlugin<{
	statement: ReturnStatement;
}> {
	id = "return";

	constructor() {
		super();

		this.statement = {
			case: (t) => t.type == TokenType.IDENTIFIER && t.value == "return",
			handleStatement: (statement, scope): void => {
				const value = statement.value
					? PlagueLanguage.evaluateExpression(statement.value, scope)
					: null;
				throw { type: "return", value };
			},
			createStatement: (ctx: PlagueParserContext) => {
				const { iterator } = ctx;
				iterator.expect(this.statement!.case);

				if (iterator.peek().type == TokenType.BRACE_RIGHT) {
					return { type: StatementType.RETURN };
				} else {
					return {
						type: StatementType.RETURN,
						value: PlagueParser.parseExpression(ctx),
					};
				}
			},
		};
	}
}

export class TablesPlugin extends PlaguePlugin<{
	expression: { type: ExpressionType.TABLE; entries: TableEntry[] };
}> {
	id = "table";

	constructor() {
		super();

		this.primary_literal = {
			case: (t) => t.type == TokenType.BRACE_LEFT,
			create: (ctx) => {
				const entries: TableEntry[] = [];
				const { iterator } = ctx;

				while (iterator.peek().type !== TokenType.BRACE_RIGHT) {
					if (
						iterator.peek().type == TokenType.IDENTIFIER &&
						iterator.peek(1).type == TokenType.EQUAL
					) {
						const key = iterator.expectResult(
							TokenType.IDENTIFIER
						).value;
						iterator.expect(TokenType.EQUAL);
						const value = PlagueParser.parseExpression(ctx);
						entries.push({ key, value });
					} else {
						const value = PlagueParser.parseExpression(ctx);
						entries.push({ value });
					}
					iterator.disposeIf("is", TokenType.COMMA);
				}

				iterator.expect(TokenType.BRACE_RIGHT);

				return { type: ExpressionType.TABLE, entries };
			},
		};
	}
}

export const core_plugins: PlaguePlugin<any>[] = [
	new VariablePlugin(),
	new FunctionPlugin(),
	new ReturnPlugin(),
	new TablesPlugin(),
];
