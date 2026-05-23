import { TokenType } from "./tokens.js";
import { BinaryMethod, LogicPriority } from "../shared/enums.js";
import { Expression } from "../shared/interfaces.js";
import { ParserContext } from "./types.js";
export declare class MathExpressionParser {
    static PRIORITY: Partial<Record<BinaryMethod, LogicPriority>>;
    static binary_method_dict: Partial<Record<TokenType, BinaryMethod>>;
    static handleInfix(ctx: ParserContext, left: Expression, p: number): Expression;
}
export declare class ExpressionParser {
    static parse(ctx: ParserContext, p?: number): Expression;
    static parseBinary(ctx: ParserContext, p?: number): Expression;
    static parseParameterValues(ctx: ParserContext, left?: TokenType, right?: TokenType): Expression[];
    static parsePrimary(ctx: ParserContext): Expression;
}
