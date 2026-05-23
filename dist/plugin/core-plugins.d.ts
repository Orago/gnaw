import { type ParserContext } from "../parser/index.js";
import type { Expression, VariableOptions } from "../shared/interfaces.js";
import { Plugin } from "./plugin-utility.js";
export declare class VariablePlugin extends Plugin {
    id: string;
    constructor();
}
export declare class FunctionPlugin extends Plugin<{}> {
    id: string;
    constructor();
}
export declare class ReturnPlugin extends Plugin {
    id: string;
    constructor();
}
export declare class IfPlugin extends Plugin {
    id: string;
    constructor();
}
export type TableEntry = {
    key: string;
    value: Expression;
} | {
    value: Expression;
};
export declare class TablesPlugin extends Plugin<{}> {
    readonly id = "table";
    constructor();
    static handleInlineMethod(ctx: ParserContext, entries: TableEntry[]): void;
}
export declare class ClassPlugin extends Plugin {
    readonly id = "class";
    constructor();
}
export declare class ArrayPlugin extends Plugin<{}> {
    readonly id = "vec";
    constructor();
}
export declare class ForLoopPlugin extends Plugin<{}> {
    readonly id = "for-loop";
    max_calls: number;
    private static for_loop_statement;
    constructor();
}
export declare class StringExtension extends Plugin<{}> {
    id: string;
    constructor();
}
export declare class CoreMethodsPlugin {
    static READONLY_VARIABLE: VariableOptions;
    static FN_PRINT: import("./plugin-utility.js").PlagueFNCallback;
    static FN_LEN: import("./plugin-utility.js").PlagueFNCallback;
    static list: Plugin["values"];
}
export declare const core_plugins: Plugin<any>[];
