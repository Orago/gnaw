import { TokenType } from "../tokens.js";
import {
	Ast,
	type Expression,
	ExpressionType,
	IfStatement,
	type ParserContext as ParserContext,
	ReturnStatement,
	type Statement,
	StatementType,
	VariableOptions,
} from "./interfaces.js";
import { Parser } from "./parser.js";
import { FunctionUtil, Language } from "./language.js";
import { Plugin, PluginImplCtx } from "./plugin-utility.js";
import { DataType, DataValue, DataValueOf, Var } from "./variables.js";
import { TypeCasts } from "./casts.js";

export class VariablePlugin extends Plugin {
	id = "variable";
	constructor() {
		super();

		this.statements = [
			Plugin.statementHandler<{
				type: StatementType.VARIABLE;
				name: string;
				value: Expression;
			}>({
				trim_case: true,
				case: (t) => t.type == TokenType.IDENTIFIER && t.value == "let",
				createStatement: (ctx) => {
					const { iterator } = ctx;
					const name = iterator.expectResult(
						TokenType.IDENTIFIER
					).value;
					iterator.expect(TokenType.EQUAL);
					const value = Parser.parseExpression(ctx);
					return {
						type: StatementType.VARIABLE,
						name,
						value,
					};
				},
				handleStatement(statement, scope) {
					const value = Language.evaluateExpression(
						statement.value,
						scope
					);
					scope.set(statement.name, value);
				},
			}),
		];
	}
}

export class FunctionPlugin extends Plugin<{}> {
	id = "function";

	static getParams(ctx: ParserContext) {
		return Parser.parseParameterNames(
			ctx,
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

		this.expressions = [
			Plugin.expressionHandler<{
				type: ExpressionType.FUNCTION;
				params: string[];
				body: Statement[];
			}>({
				case: (t) => t.type == TokenType.IDENTIFIER && t.value == "fn",
				create: (ctx) => {
					const params = FunctionPlugin.getParams(ctx);
					const body = Parser.parseStatementBlock(ctx);

					return {
						type: ExpressionType.FUNCTION,
						params,
						body,
					};
				},
				test: (expression) =>
					expression.type == ExpressionType.FUNCTION,
				handle: (expression) => {
					const fn = FunctionUtil.createFunction(
						expression.params,
						expression.body
					);

					return fn;
				},
			}),
		];

		this.statements = [
			Plugin.statementHandler<{
				type: StatementType.FUNCTION;
				name: string;
				params: string[];
				body: Statement[];
			}>({
				trim_case: true,
				case: (t) => t.type == TokenType.IDENTIFIER && t.value == "fn",
				createStatement: (ctx) => {
					const { iterator } = ctx;
					const name = iterator.expectResult(
						TokenType.IDENTIFIER
					).value;
					const params = FunctionPlugin.getParams(ctx);
					const body = Parser.parseStatementBlock(ctx);

					return {
						type: StatementType.FUNCTION,
						name: name,
						params,
						body,
					};
				},
				test: (statement) => statement.type == StatementType.FUNCTION,

				handleStatement: (statement, scope) => {
					const fn = FunctionUtil.createFunction(
						statement.params,
						statement.body
					);
					scope.set(statement.name, fn);
				},
			}),
		];
	}
}

export class ReturnPlugin extends Plugin<{}> {
	id = "return";

