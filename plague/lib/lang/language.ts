import { Lexer } from "../lexer.js";
import TokenIterator from "../token-iterator.js";
import { AnyToken, TokenType } from "../tokens.js";
import {
	FunctionPlugin,
	ReturnPlugin,
	VariablePlugin,
} from "./core-plugins.js";
import {
	BinaryMethod,
	Expression,
	ExpressionType,
	PlagueParserContext,
	Statement,
	StatementType,
} from "./interfaces.js";
import { PlagueParser } from "./parser.js";
import {
	type PlagueEnvironment,
	type PlagueScope,
	type PlagueSystem,
} from "./states.js";
import { DataTypes as DataType, FunctionDataValue } from "./variables.js";
import type { DataValue } from "./variables.js";

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
				for (const [k, v] of Object.entries(plugin.values())) {
					scope.set(k, v);
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
		console.log("STATEMENT", statement);

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
				if (
					left.type == DataType.NUMBER &&
					right.type == DataType.NUMBER
				) {
					switch (expression.op) {
						case BinaryMethod.ADD:
							return {
								type: DataType.NUMBER,
								value: left.value + right.value,
							};
						case BinaryMethod.SUBTRACT:
							return {
								type: DataType.NUMBER,
								value: left.value - right.value,
							};
						case BinaryMethod.MULTIPLY:
							return {
								type: DataType.NUMBER,
								value: left.value * right.value,
							};

						case BinaryMethod.DIVIDE:
							return {
								type: DataType.NUMBER,
								value: left.value / right.value,
							};
						case BinaryMethod.IS:
							return {
								type: DataType.BOOLEAN,
								value: left.value === right.value,
							};
						case BinaryMethod.NOT:
							return {
								type: DataType.BOOLEAN,
								value: left.value !== right.value,
							};
						case BinaryMethod.LESS_THAN:
							return {
								type: DataType.BOOLEAN,
								value: left.value < right.value,
							};

						case BinaryMethod.GREATER_THAN:
							return {
								type: DataType.BOOLEAN,
								value: left.value > right.value,
							};
					}
				} else if (
					(left.type == DataType.STRING ||
						left.type == DataType.NUMBER) &&
					(right.type == DataType.STRING ||
						right.type == DataType.NUMBER)
				) {
					const left_string = String(left.value);
					const right_string = String(right.value);
					switch (expression.op) {
						case BinaryMethod.ADD:
							return {
								type: DataType.STRING,
								value: left_string.concat(right_string),
							};
						case BinaryMethod.SUBTRACT:
							return {
								type: DataType.STRING,
								value: left_string.replace(right_string, ""),
							};

						case BinaryMethod.DIVIDE:
							return {
								type: DataType.STRING,
								value: left_string.replaceAll(right_string, ""),
							};
						case BinaryMethod.IS:
							return {
								type: DataType.BOOLEAN,
								value: left.value === right.value,
							};
						case BinaryMethod.NOT:
							return {
								type: DataType.BOOLEAN,
								value: left.value !== right.value,
							};
						case BinaryMethod.LESS_THAN:
							return {
								type: DataType.BOOLEAN,
								value: left.value < right.value,
							};

						case BinaryMethod.GREATER_THAN:
							return {
								type: DataType.BOOLEAN,
								value: left.value > right.value,
							};
					}
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
