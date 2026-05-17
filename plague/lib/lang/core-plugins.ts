import type { IterableCheck } from "../token-iterator.js";
import { TokenType } from "../tokens.js";
import {
	type Expression,
	ExpressionType,
	type PlagueParserContext as ParserContext,
	ReturnStatement,
	type Statement,
	StatementType,
	VariableOptions,
} from "./interfaces.js";
import { PlagueParser } from "./parser.js";
import { PlagueLanguage } from "./language.js";
import { PlagueFNCallback, PlaguePlugin } from "./plugin-utility.js";
import type { PlagueScope } from "./states.js";
import { DataType, DataValue } from "./variables.js";

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
	expression: {
		type: ExpressionType.FUNCTION;
		params: string[];
		body: Statement[];
	};
}> {
	id = "function";

	static getParams(ctx: ParserContext) {
		return PlagueParser.parseBlock(
			ctx,
			() => {
				const v = ctx.iterator.expectResult(TokenType.IDENTIFIER).value;
				ctx.iterator.disposeIf("is", TokenType.COMMA);
				return v;
			},
			TokenType.PAREN_LEFT,
			TokenType.PAREN_RIGHT
		);
	}

	static getBlock(ctx: ParserContext) {
		return PlagueParser.parseBlock(ctx, () => {
			return PlagueParser.parseStatement(ctx);
		});
	}

	constructor() {
		super();

		this.primary_literal = {
			case: (t) => t.type == TokenType.IDENTIFIER && t.value == "fn",
			create: (ctx) => {
				const params = FunctionPlugin.getParams(ctx);
				const body = FunctionPlugin.getBlock(ctx);

				return {
					type: ExpressionType.FUNCTION,
					params,
					body,
				};
			},
			test: (expression) => expression.type == ExpressionType.FUNCTION,
			handle: (expression, scope) => {
				const fn = PlagueLanguage.createFunction(
					expression.params,
					expression.body,
					scope
				);

				return fn;
			},
		};

		this.statement = {
			case: (t) => t.type == TokenType.IDENTIFIER && t.value == "fn",

			createStatement: (ctx) => {
				const { iterator } = ctx;
				iterator.expect(this.statement.case);
				const name = iterator.expectResult(TokenType.IDENTIFIER).value;
				const params = FunctionPlugin.getParams(ctx);
				const body = FunctionPlugin.getBlock(ctx);

				return {
					type: StatementType.FUNCTION,
					name: name,
					params,
					body,
				};
			},
			test: (statement) => statement.type == StatementType.FUNCTION,

			handleStatement: (statement, scope) => {
				const fn = PlagueLanguage.createFunction(
					statement.params,
					statement.body,
					scope
				);
				scope.set(statement.name, fn);
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
			test: (statement) => statement.type == StatementType.RETURN,

			handleStatement: (statement, scope): void => {
				const value = statement.value
					? PlagueLanguage.evaluateExpression(statement.value, scope)
					: null;
				throw { type: "return", value };
			},
			createStatement: (ctx: ParserContext) => {
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

export type TableEntry =
	| { key: string; value: Expression }
	| { value: Expression };

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
					type: DataType.OBJECT,
					value: obj,
				};
			},
		};
	}
}

