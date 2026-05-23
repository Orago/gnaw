import type { IterableCheck } from "../parser/token-iterator.js";
import type { AnyToken } from "../parser/tokens.js";
import type { Expression, Statement, VariableOptions } from "../shared/interfaces.js";
import type { ParserContext } from "../parser/types.js";
import type { DataValue } from "../shared/variables.js";
import type { DataScope } from "../shared/data.js";
export type PlagueFNCallback = () => [string, DataValue, VariableOptions?];
export interface PluginImplCtx<D extends DataValue = DataValue> {
    name: string;
    data: D;
    args: DataValue[];
    scope: DataScope;
}
export interface Plugin__Impl {
    name: string;
    case: (ctx: PluginImplCtx) => boolean;
    handle: (ctx: PluginImplCtx) => DataValue | undefined;
}
export interface Plugin__Expression<E extends Expression> {
    case: (t: AnyToken) => boolean;
    create: (ctx: ParserContext) => E;
    test?: (expression: Expression) => boolean;
    handle: (expression: E, scope: DataScope) => DataValue;
}
export interface Plugin__Statement<S extends Statement> {
    trim_case?: boolean;
    case: IterableCheck<AnyToken>;
    createStatement: (ctx: ParserContext) => S;
    test?: (statement: Statement) => boolean;
    handleStatement: (statement: S, scope: DataScope) => any;
}
export declare abstract class Plugin<Opts extends {
    statement?: Plugin__Statement<Statement>[];
    expression?: Plugin__Expression<Expression>[];
} = {}> {
    static bindValues(scope: DataScope, plugin: Plugin): void;
    static wrapFunction(name: string, data: DataValue, options?: VariableOptions): PlagueFNCallback;
    static ownsStatement(statement_id: string): (statement: Statement) => boolean;
    static implHandler<T extends Plugin__Impl>(options: T): T;
    static expressionHandler<T extends Expression>(options: Plugin__Expression<T>): Plugin__Expression<T>;
    static statementHandler<S extends Statement>(options: Plugin__Statement<S>): Plugin__Statement<S>;
    abstract id: string;
    StatementType: Opts["statement"];
    impl?: Plugin__Impl[];
    expressions?: Opts["expression"] | Plugin__Expression<Expression>;
    getExpressions(): Plugin__Expression<Expression>[] | undefined;
    statements?: Opts["statement"];
    getStatements(): Plugin__Statement<Statement>[] | undefined;
    values?: () => Record<string, DataValue> | [string, DataValue, VariableOptions?][];
}