	constructor() {
		super();

		this.statements = [
			Plugin.statementHandler<ReturnStatement | IfStatement>({
				trim_case: true,
				case: (t) =>
					t.type == TokenType.IDENTIFIER && t.value == "return",
				createStatement: (ctx: ParserContext) => {
					const { iterator } = ctx;
					if (iterator.peek().type == TokenType.BRACE_RIGHT) {
						return { type: StatementType.RETURN };
					} else {
						const value_offset_a = iterator.offset;
						const value = Parser.parseExpression(ctx);
						const value_offset_b = iterator.offset;

						if (
							iterator.match(
								(t) =>
									t.type == TokenType.IDENTIFIER &&
									t.value == "if"
							)
						) {
							iterator.next();

							// question mark self-injection
							// ! Probably shouldn't be injecting directly but wtv
							if (
								iterator.match(
									(t) => t.type == TokenType.QUESTION_MARK
								)
							) {
								iterator.next();
								const qm_i = iterator.offset;
								const caught = iterator.items.slice(
									value_offset_a,
									value_offset_b
								);
								iterator.injectAfter(caught, qm_i);
							}

							const condition = Parser.parseExpression(ctx);

							return {
								type: StatementType.IF,
								condition,
								body: [{ type: StatementType.RETURN, value }],
							};
						}

						return {
							type: StatementType.RETURN,
							value,
						};
					}
				},

				test: (statement) => statement.type == StatementType.RETURN,
				handleStatement: (statement, scope): void => {
					if (statement.type != StatementType.RETURN) return;
					const value = statement.value
						? Language.evaluateExpression(statement.value, scope)
						: null;

					FunctionUtil.functionReturn(value);
				},
			}),
		];
	}
}

export class IfPlugin extends Plugin {
	id = "if";

	constructor() {
		super();

		this.statements = [
			Plugin.statementHandler<IfStatement>({
				trim_case: true,
				case: (t) => t.type == TokenType.IDENTIFIER && t.value == "if",
				createStatement: (ctx) => {
					const { iterator } = ctx;
					const condition = Parser.parseExpression(ctx);

					const main_block: Statement[] =
						Parser.parseStatementBlock(ctx);

					let else_block: Statement[] = [];

					if (
						iterator.disposeIf(
							"is",
							(t) =>
								t.type == TokenType.IDENTIFIER &&
								t.value == "else"
						)
					) {
						else_block = Parser.parseStatementBlock(ctx);
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
					const condition = Language.evaluateExpression(
						statement.condition,
						scope
					);
					if (
						condition.type == DataType.BOOLEAN &&
						condition.value == true
					) {
						Language.execManyStatements(statement.body, scope);
					} else if (statement.else != undefined) {
						Language.execManyStatements(statement.else, scope);
					}
				},
			}),
		];
	}
}

export type TableEntry =
	| { key: string; value: Expression }
	| { value: Expression };

export class TablesPlugin extends Plugin<{}> {
	readonly id = "table";

