// import type { IterableCheck } from "../token-iterator.js";
// import { TokenType } from "../tokens.js";
// import {
// 	type Expression,
// 	type PlagueParserContext,
// 	type Statement,
// 	StatementType,
// } from "./interfaces.js";
// import { PlagueParser } from "./parser.js";
// import { PlagueLanguage } from "./language.js";
// import { PlaguePlugin } from "./plugin-utility.js";
// import type { PlagueScope } from "./states.js";
// import { DataTypes } from "./variables.js";

export class VariablePlugin extends PlaguePlugin {
	declare StatementFormat: {
		type: StatementType.VARIABLE;
		name: string;
		value: Expression;
	};
	id = "variable";
	statement_case: IterableCheck = (t) =>
		t.type == TokenType.IDENTIFIER && t.value == "let";
	handleStatement(statement: this["StatementFormat"], scope: PlagueScope) {
		const value = PlagueLanguage.evaluateExpression(statement.value, scope);
		scope.set(statement.name, value);
	}
	createStatement(ctx: PlagueParserContext): this["StatementFormat"] {
		const { iterator } = ctx;
		iterator.expect(this.statement_case);
		const name = iterator.expectResult(TokenType.IDENTIFIER).value;
		iterator.expect(TokenType.EQUAL);
		const value = PlagueParser.parseExpression(ctx);
		return {
			type: StatementType.VARIABLE,
			name,
			value,
		};
	}
}

export class FunctionPlugin extends PlaguePlugin {
	declare StatementFormat: {
		type: StatementType.FUNCTION;
		name: string;
		params: string[];
		body: Statement[];
	};
	id = "function";
	statement_case: IterableCheck = (t) =>
		t.type == TokenType.IDENTIFIER && t.value == "fn";

	handleStatement(statement: this["StatementFormat"], scope: PlagueScope) {
		const fn = PlagueLanguage.createFunction(
			statement.params,
			statement.body,
			scope
		);
		scope.set(statement.name, fn);
	}
	createStatement(ctx: PlagueParserContext): this["StatementFormat"] {
		const { iterator } = ctx;
		iterator.expect(this.statement_case);
		const name = iterator.expectResult(TokenType.IDENTIFIER).value;
		const params = PlagueParser.parseBlock(
			ctx,
			() => {
				const v = ctx.iterator.expectResult(TokenType.IDENTIFIER).value;
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
	}
}

export class ReturnPlugin extends PlaguePlugin {
	declare StatementFormat: { type: StatementType.RETURN; value?: Expression };
	id = "return";
	statement_case: IterableCheck = (t) =>
		t.type == TokenType.IDENTIFIER && t.value == "return";

	handleStatement(
		statement: this["StatementFormat"],
		scope: PlagueScope
	): void {
		const value = statement.value
			? PlagueLanguage.evaluateExpression(statement.value, scope)
			: null;
		throw { type: "return", value };
	}

	createStatement(ctx: PlagueParserContext): Statement {
		const { iterator } = ctx;
		iterator.expect(this.statement_case);

		if (iterator.peek().type == TokenType.BRACE_RIGHT) {
			return { type: StatementType.RETURN };
		} else {
			return {
				type: StatementType.RETURN,
				value: PlagueParser.parseExpression(ctx),
			};
		}
	}
}

export class TablesPlugin extends PlaguePlugin<{
	type: StatementType.IF;
	condition: Expression;
	body: Statement[];
	else?: Statement[];
}> {
	StatementFormat: {
		type: StatementType.IF;
		condition: Expression;
		body: Statement[];
		else?: Statement[];
	};
	id = "table";

	constructor() {
		super();

		this.statement = {
			case: (t) => t.type == TokenType.BRACE_LEFT,
			handleStatement: (statement, scope: PlagueScope) => {
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
			createStatement: (ctx: PlagueParserContext) => {
				const { iterator } = ctx;
				iterator.expect(this.statement!.case);

				const condition = PlagueParser.parseExpression(ctx);
				const main_block: Statement[] = PlagueParser.parseBlock(
					ctx,
					() => PlagueParser.parseStatement(ctx)
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
	statement_case: IterableCheck = (t) => t.type == TokenType.BRACE_LEFT;

	handleStatement(
		statement: this["StatementFormat"],
		scope: PlagueScope
	): void {
		const condition = PlagueLanguage.evaluateExpression(
			statement.condition,
			scope
		);

		if (condition) {
			PlagueLanguage.execManyStatements(statement.body, scope);
		} else if (statement.else != undefined) {
			PlagueLanguage.execManyStatements(statement.body, scope);
		}
	}

	createStatement(ctx: PlagueParserContext): this["StatementFormat"] {
		const { iterator } = ctx;
		iterator.expect(this.statement_case);

		const condition = PlagueParser.parseExpression(ctx);
		const main_block: Statement[] = PlagueParser.parseBlock(ctx, () => {
			return PlagueParser.parseStatement(ctx);
		});

		let else_block: Statement[] = [];

		if (
			iterator.disposeIf(
				"is",
				(t) => t.type == TokenType.IDENTIFIER && t.value == "else"
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
	}
}

export const core_plugins: PlaguePlugin[] = [
	new VariablePlugin(),
	new FunctionPlugin(),
	new ReturnPlugin(),
	new TablesPlugin(),
];
