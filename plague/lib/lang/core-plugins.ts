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
import { DataTypes, DataValue } from "./variables.js";

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
			test: (statement) => statement.type == StatementType.FUNCTION,
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
			// currently unused but left in PlagueLanguage.execStatement
			handleStatement: (statement, scope): void => {
				console.log("HANDLING");
				const value = statement.value
					? PlagueLanguage.evaluateExpression(statement.value, scope)
					: null;
				throw { type: "return", value };
			},
			test: (statement) => statement.type == StatementType.RETURN,

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

export class IfPlugin extends PlaguePlugin<{
	statement: {
		type: StatementType.IF;
		condition: Expression;
		body: Statement[];
		else?: Statement[];
	};
}> {
	id = "if";

	constructor() {
		super();

		this.statement = {
			case: (t) => t.type == TokenType.IDENTIFIER && t.value == "if",
			handleStatement(statement, scope): void {
				const condition = PlagueLanguage.evaluateExpression(
					statement.condition,
					scope
				);

				if (condition) {
					PlagueLanguage.execManyStatements(statement.body, scope);
				} else if (statement.else != undefined) {
					PlagueLanguage.execManyStatements(statement.body, scope);
				}
			},
			createStatement: (ctx) => {
				const { iterator } = ctx;
				iterator.expect(this.statement.case);

				const condition = PlagueParser.parseExpression(ctx);
				const main_block: Statement[] = PlagueParser.parseBlock(
					ctx,
					() => {
						return PlagueParser.parseStatement(ctx);
					}
				);

				let else_block: Statement[] = [];

				if (
					iterator.disposeIf(
						"is",
						(t) =>
							t.type == TokenType.IDENTIFIER && t.value == "else"
					)
				) {
					else_block = PlagueParser.parseBlock(ctx, () => {
						return PlagueParser.parseStatement(ctx);
					});
				}

				return {
					type: StatementType.IF,
					condition,
					body: main_block,
					else: else_block,
				};
			},
		};
	}
}

export class TablesPlugin extends PlaguePlugin<{
	expression: {
		type: ExpressionType.CUSTOM;
		id: "table";
		data: TableEntry[];
	};
}> {
	readonly id = "table";

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

				return {
					type: ExpressionType.CUSTOM,
					id: this.id,
					data: entries,
				};
			},
			handle: (expression, scope) => {
				const obj: Record<string, DataValue> = {};
				let index: number = 1;

				for (const entry of expression.data) {
					if ("key" in entry) {
						obj[entry.key] = PlagueLanguage.evaluateExpression(
							entry.value,
							scope
						);
					} else {
						obj[index++] = PlagueLanguage.evaluateExpression(
							entry.value,
							scope
						);
					}
				}

				return {
					type: DataTypes.OBJECT,
					value: obj,
				};
			},
		};
	}
}

export class ForLoopPlugin extends PlaguePlugin<{
	statement: {
		type: StatementType.CUSTOM_PLUGIN;
		id: "for-loop";
		data: {
			name: string;
			start: Expression;
			end: Expression;
			body: Statement[];
		};
	};
}> {
	readonly id = "for-loop";
	max_calls: number = Infinity;

	constructor() {
		super();

		this.statement = {
			case: (t) => t.type == TokenType.IDENTIFIER && t.value == "for",
			handleStatement: (statement, scope): void => {
				const start_value = PlagueLanguage.evaluateExpression(
					statement.data.start,
					scope
				);
				const end_value = PlagueLanguage.evaluateExpression(
					statement.data.end,
					scope
				);
				const start =
					start_value.type == DataTypes.NUMBER
						? start_value.value
						: 0;
				const end =
					end_value.type == DataTypes.NUMBER ? end_value.value : 0;
				let calls: number = 0;
				for (let i = start; i <= end; i++) {
					calls++;
					if (calls++ > this.max_calls) {
						throw new Error("Too many for-loop calls!");
					}
				}
			},
			createStatement: (ctx: PlagueParserContext) => {
				const { iterator } = ctx;
				iterator.expect(this.statement.case);
				const name = iterator.expectResult(TokenType.IDENTIFIER).value;
				iterator.expect(TokenType.EQUAL);
				const start = PlagueParser.parseExpression(ctx);
				iterator.expect(TokenType.COMMA);
				const end = PlagueParser.parseExpression(ctx);
				const body = PlagueParser.parseBlock(ctx, () => {
					return PlagueParser.parseStatement(ctx);
				});

				return {
					type: StatementType.CUSTOM_PLUGIN,
					id: this.id,
					data: {
						name,
						start,
						end,
						body,
					},
				};
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
