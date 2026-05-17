import { AnyToken, TokenGroup, TokenType } from "../tokens.js";
import {
	BinaryMethod,
	Expression,
	ExpressionType,
	PlagueParserContext,
	Statement,
	StatementType,
} from "./interfaces.js";

export class PlagueParser {
	static parseStatement(ctx: PlagueParserContext): Statement {
		const { iterator } = ctx;
		const t = iterator.peek();

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

	static parseExpression(ctx: PlagueParserContext): Expression {
		// while ([TokenType.PLUS, TokenType.MINUS, TokenType.STAR, TokenType.SLASH])
		const { iterator } = ctx;

		const target = this.parseBinary(ctx);

		if (iterator.disposeIf("is", TokenType.EQUAL)) {
			// right association (cascade)
			const value = this.parseExpression(ctx);

			if (
				target.type !== ExpressionType.IDENTIFIER &&
				target.type !== ExpressionType.MEMBER_ACCESS
			) {
				throw new Error("Invalid assignment type");
			}

			return {
				type: ExpressionType.ASSIGN,
				target: target,
				value,
			};
		}

		return target;
	}

	private static parseBinary(ctx: PlagueParserContext): Expression {
		const { iterator } = ctx;
		let left: Expression = this.parsePrimary(ctx);

		const lup = (op: BinaryMethod) =>
			(left = {
				type: ExpressionType.BINARY,
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
			} else if (iterator.disposeIf("is", TokenType.CAST)) {
				lup(BinaryMethod.AS);
			} else {
				break;
			}
		}
		return left;
	}

	static parsePrimary(ctx: PlagueParserContext): Expression {
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
				let expression: Expression = {
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
					expression = {
						type: ExpressionType.CALL_EXPRESSION,
						callee: expression,
						args,
					};
				}

				if (iterator.disposeIf("is", TokenType.DOT)) {
					// const property = iterator.expect(
					// 	TokenType.IDENTIFIER
					// ) as AnyToken & { type: TokenType.IDENTIFIER };

					let property: Expression;

					const next = iterator.peek();

					if (next.type == TokenType.BRACKET_LEFT) {
						iterator.next();
						const property = this.parseExpression(ctx);
						iterator.expect(TokenType.BRACE_RIGHT);
						expression = {
							type: ExpressionType.MEMBER_ACCESS,
							object: expression,
							property,
						};

						return expression;
					} else if (
						next.type === TokenType.IDENTIFIER ||
						next.type == TokenType.STRING
					) {
						property = {
							type: ExpressionType.STRING,
							value: (
								iterator.next() as AnyToken & {
									type:
										| TokenType.IDENTIFIER
										| TokenType.STRING;
								}
							).value,
						};
					} else if (next.type === TokenType.NUMBER) {
						property = {
							type: ExpressionType.NUMBER,
							value: (
								iterator.next() as AnyToken & {
									type: TokenType.NUMBER;
								}
							).value,
						};
					} else {
						throw new Error(
							"Expected identifier or number after '.'"
						);
					}

					expression = {
						type: ExpressionType.MEMBER_ACCESS,
						object: expression,
						property,
					};
				}

				return expression;
			}

			case TokenType.PAREN_LEFT: {
				const expr = this.parseExpression(ctx);
				iterator.expect(TokenType.PAREN_RIGHT);
				return expr;
			}
		}

		throw new Error(`Unexpected token ${t.type}`);
	}

	static parseBlock<T>(
		ctx: PlagueParserContext,
		collect: () => T,
		left: TokenType = TokenType.BRACE_LEFT,
		right: TokenType = TokenType.BRACE_RIGHT
	): T[] {
		const { iterator } = ctx;
		// use block
		if (iterator.disposeIf("is", left)) {
			const collected = iterator.collectUntil(right, (it) => collect());

			iterator.expect(right);
			return collected;
		}
		// use custom
		else {
			throw new Error("Alternate block handling isn't supported yet");
		}
	}
}
