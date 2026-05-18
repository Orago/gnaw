import { TokenType } from "../tokens.js";
import {
	Ast,
	type Expression,
	ExpressionType,
	type ParserContext as ParserContext,
	ReturnStatement,
	type Statement,
	StatementType,
	VariableOptions,
} from "./interfaces.js";
import { Parser } from "./parser.js";
import { PlagueLanguage } from "./language.js";
import { PlaguePlugin } from "./plugin-utility.js";
import { DataType, DataValue, Var } from "./variables.js";

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
				const value = Parser.parseExpression(ctx);
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
		return Parser.parseBlock(
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
		return Parser.parseBlock(ctx, () => {
			return Parser.parseStatement(ctx);
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
						value: Parser.parseExpression(ctx),
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

			createStatement: (ctx) => {
				const { iterator } = ctx;
				iterator.expect(this.statement.case);

				const condition = Parser.parseExpression(ctx);
				console.log("left", [...iterator.clone()]);
				const main_block: Statement[] = Parser.parseBlock(ctx, () => {
					return Parser.parseStatement(ctx);
				});

				let else_block: Statement[] = [];

				if (
					iterator.disposeIf(
						"is",
						(t) =>
							t.type == TokenType.IDENTIFIER && t.value == "else"
					)
				) {
					else_block = Parser.parseBlock(ctx, () => {
						return Parser.parseStatement(ctx);
					});
				}

				return {
					type: StatementType.IF,
					condition,
					body: main_block,
					else: else_block,
				};
			},
			test: (statement) => statement.type == StatementType.IF,
			handleStatement(statement, scope): void {
				const condition = PlagueLanguage.evaluateExpression(
					statement.condition,
					scope
				);
				console.log("muh", condition, statement);
				if (condition) {
					PlagueLanguage.execManyStatements(statement.body, scope);
				} else if (statement.else != undefined) {
					PlagueLanguage.execManyStatements(statement.else, scope);
				}
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
						iterator.peek().type === TokenType.IDENTIFIER &&
						iterator.peek(1).type === TokenType.PAREN_LEFT
					) {
						TablesPlugin.handleInlineMethod(ctx, entries);
						continue;
					} else if (
						iterator.peek().type == TokenType.IDENTIFIER &&
						iterator.peek(1).type == TokenType.EQUAL
					) {
						const key = iterator.expectResult(
							TokenType.IDENTIFIER
						).value;
						iterator.expect(TokenType.EQUAL);
						const value = Parser.parseExpression(ctx);
						entries.push({ key, value });
					} else {
						const value = Parser.parseExpression(ctx);
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

	static handleInlineMethod(ctx: ParserContext, entries: TableEntry[]) {
		const { iterator } = ctx;
		const name = iterator.expectResult(TokenType.IDENTIFIER);
		iterator.expect(TokenType.PAREN_LEFT);
		const params: string[] = [];

		while (iterator.peek().type !== TokenType.PAREN_RIGHT) {
			const param = iterator.expectResult(TokenType.IDENTIFIER);
			params.push(param.value);
			iterator.disposeIf("is", TokenType.COMMA);
		}

		iterator.expect(TokenType.PAREN_RIGHT);

		const body = Parser.parseBlock(ctx, () => Parser.parseStatement(ctx));

		entries.push({
			key: name.value,
			value: Ast.Function(params, body),
		});
	}
}

export class ClassPlugin extends PlaguePlugin<{
	statement: {
		type: StatementType.CUSTOM;
		id: "class";
		data: {
			name: string;
			methods: {
				name: string;
				params: string[];
				body: Statement[];
			}[];
		};
	};
}> {
	readonly id = "class";

	constructor() {
		super();

		this.statement = {
			case: (t) => t.type == TokenType.IDENTIFIER && t.value == "class",

			createStatement: (ctx) => {
				const { iterator } = ctx;
				const class_name = iterator.expectResult(
					TokenType.IDENTIFIER
				).value;
				iterator.expect(TokenType.BRACE_LEFT);
				const methods = [];

				while (!iterator.disposeIf("is", TokenType.BRACE_RIGHT)) {
					const method_name = iterator.expectResult(
						TokenType.IDENTIFIER
					).value;

					const params = Parser.parseParameters(ctx);

					const body = Parser.parseBlock(ctx, () => {
						return Parser.parseStatement(ctx);
					});

					methods.push({ name: method_name, params, body });
				}

				return {
					type: StatementType.CUSTOM,
					id: this.id,
					data: {
						name: class_name,
						methods,
					},
				};
			},
			test: (statement) =>
				statement.type == StatementType.CUSTOM &&
				statement.id == this.id,

			handleStatement: (statement, scope_ref) => {
				const { methods, name: class_name } = statement.data;
				const method_map = new Map(methods.map((m) => [m.name, m]));

				const constructor_method = method_map.get("constructor");

				const class_fn = Var.Function((args) => {
					const obj = Var.Object({});

					// attach methods
					for (const m of methods) {
						obj.value[m.name] = Var.Function((call_args) => {
							const method_scope = scope_ref.extend();

							// inject this
							method_scope.set("this", obj);

							// bind params
							m.params.forEach((p, i) => {
								method_scope.set(p, call_args[i + 1]); // skip this
							});

							PlagueLanguage.execManyStatements(
								m.body,
								method_scope
							);

							return;
						});
					}

					// call constructor if exists
					if (constructor_method) {
						obj.value["constructor"].call([obj, ...args]);
					}

					return obj;
				});

				scope_ref.set(class_name, class_fn);
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
					const value = Parser.parseExpression(ctx);
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
		type: StatementType.CUSTOM;
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
				const local_scope = scope.extend();

				for (let i = start; i <= end; i++) {
					calls++;
					if (calls++ > this.max_calls) {
						throw new Error("Too many for-loop calls!");
					}

					// local_scope.set(statement.data.name, )
				}
			},
			createStatement: (ctx: ParserContext) => {
				const { iterator } = ctx;
				iterator.expect(this.statement.case);
				const name = iterator.expectResult(TokenType.IDENTIFIER).value;

				iterator.expect(TokenType.EQUAL);
				iterator.expect(TokenType.PAREN_LEFT);

				const start = Parser.parseExpression(ctx);
				iterator.expect(TokenType.COMMA);
				const end = Parser.parseExpression(ctx);
				iterator.expect(TokenType.PAREN_RIGHT);
				const body = Parser.parseBlock(ctx, () => {
					return Parser.parseStatement(ctx);
				});

				return {
					type: StatementType.CUSTOM,
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
						return;
					}
					case DataType.STRING: {
						v.value.concat(
							...args.slice(1).map((arg) => {
								return arg.type == DataType.STRING
									? arg.type
									: "";
							})
						);
						return;
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
	new ForLoopPlugin(),
	new IfPlugin(),
];
