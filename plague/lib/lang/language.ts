import { Lexer } from "../lexer.js";
import TokenIterator from "../token-iterator.js";
import { AnyToken, TokenType } from "../tokens.js";
import { TypeCasts } from "./casts.js";
import { MethodOps } from "./core-utilities.js";
import {
	BinaryMethod,
	Expression,
	ExpressionType,
	ParserContext,
	Statement,
	StatementType,
} from "./interfaces.js";
import { Parser } from "./parser.js";
import { type Environment, type DataScope, type System } from "./states.js";
import type { DataValue } from "./variables.js";
import { DataType, FunctionDataValue, Var } from "./variables.js";

export class PlagueLanguage {
	static functionReturn(value: DataValue | null) {
		throw { type: StatementType.RETURN, value: value ?? Var.Null() };
	}

	static expectReturn(cb: (...any: any[]) => void) {
		try {
			cb();
		} catch (ret: any) {
			if (ret.type === StatementType.RETURN) return ret.value;
			else throw ret;
		}
	}

	static processFunction(statements: Statement[], scope: DataScope) {
		return PlagueLanguage.expectReturn(() => {
			return PlagueLanguage.execManyStatements(statements, scope);
		});
	}

	static createFunction(
		parameters: string[],
		body: Statement[],
		closure: DataScope
	): FunctionDataValue {
		return {
			type: DataType.FUNCTION,
			call(args: DataValue[]) {
				const local = closure.extend();

				parameters.forEach((p, i) => {
					local.set(p, args[i]);
				});

				return PlagueLanguage.processFunction(body, local);
			},
		};
	}
	constructor() {}



	
	static run(environment: Environment, program: Statement[]) {
		return PlagueLanguage.expectReturn(() => {
			return PlagueLanguage.runNest(environment, program);
		});
	}

	private static runNest(environment: Environment, program: Statement[]) {
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

	static execManyStatements(statements: Statement[], scope: DataScope) {
		for (const statement of statements) {
			PlagueLanguage.execStatement(statement, scope);
		}
	}

	static execStatement(statement: Statement, scope: DataScope): void {
		for (const plugin of scope.environment.system.plugins) {
			if (plugin.statement == undefined) continue;

			const test =
				plugin.statement.test != undefined
					? plugin.statement.test(statement)
					: statement.type == StatementType.CUSTOM &&
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

	static evalUnary(op: BinaryMethod, value: DataValue): DataValue {
		switch (op) {
			case BinaryMethod.SUBTRACT:
				if (value.type === DataType.NUMBER) {
					return Var.Number(-value.value);
				}
				throw new Error("Cannot negate non-number");

			case BinaryMethod.EXCLAMATION:
				if (value.type === DataType.BOOLEAN) {
					return Var.Boolean(!value.value);
				}
				throw new Error("Cannot invert non-boolean");

			default:
				throw new Error(`Unknown unary operator: ${op}`);
		}
	}

	static resolveTarget(
		expr: Expression,
		scope: DataScope
	): {
		get(): DataValue;
		set(value: DataValue): void;
	} {
		if (expr.type === ExpressionType.IDENTIFIER) {
			return {
				get: () => scope.get(expr.name) ?? Var.Null(),
				set: (value) => scope.set(expr.name, value),
			};
		}

		if (expr.type === ExpressionType.MEMBER_ACCESS) {
			const obj = this.evaluateExpression(expr.object, scope);
			const key = this.evaluateExpression(expr.property, scope);

			if (key.type != DataType.NUMBER && key.type != DataType.STRING) {
				throw `Invalid member-key type ${key.type}`;
			}

			if (obj.type === DataType.OBJECT) {
				return {
					get: () => obj.value[key.value] ?? Var.Null(),
					set: (value) => {
						obj.value[key.value] = value;
					},
				};
			}

			if (obj.type === DataType.ARRAY && key.type === DataType.NUMBER) {
				return {
					get: () => obj.value[key.value] ?? Var.Null(),
					set: (value) => {
						obj.value[key.value] = value;
					},
				};
			}
		}

		throw new Error("Invalid assignment target");
	}

	static evaluateExpression(
		expression: Expression,
		scope: DataScope
	): DataValue {
		for (const plugin of scope.environment.system.plugins) {
			if (plugin.primary_literal == undefined) continue;

			const test =
				plugin.primary_literal.test != undefined
					? plugin.primary_literal.test(expression)
					: expression.type == ExpressionType.CUSTOM &&
					  expression.id == plugin.id;

			if (test) {
				return plugin.primary_literal.handle(expression, scope);
			}
		}

		switch (expression.type) {
			case ExpressionType.NUMBER:
				return Var.Number(expression.value);
			case ExpressionType.STRING:
				return Var.String(expression.value);
			case ExpressionType.BOOLEAN:
				return Var.Boolean(expression.value);
			case ExpressionType.IDENTIFIER:
				return scope.get(expression.name) ?? Var.Null();

			case ExpressionType.UNARY: {
				const right = PlagueLanguage.evaluateExpression(
					expression.right,
					scope
				);
				return PlagueLanguage.evalUnary(expression.op, right);
			}

			case ExpressionType.BINARY: {
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
					try {
						return TypeCasts.cast(left, expression.right.name);
					} catch (e) {
						throw new Error(
							`Cannot cast data to type (${left.type}) -> (${expression.right.type})`
						);
					}
				}

				const method_applied = MethodOps.apply(
					left,
					expression.op,
					right
				);
				if (method_applied) {
					return method_applied;
				} else {
					throw new Error(`Invalid operator ${expression.op}`);
				}
			}

			case ExpressionType.CALL: {
				const fn = PlagueLanguage.evaluateExpression(
					expression.callee,
					scope
				) as FunctionDataValue;

				let args = expression.args.map((arg) =>
					PlagueLanguage.evaluateExpression(arg, scope)
				);

				if (expression.callee.type == ExpressionType.MEMBER_ACCESS) {
					const obj = this.evaluateExpression(
						expression.callee.object,
						scope
					);
					const key = this.evaluateExpression(
						expression.callee.property,
						scope
					);
					if (
						obj.type != DataType.OBJECT ||
						(key.type != DataType.NUMBER &&
							key.type != DataType.STRING)
					) {
						throw `Invalid member-key xx type ${key.type}`;
					}
					args.unshift(obj.value[key.value]);
				}
				const got =
					fn?.type == DataType.FUNCTION
						? fn.call(args) ?? Var.Null()
						: Var.Null();
				return got as DataValue;
			}

			case ExpressionType.MEMBER_ACCESS: {
				const object = this.evaluateExpression(
					expression.object,
					scope
				);
				const key = this.evaluateExpression(expression.property, scope);

				if (
					object.type == DataType.ARRAY &&
					key.type == DataType.NUMBER
				) {
					return object.value?.[key.value] ?? Var.Null();
				} else if (
					object.type == DataType.OBJECT &&
					(key.type == DataType.STRING || key.type == DataType.NUMBER)
				) {
					return object.value?.[key.value] ?? Var.Null();
				} else {
					return Var.Null();
				}
				break;
			}

			case ExpressionType.ASSIGN: {
				const value = this.evaluateExpression(expression.value, scope);
				const ref = this.resolveTarget(expression.target, scope);
				ref.set(value);
				return value;
			}
		}

		throw new Error(`Invalid expression ${expression.type}`);
	}
}
