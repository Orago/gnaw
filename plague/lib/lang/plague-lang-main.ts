import { Lexer } from "../lexer.js";
import TokenIterator, { IterableCheck } from "../token-iterator.js";
import { AnyToken, TokenGroup, TokenType } from "../tokens.js";
import {
	BinaryMethod,
	CustomStatement,
	Expression,
	ExpressionType,
	Statement,
	StatementType,
} from "./interfaces.js";

class Environment {
	plugins: PlaguePlugin[];

	constructor() {}
}

export class PlagueScope {
	static getVariable(scope: PlagueScope, name: string): any {
		if (scope.variables[name] != undefined) {
			return scope.variables[name];
		} else if (scope.parent != undefined) {
			return PlagueScope.getVariable(scope.parent, name);
		}

		return undefined;
	}

	static getFunction(scope: PlagueScope, name: string): any {
		if (scope.functions[name] != undefined) {
			return scope.functions[name];
		} else if (scope.parent != undefined) {
			return PlagueScope.getFunction(scope.parent, name);
		}

		return undefined;
	}

	variables: Partial<Record<string, any>> = {};
	functions: Partial<Record<string, any>> = {};

	constructor(public environment: Environment, public parent?: PlagueScope) {}

	extend() {
		return new PlagueScope(this.environment, this.parent);
	}

	get(name: string) {
		return PlagueScope.getVariable(this, name);
	}

	set(name: string, value: any) {
		this.variables[name] = value;
	}
}

interface PlagueEvalContext {
	iterator: TokenIterator;
	plugins: PlaguePlugin[];
}

abstract class PlaguePlugin {
	static ownsStatement(plugin: PlaguePlugin, statement: Statement): boolean {
		return (
			statement.type == StatementType.CUSTOM_PLUGIN &&
			statement.id == plugin.id
		);
	}
	abstract case: IterableCheck<AnyToken>;
	abstract id: string;

	abstract handleStatement(statement: Statement, scope: PlagueScope): any;

	abstract createStatement(ctx: PlagueEvalContext): Statement;
	protected formatStatement<T extends any>(data: T): CustomStatement<T> {
		return {
			type: StatementType.CUSTOM_PLUGIN,
			id: this.id,
			data,
		};
	}
}

