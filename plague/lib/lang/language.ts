import { TypeCasts } from "./casts.js";
import { MethodOps } from "./core-utilities.js";
import {
	BinaryMethod,
	Expression,
	ExpressionType,
	FunctionParameter,
	Statement,
	StatementType,
} from "./interfaces.js";
import {
	Plugin,
	Plugin__Expression,
	Plugin__Statement,
	PluginImplCtx,
} from "./plugin-utility.js";
import { type DataScope, type Environment } from "./states.js";
import type { DataValue, FunctionContext } from "./variables.js";
import { DataType, FunctionDataValue, Var } from "./variables.js";

export class FunctionUtil {
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
		return FunctionUtil.expectReturn(() => {
			return Language.execManyStatements(statements, scope);
		});
	}

	/**
	 * ? Parameter binding must be handled inside of function data value
	 */
	static bindParameters(
		parameter_info: FunctionParameter[],
		ctx: FunctionContext
	) {
		parameter_info.forEach((p, i) => {
			let data = ctx.args[i] ?? Var.Null();
			if (p.type != undefined) {
				if (TypeCasts.isValidCast(p.type)) {
					data = TypeCasts.convertSafe(data, p.type);
				} else {
					throw new Error(
						`Invalid type to cast to (parameter: ${p.name}) -> (type: ${p.type})`
					);
				}

				if (p.expect == true && Var.is(data, p.type)) {
					throw new Error(
						`Expected (parameter: ${p.name}) of (type: ${p.type}), but got (type: ${data.type})`
					);
				}
			}

			ctx.set(p.name, data);
		});
	}

	static createFunction(
		parameters: FunctionParameter[],
		body: Statement[]
	): FunctionDataValue {
		return {
			type: DataType.FUNCTION,
			call(ctx) {
				FunctionUtil.bindParameters(parameters, ctx);
				return FunctionUtil.processFunction(body, ctx.scope_ref);
			},
		};
	}

	static createContext(
		scope: DataScope,
		args: DataValue[],
		this_value?: DataValue
	): FunctionContext {
		const context_scope = scope.extend();
		return {
			// primary states
			this: this_value,
			args,
			scope_ref: context_scope,
			// methods
			get: (k) => context_scope.get(k),
			set: (k, v) => context_scope.set(k, v),
			delete: (k) => context_scope.delete(k),
		};
	}

	static callFunction(
		fn: FunctionDataValue,
		scope: DataScope,
		args: DataValue[],
		this_value?: DataValue
	): DataValue | undefined | void {
		const env = scope.environment;
		const ctx = FunctionUtil.createContext(
			scope.extend(),
			args,
			this_value
		);
		if (this_value != undefined) {
			ctx.scope_ref.set("this", this_value);
		}

		env.callDepth(1);

		try {
			return fn.call(ctx);
		} finally {
			env.callDepth(-1);
		}
	}
}

export class Language {
	constructor() {}

	static run(environment: Environment, program: Statement[]) {
		return FunctionUtil.expectReturn(() => {
			return Language.runNest(environment, program);
		});
	}

	private static runNest(environment: Environment, program: Statement[]) {
		const scope = environment.root_scope;

		for (const plugin of environment.system.plugins) {
			Plugin.bindValues(scope, plugin);
		}

		this.execManyStatements(program, scope);
	}

	/** wrapper */
	static execManyStatements(statements: Statement[], scope: DataScope) {
		for (const statement of statements) {
			Language.execStatement(statement, scope);
		}
	}

	static execStatement(statement: Statement, scope: DataScope): void {
		for (const plugin of scope.environment.system.plugins) {
			const handlers = plugin.getStatements();
			if (handlers == undefined) continue;

			for (const handler of handlers) {
				const test =
					handler.test != undefined
						? handler.test(statement)
						: statement.type == StatementType.CUSTOM &&
						  statement.id == plugin.id;

				if (test) {
					handler.handleStatement(statement, scope);
				}
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

	/** Unary handling (special operator symbol handlign that comes before data) */
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
			const handlers = plugin.getExpressions();
			if (handlers == undefined) continue;

			for (const handler of handlers) {
				const test =
					handler.test != undefined
						? handler.test(expression)
						: expression.type == ExpressionType.CUSTOM &&
						  expression.id == plugin.id;

				if (test) {
					return handler.handle(expression, scope);
				}
			}
		}

		switch (expression.type) {
			case ExpressionType.IMPL: {
				let name = expression.name;
				let value = Language.evaluateExpression(
					expression.callee,
					scope
				);
				let args = expression.args.map((arg) =>
					Language.evaluateExpression(arg, scope)
				);
				const ctx: PluginImplCtx = {
					name,
					data: value,
					args: args,
					scope,
				};

				for (const plugin of scope.environment.system.plugins) {
					if (plugin.impl == undefined) continue;

					for (const imp of plugin.impl) {
						if (imp.case(ctx) != true) continue;
						return imp.handle(ctx) ?? Var.Null();
					}
				}

				throw new Error(`^^^ Cannot imp for :${name}()`);
			}
			case ExpressionType.NUMBER:
				return Var.Number(expression.value);
			case ExpressionType.STRING:
				return Var.String(expression.value);
			case ExpressionType.BOOLEAN:
				return Var.Boolean(expression.value);
			case ExpressionType.IDENTIFIER:
				return scope.get(expression.name) ?? Var.Null();

			case ExpressionType.UNARY: {
				const right = Language.evaluateExpression(
					expression.right,
					scope
				);
				return Language.evalUnary(expression.op, right);
			}

			case ExpressionType.BINARY: {
				const left = Language.evaluateExpression(
					expression.left,
					scope
				);
				const right = Language.evaluateExpression(
					expression.right,
					scope
				);

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
				const fn = Language.evaluateExpression(
					expression.callee,
					scope
				) as FunctionDataValue;

				let args = expression.args.map((arg) =>
					Language.evaluateExpression(arg, scope)
				);
				let this_value: DataValue | undefined;

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

					this_value = obj.value[key.value];
				}

				if (fn.type == DataType.FUNCTION) {
					const data = FunctionUtil.callFunction(
						fn,
						scope,
						args,
						this_value
					);

					if (data) {
						return data;
					}
				}
				return Var.Null();
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