export class VecPlugin extends PlaguePlugin<{
	expression: {
		type: ExpressionType.CUSTOM;
		id: "vec";
		data: Expression[];
	};
}> {
	readonly id = "vec";

	constructor() {
		super();

		this.primary_literal = {
			case: (t) => t.type == TokenType.BRACKET_LEFT,
			create: (ctx) => {
				const entries: Expression[] = [];
				const { iterator } = ctx;

				while (iterator.peek().type !== TokenType.BRACKET_RIGHT) {
					const value = PlagueParser.parseExpression(ctx);
					entries.push(value);
					iterator.disposeIf("is", TokenType.COMMA);
				}

				iterator.expect(TokenType.BRACKET_RIGHT);

				return {
					type: ExpressionType.CUSTOM,
					id: this.id,
					data: entries,
				};
			},
			handle: (expression, scope) => {
				const obj: DataValue[] = [];

				for (const entry of expression.data) {
					const value = PlagueLanguage.evaluateExpression(
						entry,
						scope
					);
					obj.push(value);
				}

				return {
					type: DataType.ARRAY,
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
					start_value.type == DataType.NUMBER ? start_value.value : 0;
				const end =
					end_value.type == DataType.NUMBER ? end_value.value : 0;
				let calls: number = 0;
				for (let i = start; i <= end; i++) {
					calls++;
					if (calls++ > this.max_calls) {
						throw new Error("Too many for-loop calls!");
					}
				}
			},
			createStatement: (ctx: ParserContext) => {
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

enum CastEnum {
	STRING = "string",
	NUMBER = "number",
	BOOLEAN = "boolean",
}

export class CastPlugin extends PlaguePlugin<{}> {
	static handle(data: DataValue, name: string): DataValue {
		switch (data.type) {
			// number -> (new-type)
			case DataType.NUMBER:
				switch (name) {
					case CastEnum.STRING:
						return {
							type: DataType.STRING,
							value: String(data.value),
						};
					case CastEnum.BOOLEAN:
						return {
							type: DataType.BOOLEAN,
							value: data.value != 0,
						};
				}
				break;

			// string -> (new-type)
			case DataType.STRING:
				switch (name) {
					case CastEnum.NUMBER: {
						const num = Number(data.value);
						return {
							type: DataType.NUMBER,
							value: isNaN(num) ? 0 : num,
						};
					}
					case CastEnum.BOOLEAN: {
						if (data.value == String(true)) {
							return { type: DataType.BOOLEAN, value: true };
						} else if (data.value == String(false)) {
							return { type: DataType.BOOLEAN, value: false };
						} else {
							return {
								type: DataType.BOOLEAN,
								value: data.value.trim().length > 0,
							};
						}
					}
				}
				break;

			case DataType.BOOLEAN:
				switch (name) {
					case CastEnum.NUMBER:
						return {
							type: DataType.NUMBER,
							value: +data.value,
						};

					case CastEnum.STRING:
						return {
							type: DataType.STRING,
							value: String(data.value),
						};
				}
				break;
		}

		throw new Error("Cannot cast");
	}

	id = "cast";
}

export class CoreMethodsPlugin {
	static READONLY_VARIABLE: VariableOptions = {
		readonly: true,
	};

	static FN_PRINT = PlaguePlugin.wrapFunction(
		"print",
		{
			type: DataType.FUNCTION,
			call(args) {
				console.log(
					">>",
					args.map((e) => ("value" in e ? e.value : Symbol("Custom")))
				);
				return { type: DataType.NULL, value: 0 };
			},
		},
		CoreMethodsPlugin.READONLY_VARIABLE
	);

	static FN_LEN = PlaguePlugin.wrapFunction(
		"len",
		{
			type: DataType.FUNCTION,
			call: (args) => {
				const v = args[0];

				switch (v.type) {
					// return { type: DataType.NUMBER, value: v.value.length }
					case DataType.STRING:
					case DataType.ARRAY:
						return {
							type: DataType.NUMBER,
							value: v.value.length,
						};

					case DataType.OBJECT:
						return {
							type: DataType.NUMBER,
							value: Object.keys(v.value).length,
						};
				}

				return { type: DataType.NULL, value: 0 };
			},
		},
		CoreMethodsPlugin.READONLY_VARIABLE
	);

	static FN_PUSH = PlaguePlugin.wrapFunction(
		"push",
		{
			type: DataType.FUNCTION,
			call: (args) => {
				const v = args[0];

				switch (v.type) {
					case DataType.ARRAY: {
						v.value.push(...args.slice(1));
						return null;
					}
					case DataType.STRING: {
						v.value.concat(
							...args.slice(1).map((arg) => {
								return arg.type == DataType.STRING
									? arg.type
									: "";
							})
						);
						return null;
					}
				}

				return { type: DataType.NULL, value: 0 };
			},
		},
		CoreMethodsPlugin.READONLY_VARIABLE
	);

	static list: PlaguePlugin["values"] = () => [
		this.FN_PRINT(),
		this.FN_LEN(),
	];
}

export const core_plugins: PlaguePlugin<any>[] = [
	new VariablePlugin(),
	new FunctionPlugin(),
	new ReturnPlugin(),
	new TablesPlugin(),
	new VecPlugin(),
];
