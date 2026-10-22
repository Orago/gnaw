import { A as DataScope, B as StatementType, C as DataType, D as FunctionDataValue, E as FunctionContext, F as LanguageDictionary, H as TokenType, I as default_language_dicitionary, L as BinaryMethod, M as System, N as Plugin, O as ObjectDataValue, P as ParserContext, R as ExpressionType, S as CustomDataValue, T as DataValueOf, V as AnyToken, _ as FunctionParameter, b as VariableOptions, f as core_plugins, g as ExpressionOf, h as Expression, j as Environment, k as Var, m as CustomStatement, p as CustomExpression, v as Statement, w as DataValue, x as interfaces_d_exports, y as StatementOf, z as LogicPriority } from "./core-plugins-CbHD1m5a.js";
export declare class Parser {
  static createContext(system: System, tokens: AnyToken[]): ParserContext;
  static parseString(system: System, script: string): Statement[];
  static parseTokens(system: System, tokens: AnyToken[]): Statement[];
}
export declare class ParserQuick {
  static parseBlock<T>(ctx: ParserContext, collect: () => T, left?: TokenType, right?: TokenType): T[];
  static parseStatementBlock(ctx: ParserContext): Statement[];
  static parseParameters(ctx: ParserContext, left?: TokenType, right?: TokenType): FunctionParameter[];
}
export declare class FunctionUtil {
  static functionReturn(value: DataValue | null): void;
  static expectReturn(cb: (...any: any[]) => void): any;
  static processFunction(statements: Statement[], scope: DataScope): any;
  static bindParameters(scope: DataScope, parameter_info: FunctionParameter[], args: DataValue[], this_value?: DataValue): void;
  static createFunction(parameters: FunctionParameter[], body: Statement[], scope: DataScope): FunctionDataValue;
  static createContext(args: DataValue[], this_value?: DataValue): FunctionContext;
  static callFunction(fn: FunctionDataValue, scope: DataScope, args: DataValue[], this_value?: DataValue): DataValue | undefined | void;
}
export declare class Language {
  static run(environment: Environment, program: Statement[]): any;
  private static runNest;
  static execManyStatements(statements: Statement[], scope: DataScope): void;
  static execStatement(statement: Statement, scope: DataScope): void;
  static evalUnary(op: BinaryMethod, value: DataValue): DataValue;
  static resolveTarget(expr: Expression, scope: DataScope): {
    get(): DataValue;
    set(value: DataValue): void;
  };
  static evaluateExpression(expression: Expression, scope: DataScope): DataValue;
}
export { BinaryMethod, type CustomDataValue, CustomExpression, CustomStatement, DataScope, DataType, type DataValue, type DataValueOf, Environment, Expression, ExpressionOf, ExpressionType, type FunctionContext, type FunctionDataValue, FunctionParameter, interfaces_d_exports as Interface, type LanguageDictionary, LogicPriority, type ObjectDataValue, Plugin, Statement, StatementOf, StatementType, System, Var, VariableOptions, core_plugins, default_language_dicitionary };