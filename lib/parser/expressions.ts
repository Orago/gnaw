import { AnyToken, TokenGroup, TokenType } from "./tokens.js";
import { TypeCasts } from "../shared/casts.js";
import {
	BinaryMethod,
	ExpressionType,
	LogicPriority,
} from "../shared/enums.js";
import { Expression } from "../shared/interfaces.js";
import { Ast } from "./ast.js";
import { ParserContext } from "./types.js";

export class MathExpressionParser {
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
	};

	static handleInfix(
		ctx: ParserContext,
		left: Expression,
		p: number
	): Expression {
		const { iterator } = ctx;
		while (!iterator.isDone()) {
			const peek = iterator.peek();
			const op = MathExpressionParser.binary_method_dict[peek.type];
			if (op == null) break;
			const priority = MathExpressionParser.PRIORITY[op];
			if (priority == null) break;
			if (priority <= p) break;
			iterator.next();
			const right = ExpressionParser.parse(ctx, priority);
			left = Ast.Binary(left, op, right);
		}
		return left;
	}
}

export class ExpressionParser {
	/* parse expression object */
	static parse(
		ctx: ParserContext,
		p: number = LogicPriority.LOWEST
	): Expression {
		const { iterator } = ctx;
		const target = ExpressionParser.parseBinary(ctx, p);

		if (iterator.disposeIf(TokenType.EQUAL)) {
			// right association (cascade)
			const value = ExpressionParser.parse(ctx);

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

	static parseBinary(
		ctx: ParserContext,
		p: number = LogicPriority.LOWEST
	): Expression {
		const { iterator } = ctx;
		iterator.disposeIf(TokenType.COMMENT);

		let left: Expression = ExpressionParser.parsePrimary(ctx);
		left = MathExpressionParser.handleInfix(ctx, left, p);

		// impl
		while (iterator.disposeIf(TokenType.COLON)) {
			const name = iterator.expectResult(TokenType.IDENTIFIER).value;
			const args: Expression[] =
				ExpressionParser.parseParameterValues(ctx);
			left = Ast.Impl(left, name, args);
		}

		return left;
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
			args.push(ExpressionParser.parse(ctx));
			iterator.disposeIf(TokenType.COMMA);
		}

		iterator.expect(right);
		return args;
	}

	static parsePrimary(ctx: ParserContext): Expression {
		const { iterator } = ctx;
		const t = iterator.next();

		for (const handler of ctx.system.expression_handlers) {
			if (handler.case(t) != true) {
				continue;
			}
			return handler.create(ctx) as Expression;
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
					ExpressionParser.parse(ctx, LogicPriority.UNARY)
				);

			case TokenType.EXCLAMATION:
				return Ast.Unary(
					BinaryMethod.EXCLAMATION,
					ExpressionParser.parse(ctx, LogicPriority.UNARY)
				);

			case TokenType.IDENTIFIER: {
				let expression: Expression = Ast.Identifier(t.value);

				if (expression.name == "Type") {
					iterator.expect(TokenType.COLON);
					const type_name = iterator.expectResult(
						TokenType.IDENTIFIER
					).value;
					const type = TypeCasts.getCastType(type_name);
					return Ast.TypeRef(type);
				}

				while (true) {
					const next = iterator.peek();

					// invoking
					if (next.type === TokenType.PAREN_LEFT) {
						const args: Expression[] =
							ExpressionParser.parseParameterValues(ctx);
						expression = Ast.InvokeCall(expression, args);
						continue;
					}

					// member handling
					if (iterator.disposeIf(TokenType.DOT)) {
						const next = iterator.peek();

						let property: Expression;

						if (next.type === TokenType.BRACKET_LEFT) {
							iterator.next();
							property = ExpressionParser.parse(ctx);
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
				const expr = ExpressionParser.parse(ctx);
				iterator.expect(TokenType.PAREN_RIGHT);
				return expr;
			}
			// case TokenType.QUESTION_MARK:
			// 	return Ast.Placeholder();
		}

		console.log(
			">>>",
			iterator.remainingItems().slice(0, iterator.log_count),
			[t]
		);
		throw new Error(`^^^ Unexpected token in parser ${t.type}`);
	}
}
