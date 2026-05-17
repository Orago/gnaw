// import { Lexer } from "../lexer.js";
// import TokenIterator from "../token-iterator.js";
// import { AnyToken, TokenType } from "../tokens.js";
// import { CastPlugin } from "./core-plugins.js";
// import { method_mods, MethodMod } from "./core-utilities.js";
// import {
// 	BinaryMethod,
// 	Expression,
// 	ExpressionType,
// 	PlagueParserContext,
// 	Statement,
// 	StatementType,
// } from "./interfaces.js";
// import { PlagueParser } from "./parser.js";
// import {
// 	type PlagueEnvironment,
// 	type PlagueScope,
// 	type PlagueSystem,
// } from "./states.js";
// import { DataType as DataType, FunctionDataValue } from "./variables.js";
// import type { DataValue } from "./variables.js";

export class PlagueLanguage {
	static createFunction(
		parameters: string[],
		body: Statement[],
		closure: PlagueScope
	): FunctionDataValue {
		return {
			type: DataType.FUNCTION,
			call(args: DataValue[]) {
				const local = closure.extend();

				parameters.forEach((p, i) => {
					local.set(p, args[i]);
				});

				try {
					for (const statement of body) {
						PlagueLanguage.execStatement(statement, local);
					}
				} catch (ret: any) {
					if (ret.type === "return") {
						return ret.value;
					} else {
						throw ret;
					}
				}

				return null;
			},
		};
	}
	constructor() {}

	static createContext(
		system: PlagueSystem,
		tokens: AnyToken[]
	): PlagueParserContext {
		const iterator = new TokenIterator(tokens);

		return {
			iterator,
			system,
		};
	}

	static parseString(system: PlagueSystem, script: string) {
		const lexed = Lexer.lex(script);
		let tokens = Lexer.tokenize(lexed, {});
		tokens = Lexer.excluding(tokens, [TokenType.NEWLINE, TokenType.INDENT]);
		return this.parse(system, tokens);
	}

	static parse(system: PlagueSystem, tokens: AnyToken[]): Statement[] {
		const statements: Statement[] = [];
		const ctx: PlagueParserContext = this.createContext(system, tokens);

		while (ctx.iterator.peek().type != TokenType.EOF) {
			statements.push(PlagueParser.parseStatement(ctx));
		}

		return statements;
	}

	static run(environment: PlagueEnvironment, program: Statement[]) {
		const scope = environment.root_scope;
		scope.variables;

		for (const plugin of environment.system.plugins) {
			if (plugin.values != undefined) {
				const values = plugin.values();
				if (Array.isArray(values)) {
					for (const [key, value, options] of values) {
						scope.set(key, value, options);
					}
				} else {
					for (const [k, v] of Object.entries(values)) {
						scope.set(k, v);
					}
				}
			}
		}

		this.execManyStatements(program, scope);
	}

	static execManyStatements(statements: Statement[], scope: PlagueScope) {
		for (const statement of statements) {
			PlagueLanguage.execStatement(statement, scope);
		}
	}

	static execStatement(statement: Statement, scope: PlagueScope): void {
		for (const plugin of scope.environment.system.plugins) {
			if (plugin.statement == undefined) continue;

			const test =
				plugin.statement.test != undefined
					? plugin.statement.test(statement)
					: statement.type == StatementType.CUSTOM_PLUGIN &&
					  plugin.statement != undefined &&
					  statement.id == plugin.id;

			if (test) {
				plugin.statement.handleStatement(statement, scope);
			}
		}

		switch (statement.type) {
			case StatementType.VARIABLE: {
				const value = this.evaluateExpression(statement.value, scope);
				scope.set(statement.name, value);
				return;
			}
			case StatementType.EXPRESSION: {
				this.evaluateExpression(statement.expression, scope);
				return;
			}
		}
	}

