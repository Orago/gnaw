import { TokenType } from "./tokens.js";
import { FunctionParameter } from "../shared/interfaces.js";
import { ParserContext } from "./types.js";
export declare class ParserQuick {
    static parseBlock<T>(ctx: ParserContext, collect: () => T, left?: TokenType, right?: TokenType): T[];
    static parseStatementBlock(ctx: ParserContext): import("../shared/interfaces.js").Statement[];
    static parseParameters(ctx: ParserContext, left?: TokenType, right?: TokenType): FunctionParameter[];
}
