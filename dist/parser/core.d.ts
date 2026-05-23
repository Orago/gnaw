import { AnyToken } from "./tokens.js";
import { Statement } from "../shared/interfaces.js";
import { ParserContext } from "./types.js";
import { System } from "../shared/data.js";
export declare class Parser {
    static createContext(system: System, tokens: AnyToken[]): ParserContext;
    static parseString(system: System, script: string): Statement[];
    static parseTokens(system: System, tokens: AnyToken[]): Statement[];
}