	static evaluateExpression(
		expression: Expression,
		scope: PlagueScope
	): DataValue {
		switch (expression.type) {
			case ExpressionType.NUMBER:
				return { type: DataType.NUMBER, value: expression.value };
			case ExpressionType.STRING:
				return { type: DataType.STRING, value: expression.value };
			case ExpressionType.BOOLEAN:
				return { type: DataType.BOOLEAN, value: expression.value };
			case ExpressionType.IDENTIFIER:
				return (
					scope.get(expression.name) ?? {
						type: DataType.NULL,
						value: 0,
					}
				);
			case ExpressionType.Binary: {
				const left = PlagueLanguage.evaluateExpression(
					expression.left,
					scope
				);
				const right = PlagueLanguage.evaluateExpression(
					expression.right,
					scope
				);

				if (expression.op == BinaryMethod.AS) {
					if (expression.right.type != ExpressionType.IDENTIFIER) {
						throw new Error("Cannot cast to non-identifier");
					}
					console.log("CASTING", [left, expression.right]);
					try {
						return CastPlugin.handle(left, expression.right.name);
					} catch (e) {
						throw new Error(
							`Cannot cast data to type (${left.type}) -> (${expression.right.type})`
						);
					}
				}

				const primary = MethodMod.name(
					left.type,
					expression.op,
					right.type
				);
				const other_any_typed = MethodMod.name(
					left.type,
					expression.op,
					DataType.ANY
				);

				if (left.type == DataType.ARRAY) {
					const m = MethodMod.operateArray(
						left,
						expression.op,
						right
					);
					if (m) return m;
				}

				if (left.type == DataType.NUMBER) {
					const m = MethodMod.operateNumber(
						left,
						expression.op,
						right
					);
					if (m) return m;
				}

				if (
					left.type == DataType.STRING ||
					left.type == DataType.NUMBER
				) {
					const m = MethodMod.operateString(
						left,
						expression.op,
						right
					);
					if (m) return m;
				}

				throw new Error(`Invalid operator ${expression.op}`);
			}

			case ExpressionType.CallExpression: {
				const fn = PlagueLanguage.evaluateExpression(
					expression.callee,
					scope
				) as FunctionDataValue;
				const args = expression.args.map((arg) =>
					PlagueLanguage.evaluateExpression(arg, scope)
				);
				const got =
					fn?.type == DataType.FUNCTION
						? fn.call(args) ?? {
								type: DataType.NULL,
								value: 0,
						  }
						: {
								type: DataType.NULL,
								value: 0,
						  };
				return got as DataValue;
			}

			case ExpressionType.MemberAccess: {
				const object = this.evaluateExpression(
					expression.object,
					scope
				);
				const key = this.evaluateExpression(expression.property, scope);

				if (
					object.type == DataType.ARRAY &&
					key.type == DataType.NUMBER
				) {
					return (
						object.value?.[key.value] ?? {
							type: DataType.NULL,
							value: 0,
						}
					);
				} else if (
					object.type == DataType.OBJECT &&
					(key.type == DataType.STRING || key.type == DataType.NUMBER)
				) {
					return (
						object.value?.[key.value] ?? {
							type: DataType.NULL,
							value: 0,
						}
					);
				} else {
					return {
						type: DataType.NULL,
						value: 0,
					};
				}
			}

			case ExpressionType.ASSIGN: {
				const value = this.evaluateExpression(expression.value, scope);

				if (expression.target.type == ExpressionType.IDENTIFIER) {
					scope.set(expression.target.name, value);
				}

				if (expression.target.type == ExpressionType.MemberAccess) {
					const obj = this.evaluateExpression(
						expression.target.object,
						scope
					);
					const key = this.evaluateExpression(
						expression.target.property,
						scope
					);

					console.log("modifying", obj, key);
				}
				break;
			}
			case ExpressionType.CUSTOM: {
				for (const plugin of scope.environment.system.plugins) {
					if (
						plugin.id == expression.id &&
						plugin.primary_literal != undefined
					) {
						return plugin.primary_literal.handle(expression, scope);
					}
				}
			}
		}

		throw new Error(`Invalid expression ${expression.type}`);
	}
}