	constructor() {
		super();

		this.expressions = [
			Plugin.expressionHandler<{
				type: ExpressionType.CUSTOM;
				id: "table";
				data: TableEntry[];
			}>({
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
							obj[entry.key] = Language.evaluateExpression(
								entry.value,
								scope
							);
						} else {
							obj[index++] = Language.evaluateExpression(
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
			}),
		];
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

interface ClassStatement {
	type: StatementType.CUSTOM;
	id: "class";
	data: {
		name: string;
		methods: {
			[name: string]: {
				params: string[];
				body: Statement[];
			};
		};
	};
}
export class ClassPlugin extends Plugin {
	readonly id = "class";

	constructor() {
		super();

		this.statements = [
			Plugin.statementHandler<ClassStatement>({
				trim_case: true,
				case: (t) =>
					t.type == TokenType.IDENTIFIER && t.value == "class",
				createStatement: (ctx) => {
					const { iterator } = ctx;
					const class_name = iterator.expectResult(
						TokenType.IDENTIFIER
					).value;
					const methods: ClassStatement["data"]["methods"] = {};
					Parser.parseBlock(ctx, () => {
						const method_name = iterator.expectResult(
							TokenType.IDENTIFIER
						).value;
						const params = Parser.parseParameterNames(ctx);
						const body = Parser.parseStatementBlock(ctx);
						methods[method_name] = { params, body };
					});

					return {
						type: StatementType.CUSTOM,
						id: this.id,
						data: {
							name: class_name,
							methods: methods,
						},
					};
				},
				test: (statement) =>
					statement.type == StatementType.CUSTOM &&
					statement.id == this.id,

				handleStatement: (statement, scope_ref) => {
					const { methods, name: class_name } = statement.data;

					const class_fn = Var.Function((ctx) => {
						const obj = Var.Object<DataValueOf<DataType.FUNCTION>>(
							{}
						);

						for (const [name, m] of Object.entries(methods)) {
							obj.value[name] = Var.Function((ctx) => {
								const method_scope = scope_ref.extend();
								method_scope.set("this", obj); //? this value
								FunctionUtil.bindParameters(m.params, ctx);
								return FunctionUtil.processFunction(
									m.body,
									method_scope
								);
							});
						}

						// call constructor if there is one
						if (obj.value["constructor"] != undefined) {
							FunctionUtil.callFunction(
								obj.value["constructor"],
								scope_ref,
								ctx.args,
								obj
							);
						}

						return obj;
					});

					scope_ref.set(class_name, class_fn);
				},
			}),
		];
	}
}

interface ArrayExpression {
	type: ExpressionType.CUSTOM;
	id: "vec";
	data: Expression[];
}

export class ArrayPlugin extends Plugin<{}> {
	readonly id = "vec";

	constructor() {
		super();
		const key = "vec";

		this.impl = [
			Plugin.implHandler({
				name: "push",
				case: (ctx) => {
					return (
						ctx.name == "push" &&
						ctx.data.type == DataType.ARRAY &&
						Var.is(ctx.data, DataType.ARRAY)
					);
				},
				handle(ctx) {
					if (Var.is(ctx.data, DataType.ARRAY)) {
						ctx.data.value.push(...ctx.args);
					}
					return ctx.data;
				},
			}),
			Plugin.implHandler({
				name: "each",
				case: (ctx) => {
					return (
						ctx.name == "each" &&
						ctx.data.type == DataType.ARRAY &&
						Var.is(ctx.data, DataType.ARRAY)
					);
				},
				handle(ctx) {
					if (Var.is(ctx.data, DataType.ARRAY)) {
						if (Var.is(ctx.args[0], DataType.FUNCTION)) {
							return Var.Array(
								[...ctx.data.value]
								// ctx.data.value.map(e => )
							);
						}

						throw new Error(
							"Cannot call 'Array:each<fn>' using a non-function"
						);
					}
					throw new Error(
						"Cannot call 'Array:each(<fn>)' on a non-array"
					);
					// return ctx.data;
				},
			}),
		];

		this.expressions = [
			Plugin.expressionHandler<{
				type: ExpressionType.CUSTOM;
				id: typeof key;
				data: Expression[];
			}>({
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
						id: key,
						data: entries,
					};
				},
				handle: (expression, scope) => {
					const obj: DataValue[] = [];

					for (const entry of expression.data) {
						const value = Language.evaluateExpression(entry, scope);
						obj.push(value);
					}

					return {
						type: DataType.ARRAY,
						value: obj,
					};
				},
			}),
		];
	}
}

export class ForLoopPlugin extends Plugin<{}> {
	readonly id = "for-loop";
	max_calls: number = Infinity;

	private static for_loop_statement = Plugin.statementHandler<{
		type: StatementType.CUSTOM;
		id: "for-loop";
		data: {
			name: string;
			start: Expression;
			end: Expression;
			body: Statement[];
		};
	}>({
		trim_case: true,
		case: (t) => t.type == TokenType.IDENTIFIER && t.value == "for",
		createStatement: (ctx: ParserContext) => {
			const { iterator } = ctx;
			const name = iterator.expectResult(TokenType.IDENTIFIER).value;

			iterator.expect(TokenType.EQUAL);
			iterator.expect(TokenType.PAREN_LEFT);

			const start = Parser.parseExpression(ctx);
			iterator.expect(TokenType.COMMA);
			const end = Parser.parseExpression(ctx);
			iterator.expect(TokenType.PAREN_RIGHT);
			const body = Parser.parseStatementBlock(ctx);

			return {
				type: StatementType.CUSTOM,
				id: "for-loop",
				data: {
					name,
					start,
					end,
					body,
				},
			};
		},
		handleStatement: (statement, scope): void => {
			const start = Language.evaluateExpression(
				statement.data.start,
				scope
			);
			const end = Language.evaluateExpression(statement.data.end, scope);
			const start_v = start.type == DataType.NUMBER ? start.value : 0;
			const end_v = end.type == DataType.NUMBER ? end.value : 0;

			let calls: number = 0;
			const local_scope = scope.extend();
			const max = scope.environment.options.max_loop_stack;
			for (let i = start_v; i <= end_v; i++) {
				if (++calls > max) {
					throw new Error(
						`Too many for-loop calls! (${calls} > ${max})`
					);
				}

				local_scope.set(statement.data.name, Var.Number(i));
				Language.execManyStatements(statement.data.body, local_scope);
			}
		},
	});

