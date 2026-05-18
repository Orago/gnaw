import { Lexer } from "../lexer.js";
import TokenIterator from "../token-iterator.js";
import { AnyToken, TokenGroup, TokenType } from "../tokens.js";
import {
	Ast,
	BinaryMethod,
	Describe,
	Expression,
	ExpressionType,
	ParserContext,
	Statement,
	StatementType,
} from "./interfaces.js";
import { System } from "./states.js";

enum LogicPriority {
	LOWEST = 0,
	ASSIGN,
	OR,
	AND,
	EQUALITY,
	COMPARE,
	TERM,
	FACTOR,
	UNARY,
	CALL,
	MEMBER,
}

class ParserMath {
	static PRIORITY: Partial<Record<BinaryMethod, LogicPriority>> = {
		[BinaryMethod.ASSIGN]: LogicPriority.ASSIGN,
		[BinaryMethod.OR]: LogicPriority.OR,
		[BinaryMethod.AND]: LogicPriority.AND,
		[BinaryMethod.IS]: LogicPriority.EQUALITY,
		[BinaryMethod.NOT]: LogicPriority.EQUALITY,
		[BinaryMethod.LESS_THAN]: LogicPriority.COMPARE,
		[BinaryMethod.GREATER_THAN]: LogicPriority.COMPARE,
		[BinaryMethod.ADD]: LogicPriority.TERM,
		[BinaryMethod.SUBTRACT]: LogicPriority.TERM,
		[BinaryMethod.MULTIPLY]: LogicPriority.FACTOR,
		[BinaryMethod.DIVIDE]: LogicPriority.FACTOR,
		[BinaryMethod.DOT]: LogicPriority.MEMBER,
	};
	static binary_method_dict: Partial<Record<TokenType, BinaryMethod>> = {
		[TokenType.PLUS]: BinaryMethod.ADD,
		[TokenType.MINUS]: BinaryMethod.SUBTRACT,
		[TokenType.STAR]: BinaryMethod.MULTIPLY,
		[TokenType.SLASH]: BinaryMethod.DIVIDE,
		[TokenType.IS]: BinaryMethod.IS,
		[TokenType.NOT]: BinaryMethod.NOT,
		[TokenType.GREATER_THAN]: BinaryMethod.GREATER_THAN,
		[TokenType.LESS_THAN]: BinaryMethod.LESS_THAN,
		[TokenType.CAST]: BinaryMethod.AS,
	};

	static handleInfix(
		ctx: ParserContext,
		left: Expression,
		p: number
	): Expression {
		const { iterator } = ctx;
		while (!iterator.isDone()) {
			const peek = iterator.peek();
			const op = ParserMath.binary_method_dict[peek.type];
			if (op == null) break;
			const priority = ParserMath.PRIORITY[op];
			if (priority == null) break;
			if (priority <= p) break;
			iterator.next();
			const right = Parser.parseExpression(ctx, priority);
			left = Describe.Expression.Binary(left, op, right);
		}
		return left;
	}
}
export class Parser {
	static createContext(system: System, tokens: AnyToken[]): ParserContext {
		const iterator = new TokenIterator(tokens);

		return {
			iterator,
			system,
		};
	}
	static parseString(system: System, script: string) {
		const lexed = Lexer.lex(script);
		let tokens = Lexer.tokenize(lexed, {});

		tokens = Lexer.excluding(tokens, [
			TokenType.NEWLINE,
			TokenType.INDENT,
			TokenType.COMMENT,
		]);
		return this.parseTokens(system, tokens);
	}

	static parseTokens(system: System, tokens: AnyToken[]): Statement[] {
		const statements: Statement[] = [];
		const ctx: ParserContext = this.createContext(system, tokens);

		while (ctx.iterator.peek().type != TokenType.EOF) {
			statements.push(Parser.parseStatement(ctx));
		}

		return statements;
	}
	static parseStatement(ctx: ParserContext): Statement {
		const { iterator } = ctx;

		for (const plugin of ctx.system.plugins) {
			if (
				plugin.statement != undefined &&
				iterator.match(plugin.statement.case)
			) {
				return plugin.statement.createStatement(ctx) as Statement;
			}
		}

		return {
			type: StatementType.EXPRESSION,
			expression: this.parseExpression(ctx),
		};
	}

	static parseExpression(
		ctx: ParserContext,
		p: number = LogicPriority.LOWEST
	): Expression {
		const { iterator } = ctx;
		const target = this.parseBinary(ctx, p);

		if (iterator.disposeIf("is", TokenType.EQUAL)) {
			// right association (cascade)
			const value = this.parseExpression(ctx);

			if (
				target.type !== ExpressionType.IDENTIFIER &&
				target.type !== ExpressionType.MEMBER_ACCESS
			) {
				throw new Error("Invalid assignment type");
			}
			return Ast.Assign(target, value);
		}

		return target;
	}