class VariablePlugin extends PlaguePlugin {
	declare StatementFormat: {
		type: StatementType.VARIABLE;
		name: string;
		value: Expression;
	};
	id = "variable";
	case: IterableCheck = (t) =>
		t.type == TokenType.IDENTIFIER && t.value == "let";
	handleStatement(statement: this["StatementFormat"], scope: PlagueScope) {
		const value = PlagueLanguage.evaluateExpression(statement.value, scope);
		scope.set(statement.name, value);
	}
	createStatement(ctx: PlagueEvalContext): VariablePlugin["StatementFormat"] {
		const { iterator } = ctx;
		iterator.expect(this.case);
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

class FunctionPlugin extends PlaguePlugin {
	declare StatementFormat: {
		type: StatementType.FUNCTION;
		name: string;
		params: string[];
		body: Statement[];
	};
	id = "function";
	case: IterableCheck = (t) =>
		t.type == TokenType.IDENTIFIER && t.value == "fn";

	handleStatement(statement: this["StatementFormat"], scope: PlagueScope) {
		const fn = PlagueLanguage.createFunction(
			statement.params,
			statement.body,
			scope
		);
		scope.set(statement.name, fn);
	}
	createStatement(ctx: PlagueEvalContext): this["StatementFormat"] {
		const { iterator } = ctx;
		iterator.expect(this.case);
		const name = iterator.expectResult(TokenType.IDENTIFIER).value;

		iterator.expect(TokenType.PAREN_LEFT);

		const params = iterator.collectUntil(TokenType.PAREN_RIGHT, (it) => {
			const v = it.expectResult(TokenType.IDENTIFIER).value;
			it.disposeIf("is", TokenType.COMMA);
			return v;
		});

		iterator.expect(TokenType.BRACE_LEFT);

		const body = iterator.collectUntil(TokenType.BRACE_RIGHT, () => {
			return PlagueParser.parseStatement(ctx);
		});

		return {
			type: StatementType.FUNCTION,
			name: name,
			params,
			body,
		};
	}

	captureBlock<T>(ctx: PlagueEvalContext, collect: () => T): T[] {
		const { iterator } = ctx;
		// use block

		if (iterator.disposeIf("is", TokenType.PAREN_LEFT)) {
			return iterator.collectUntil(TokenType.PAREN_RIGHT, (it) => {
				return collect();
			});
		} else {
			throw new Error("Alternate block handling isn't supported yet");
		}
	}
}

class ReturnPlugin extends PlaguePlugin {
	id = "return";
	case: IterableCheck = (t) =>
		t.type == TokenType.IDENTIFIER && t.value == "return";

	handleStatement(
		statement: VariablePlugin["StatementFormat"],
		scope: PlagueScope
	): void {
		const value = statement.value
			? PlagueLanguage.evaluateExpression(statement.value, scope)
			: null;
		throw { type: "return", value };
	}

	createStatement(ctx: PlagueEvalContext): Statement {
		const { iterator } = ctx;
		iterator.expect(this.case);

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

class IfPlugin extends PlaguePlugin {
	id = "if";
	case: IterableCheck = (t) =>
		t.type == TokenType.IDENTIFIER && t.value == "if";

	handleStatement(
		statement: VariablePlugin["StatementFormat"],
		scope: PlagueScope
	): void {
		const value = statement.value
			? PlagueLanguage.evaluateExpression(statement.value, scope)
			: null;
		throw { type: "return", value };
	}

	createStatement(ctx: PlagueEvalContext): Statement {
		const { iterator } = ctx;
		iterator.expect(this.case);

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

class PlagueParser {
	static parseStatement(ctx: PlagueEvalContext): Statement {
		const { iterator } = ctx;
		const t = iterator.peek();

		for (const plugin of ctx.plugins) {
			if (iterator.match(plugin.case)) {
				return plugin.createStatement(ctx);
			}
		}

		return {
			type: StatementType.EXPRESSION,
			expression: this.parseExpression(ctx),
		};
	}

	static parseExpression(ctx: PlagueEvalContext): Expression {
		const { iterator } = ctx;
		let left: Expression = this.parsePrimary(ctx);

		const lup = (op: BinaryMethod) =>
			(left = {
				type: ExpressionType.Binary,
				left,
				op,
				right: this.parsePrimary(ctx),
			});

		while (true) {
			if (iterator.disposeIf("is", TokenType.PLUS)) {
				lup(BinaryMethod.ADD);
			} else if (iterator.disposeIf("is", TokenType.MINUS)) {
				lup(BinaryMethod.SUBTRACT);
			} else if (iterator.disposeIf("is", TokenType.STAR)) {
				lup(BinaryMethod.MULTIPLY);
			} else if (iterator.disposeIf("is", TokenType.SLASH)) {
				lup(BinaryMethod.DIVIDE);
			} else if (iterator.disposeIf("is", TokenType.IS)) {
				lup(BinaryMethod.IS);
			} else if (iterator.disposeIf("is", TokenType.NOT)) {
				lup(BinaryMethod.NOT);
			} else if (iterator.disposeIf("is", TokenType.GREATER_THAN)) {
				lup(BinaryMethod.GREATER_THAN);
			} else if (iterator.disposeIf("is", TokenType.LESS_THAN)) {
				lup(BinaryMethod.LESS_THAN);
			} else {
				break;
			}
		}
		return left;

		// while ([TokenType.PLUS, TokenType.MINUS, TokenType.STAR, TokenType.SLASH])
	}

	static parsePrimary(ctx: PlagueEvalContext): Expression {
		const { iterator } = ctx;
		const t = iterator.next();

		switch (t.type) {
			case TokenType.NUMBER: {
				if (t.group == TokenGroup.BOOLEAN) {
					return { type: ExpressionType.BOOLEAN, value: !!t.value };
				}

				return {
					type: ExpressionType.NUMBER,
					value: t.value,
				};
			}
			case TokenType.STRING:
				return {
					type: ExpressionType.STRING,
					value: t.value,
				};

			case TokenType.IDENTIFIER: {
				let expr: Expression = {
					type: ExpressionType.IDENTIFIER,
					name: t.value,
				};

				if (iterator.peek().type == TokenType.PAREN_LEFT) {
					iterator.next();
					const args: Expression[] = [];

					while (iterator.peek().type !== TokenType.PAREN_RIGHT) {
						args.push(this.parseExpression(ctx));
						iterator.disposeIf("is", TokenType.COMMA);
					}

					iterator.expect(TokenType.PAREN_RIGHT);
					expr = {
						type: ExpressionType.CallExpression,
						callee: expr,
						args,
					};
				}

				if (iterator.disposeIf("is", TokenType.DOT)) {
					const property = iterator.expect(
						TokenType.IDENTIFIER
					) as AnyToken & { type: TokenType.IDENTIFIER };

					expr = {
						type: ExpressionType.MemberAccess,
						object: expr,
						property: property.value,
					};
				}

				return expr;
			}

			case TokenType.PAREN_LEFT: {
				const expr = this.parseExpression(ctx);
				iterator.expect(TokenType.PAREN_RIGHT);
				return expr;
			}
		}

		throw new Error(`Unexpected token ${t.type}`);
	}
}

type PlagueValue =
	| number
	| string
	| boolean
	| FunctionValue
	| Record<string, any>;
type FunctionValue = {
	call(args: PlagueValue[]): PlagueValue;
};

export class PlagueLanguage {
	static createFunction(
		params: string[],
		body: Statement[],
		closure: PlagueScope
	): FunctionValue {
		return {
			call(args: PlagueValue[]) {
				const local = closure.extend();

				params.forEach((p, i) => {
					local.set(p, args[i]);
				});

				try {
					for (const stmt of body) {
						execStmt(stmt, local);
					}
				} catch (ret: any) {
					if (ret.type === "return") return ret.value;
					throw ret;
				}

				return null;
			},
		};
	}
	constructor() {}

	private createContext(tokens: AnyToken[]): PlagueEvalContext {
		const iterator = new TokenIterator(tokens);

		return {
			iterator,
			plugins: [
				new VariablePlugin(),
				new FunctionPlugin(),
				new ReturnPlugin(),
			],
		};
	}

	parseString(script: string) {
		const lexed = Lexer.lex(script);
		const tokens = Lexer.tokenize(lexed, {});

		return this.parse(tokens);
	}

	parse(tokens: AnyToken[]): Statement[] {
		const statements: Statement[] = [];
		const ctx: PlagueEvalContext = this.createContext(tokens);

		while (ctx.iterator.peek().type != TokenType.EOF) {
			statements.push(PlagueParser.parseStatement(ctx));
		}

		return statements;
	}

	eval(script: string) {
		const lexed = Lexer.lex(script);
		const tokens = Lexer.tokenize(lexed, {});
		const iterator: TokenIterator = new TokenIterator(tokens);
	}

	static execStatement(statement: Statement, scope: PlagueScope): void {
		if (statement.type == StatementType.CUSTOM_PLUGIN) {
			for (const plugin of scope.environment.plugins) {
				if (statement.id == plugin.id) {
					plugin.handleStatement(statement);
					return;
				}
			}
		}

		switch (statement.type) {
			case "LetStmt": {
				const value = evalExpr(statement.value, scope);
				scope.set(statement.name, value);
				return;
			}

			case "ExprStmt": {
				evalExpr(statement.expr, scope);
				return;
			}

			case "FnStmt": {
				const fn = createFunction(
					statement.params,
					statement.body,
					scope
				);
				scope.set(statement.name, fn);
				return;
			}

			case "IfStmt": {
				const cond = evalExpr(statement.cond, scope);

				if (cond) {
					statement.then.forEach((s) => execStmt(s, scope));
				} else if (statement.else) {
					statement.else.forEach((s) => execStmt(s, scope));
				}
				return;
			}

			case "ForStmt": {
				const start = evalExpr(statement.start, scope) as number;
				const end = evalExpr(statement.end, scope) as number;

				for (let i = start; i <= end; i++) {
					scope.set(statement.name, i);
					statement.body.forEach((s) => execStmt(s, scope));
				}
				return;
			}

			case "ReturnStmt": {
				const value = statement.value
					? evalExpr(statement.value, scope)
					: null;
				throw { type: "return", value };
			}
		}
	}

	static evaluateExpression(expression: Expression, scope: PlagueScope): any {
		switch (expression.type) {
			case ExpressionType.NUMBER:
				return expression.value;
			case ExpressionType.STRING:
				return expression.value;
			case ExpressionType.BOOLEAN:
				return expression.value;
			case ExpressionType.IDENTIFIER:
				return scope.get(expression.name);
			case ExpressionType.Binary: {
				const left = PlagueLanguage.evaluateExpression(
					expression.left,
					scope
				);
				const right = PlagueLanguage.evaluateExpression(
					expression.right,
					scope
				);
				switch (expression.op) {
					case BinaryMethod.ADD:
						return left + right;
					case BinaryMethod.SUBTRACT:
						return (left as any) - right;
					case BinaryMethod.MULTIPLY:
						return (left as any) * right;
					case BinaryMethod.DIVIDE:
						return (left as any) / right;
					case BinaryMethod.IS:
						return left === right;
					case BinaryMethod.NOT:
						return left !== right;
					case BinaryMethod.LESS_THAN:
						return (left as any) < right;
					case BinaryMethod.GREATER_THAN:
						return (left as any) > right;
				}

				throw new Error(`Invalid operator ${expression.op}`);
			}

			case ExpressionType.CallExpression: {
				const fn = PlagueLanguage.evaluateExpression(
					expression.callee,
					scope
				) as FunctionValue;
				const args = expression.args.map((arg) =>
					PlagueLanguage.evaluateExpression(arg, scope)
				);
				return fn.call(args);
			}
		}
	}
}