	constructor() {
		super();

		this.statements = [ForLoopPlugin.for_loop_statement];
	}
}

export class StringExtension extends Plugin<{}> {
	public id = "string-extension";
	constructor() {
		super();

		this.impl = [
			{
				name: "with",
				case: (ctx) => {
					return (
						ctx.name == "with" &&
						ctx.args[0]?.type == DataType.FUNCTION
					);
				},
				handle: (ctx) => {
					if (Var.is(ctx.args[0], DataType.FUNCTION)) {
						return (
							FunctionUtil.callFunction(ctx.args[0], ctx.scope, [
								ctx.data,
							]) ?? Var.Null()
						);
					}
					return ctx.data;
				},
			},
			{
				name: "string-uppercase",
				case: (ctx) =>
					ctx.name == "upper" && ctx.data.type == DataType.STRING,
				handle: (ctx) => {
					if (Var.is(ctx.data, DataType.STRING)) {
						return Var.String(ctx.data.value.toUpperCase());
					}
					return ctx.data;
				},
			},
			{
				name: "string-lowercase",
				case: (ctx) =>
					ctx.name == "lower" && ctx.data.type == DataType.STRING,
				handle(ctx) {
					if (Var.is(ctx.data, DataType.STRING)) {
						return Var.String(ctx.data.value.toLowerCase());
					}
					return ctx.data;
				},
			},
		];
	}
}

class TypeCastPlugin extends Plugin {
	id = "basic-type-casts";
	constructor() {
		super();

		this.impl = [
			Plugin.implHandler({
				name: "cast",
				case: (ctx) => ctx.name == "cast",
				handle: (ctx) => {
					if (Var.is(ctx.args[0], DataType.STRING) != true) {
						throw new Error("Invalid cast type");
					}

					try {
						return TypeCasts.cast(ctx.data, ctx.args[0].value);
					} catch (e) {
						throw new Error(
							`Cannot cast data to type (${ctx.data.type}) -> (${ctx.args[0].type})`
						);
					}
				},
			}),
		];
	}
}

export class CoreMethodsPlugin {
	static READONLY_VARIABLE: VariableOptions = {
		readonly: true,
	};

	static FN_PRINT = Plugin.wrapFunction(
		"print",
		{
			type: DataType.FUNCTION,
			call(ctx) {
				console.log(
					">>",
					ctx.args.map((e) =>
						"value" in e ? e.value : Symbol("Custom")
					)
				);
				return { type: DataType.NULL, value: 0 };
			},
		},
		CoreMethodsPlugin.READONLY_VARIABLE
	);

	static FN_LEN = Plugin.wrapFunction(
		"len",
		{
			type: DataType.FUNCTION,
			call: ({ args: args }) => {
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

	static FN_PUSH = Plugin.wrapFunction(
		"push",
		{
			type: DataType.FUNCTION,
			call: ({ args: args }) => {
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

	static list: Plugin["values"] = () => [this.FN_PRINT(), this.FN_LEN()];
}

export const core_plugins: Plugin<any>[] = [
	new VariablePlugin(),
	new FunctionPlugin(),
	new ReturnPlugin(),
	new TablesPlugin(),
	new ArrayPlugin(),
	new ForLoopPlugin(),
	new IfPlugin(),
	new ClassPlugin(),
	new StringExtension(),
	new TypeCastPlugin(),
];