	private static parseBinary(
		ctx: ParserContext,
		p: number = LogicPriority.LOWEST
	): Expression {
		let left: Expression = this.parsePrimary(ctx);
		left = ParserMath.handleInfix(ctx, left, p);
		const { iterator } = ctx;

		// imp
		if (iterator.disposeIf("is", TokenType.COLON)) {
			const name = iterator.expectResult(TokenType.IDENTIFIER).value;
			const args: Expression[] = Parser.parseParameterValues(ctx);
			left = Ast.Imp(left, name, args);
		}

		return left;
	}

	private static parsePrimary(ctx: ParserContext): Expression {
		const { iterator } = ctx;
		const t = iterator.next();

		for (const plugin of ctx.system.plugins) {
			if (
				plugin.primary_literal == undefined ||
				plugin.primary_literal.case(t) != true
			) {
				continue;
			}

			return plugin.primary_literal.create(ctx) as Expression;
		}

		switch (t.type) {
			case TokenType.NUMBER: {
				if (t.group == TokenGroup.BOOLEAN) {
					return Ast.Boolean(!!t.value);
				} else {
					return Ast.Number(t.value);
				}
			}
			case TokenType.STRING:
				return Ast.String(t.value);

			case TokenType.MINUS:
				return Ast.Unary(
					BinaryMethod.SUBTRACT,
					Parser.parseExpression(ctx, LogicPriority.UNARY)
				);

			case TokenType.EXCLAMATION:
				return Ast.Unary(
					BinaryMethod.EXCLAMATION,
					Parser.parseExpression(ctx, LogicPriority.UNARY)
				);

			case TokenType.IDENTIFIER: {
				let expression: Expression = Ast.Identifier(t.value);

				while (true) {
					const next = iterator.peek();

					// invoking
					if (next.type === TokenType.PAREN_LEFT) {
						const args: Expression[] =
							Parser.parseParameterValues(ctx);
						expression = Ast.InvokeCall(expression, args);
						continue;
					}

					// member handling
					if (iterator.disposeIf("is", TokenType.DOT)) {
						const next = iterator.peek();

						let property: Expression;

						if (next.type === TokenType.BRACKET_LEFT) {
							iterator.next();
							property = this.parseExpression(ctx);
							iterator.expect(TokenType.BRACKET_RIGHT);
						} else if (
							next.type === TokenType.IDENTIFIER ||
							next.type === TokenType.STRING
						) {
							const t = iterator.next() as Extract<
								AnyToken,
								{
									type:
										| TokenType.IDENTIFIER
										| TokenType.STRING;
								}
							>;
							property = Ast.String(t.value);
						} else if (next.type === TokenType.NUMBER) {
							const t = iterator.next() as Extract<
								AnyToken,
								{ type: TokenType.NUMBER }
							>;
							property = Ast.Number(t.value);
						} else {
							throw new Error("Expected property after '.'");
						}

						expression = Ast.Member(expression, property);
						continue;
					}

					break;
				}

				return expression;
			}

			case TokenType.PAREN_LEFT: {
				const expr = this.parseExpression(ctx);
				iterator.expect(TokenType.PAREN_RIGHT);
				return expr;
			}
		}
		console.log(
			">>>",
			iterator.remainingItems().slice(0, iterator.log_count),
			[t]
		);
		throw new Error(`^^^ Unexpected token in parser ${t.type}`);
	}

	static parseBlock<T>(
		ctx: ParserContext,
		collect: () => T,
		left: TokenType = TokenType.BRACE_LEFT,
		right: TokenType = TokenType.BRACE_RIGHT
	): T[] {
		const { iterator } = ctx;
		iterator.expect(left);
		const items: T[] = [];
		while (!iterator.isDone() && iterator.peek().type !== right) {
			items.push(collect());
		}
		iterator.expect(right);
		return items;
	}

	static parseStatementBlock(ctx: ParserContext) {
		return Parser.parseBlock(ctx, () => {
			return Parser.parseStatement(ctx);
		});
	}

	static parseParameterNames(
		ctx: ParserContext,
		left: TokenType = TokenType.PAREN_LEFT,
		right: TokenType = TokenType.PAREN_RIGHT
	): string[] {
		const { iterator } = ctx;
		iterator.expect(left);
		const params: string[] = [];

		while (iterator.peek().type !== right) {
			params.push(iterator.expectResult(TokenType.IDENTIFIER).value);
			iterator.disposeIf("is", TokenType.COMMA);
		}

		iterator.expect(right);

		return params;
	}

	static parseParameterValues(
		ctx: ParserContext,
		left: TokenType = TokenType.PAREN_LEFT,
		right: TokenType = TokenType.PAREN_RIGHT
	): Expression[] {
		const { iterator } = ctx;

		iterator.expect(left);

		const args: Expression[] = [];
		while (iterator.peek().type !== right) {
			args.push(this.parseExpression(ctx));
			iterator.disposeIf("is", TokenType.COMMA);
		}

		iterator.expect(right);
		return args;
	}
}
