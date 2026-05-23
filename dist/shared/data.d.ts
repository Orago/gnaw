import type { LanguageDictionary } from "../parser/lexer.js";
import type { Plugin, Plugin__Expression, Plugin__Impl, Plugin__Statement } from "../plugin/plugin-utility.js";
import type { Expression, Statement, VariableOptions } from "./interfaces.js";
import type { DataValue } from "./variables.js";
export declare class System {
    keywords?: LanguageDictionary;
    impl_list: Set<Plugin__Impl>;
    expression_handlers: Set<Plugin__Expression<Expression>>;
    statement_handlers: Set<Plugin__Statement<Statement>>;
    default_values: Map<string, [DataValue, VariableOptions?]>;
    clearUtilities(): void;
    loadValues(scope: DataScope): void;
    loadPlugins(plugins: Plugin[]): this;
}
export declare class DataScope {
    environment: Environment;
    parent?: DataScope | undefined;
    static getVariable(scope: DataScope, name: string): DataValue | undefined;
    variables: Partial<Record<string, DataValue>>;
    variable_modes: Partial<Record<string, VariableOptions>>;
    constructor(environment: Environment, parent?: DataScope | undefined);
    extend(): DataScope;
    get(name: string): DataValue | undefined;
    set(name: string, value: DataValue, options?: VariableOptions): void;
    updateVariableOptions(name: string, options?: VariableOptions): void;
    delete(name: string): void;
}
interface EnvironmentOptions {
    max_call_stack: number;
    max_loop_stack: number;
}
interface EnvironmentStates {
    call_depth: number;
}
export declare class Environment {
    system: System;
    root_scope: DataScope;
    options: EnvironmentOptions;
    states: EnvironmentStates;
    constructor(system: System);
    callDepth(): number;
    callDepth(move: number): this;
}
export {};
