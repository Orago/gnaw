declare enum TokenType {
  NUMBER = 0,
  STRING = 1,
  BOOLEAN = 2,
  IDENTIFIER = 3,
  KEYWORD = 4,
  PLUS = 5,
  MINUS = 6,
  STAR = 7,
  SLASH = 8,
  EQUAL = 9,
  LESS_THAN = 10,
  GREATER_THAN = 11,
  EXCLAMATION = 12,
  IS = 13,
  NOT = 14,
  AND = 15,
  OR = 16,
  CAST = 17,
  PAREN_LEFT = 18,
  PAREN_RIGHT = 19,
  BRACE_LEFT = 20,
  BRACE_RIGHT = 21,
  BRACKET_LEFT = 22,
  BRACKET_RIGHT = 23,
  COMMA = 24,
  DOT = 25,
  COLON = 26,
  SEMICOLON = 27,
  NEWLINE = 28,
  INDENT = 29,
  QUESTION_MARK = 30,
  EOF = 31,
  COMMENT = 32
}
type OperatorTokenTypes = TokenType.PLUS | TokenType.MINUS | TokenType.STAR | TokenType.SLASH | TokenType.EQUAL | TokenType.IS | TokenType.NOT | TokenType.EXCLAMATION | TokenType.CAST | TokenType.LESS_THAN | TokenType.GREATER_THAN;
type PunctuationTokenTypes = TokenType.COMMA | TokenType.DOT | TokenType.COLON | TokenType.SEMICOLON | TokenType.NEWLINE | TokenType.INDENT | TokenType.QUESTION_MARK;
type DelimiterTokenTypes = TokenType.PAREN_LEFT | TokenType.PAREN_RIGHT | TokenType.BRACE_LEFT | TokenType.BRACE_RIGHT | TokenType.BRACKET_LEFT | TokenType.BRACKET_RIGHT | TokenType.NEWLINE | TokenType.INDENT;
type AnyToken = {
  type: TokenType.COMMENT;
  raw: string;
  value: string;
} | {
  type: TokenType.STRING;
  raw: string;
  value: string;
} | {
  type: TokenType.NUMBER;
  raw: string;
  value: number;
} | {
  type: TokenType.BOOLEAN;
  raw: string;
  value: 0 | 1;
} | {
  type: TokenType.IDENTIFIER;
  raw: string;
  value: string;
} | {
  type: OperatorTokenTypes;
  raw: string;
  value: string;
} | {
  type: PunctuationTokenTypes;
  raw: string;
  value: string;
} | {
  type: DelimiterTokenTypes;
  raw: string;
  value: string;
  level?: number;
} | {
  type: TokenType.EOF;
};
declare enum BinaryMethod {
  ADD = 0,
  SUBTRACT = 1,
  MULTIPLY = 2,
  DIVIDE = 3,
  GREATER_THAN = 4,
  LESS_THAN = 5,
  IS = 6,
  NOT = 7,
  EXCLAMATION = 8,
  AND = 9,
  OR = 10,
  ASSIGN = 11,
  DOT = 12
}
declare enum StatementType {
  CUSTOM = 0,
  VARIABLE = 1,
  EXPRESSION = 2,
  FUNCTION = 3,
  RETURN = 4,
  IF = 5,
  FORLOOP = 6
}
declare enum ExpressionType {
  CUSTOM = 0,
  NUMBER = 1,
  STRING = 2,
  BOOLEAN = 3,
  IDENTIFIER = 4,
  CALL = 5,
  MEMBER_ACCESS = 6,
  BINARY = 7,
  UNARY = 8,
  FUNCTION = 9,
  ASSIGN = 10,
  IMPL = 11,
  TYPE_REF = 12
}
declare enum LogicPriority {
  LOWEST = 0,
  ASSIGN = 1,
  OR = 2,
  AND = 3,
  EQUALITY = 4,
  COMPARE = 5,
  TERM = 6,
  FACTOR = 7,
  UNARY = 8,
  CALL = 9,
  MEMBER = 10
}
interface LanguageDictionary extends Record<string, string[]> {
  brace_left: string[];
  brace_right: string[];
  bracket_left: string[];
  bracket_right: string[];
  parenthesis_left: string[];
  parenthesis_right: string[];
  plus: string[];
  minus: string[];
  star: string[];
  slash: string[];
  equals: string[];
  greater_than: string[];
  less_than: string[];
  exclamation: string[];
  hashtag: string[];
  is: string[];
  not: string[];
  cast: string[];
  comma: string[];
  dot: string[];
  colon: string[];
  semicolon: string[];
  newline: string[];
  indent: string[];
  question_mark: string[];
  boolean_true: string[];
  boolean_false: string[];
  operators: string[];
  delimiters: string[];
}
declare const default_language_dicitionary: LanguageDictionary;
interface IterableOptions {
  tracking?: boolean;
  max?: number;
}
type IterableCheck<T extends AnyToken = AnyToken> = TokenType | TokenType[] | ((value: T) => boolean) | RegExp;
declare class TokenIterator<T extends AnyToken = AnyToken> {
  settings: IterableOptions;
  items: (T | undefined)[];
  offset: number;
  log_count: number;
  constructor(items: T[], settings?: IterableOptions);
  remainingItems(): (T | undefined)[];
  [Symbol.iterator](): Generator<string | number, void, unknown>;
  consumer(): Generator<string | number, void, unknown>;
  isDone(offset?: number): boolean;
  advance(amount?: number): T | {
    type: TokenType.EOF;
  };
  next(): T | {
    type: TokenType.EOF;
  };
  peek(amount?: number): T | {
    type: TokenType.EOF;
  };
  clone(): TokenIterator<T>;
  injectAfter(inject_items: (T | undefined)[], after_position: number): void;
  match(check: IterableCheck<T>, n?: number): boolean;
  disposeIf(check: IterableCheck<T>, n?: number): boolean;
  disposeNot(check: IterableCheck<T>, n?: number): boolean;
  expect(check: IterableCheck<T>): T | {
    type: TokenType.EOF;
  };
  expectResult<T extends TokenType>(check: T, or?: () => AnyToken & {
    type: T;
  }): AnyToken & {
    type: T;
  };
  last(n?: number): T | undefined;
  select(mode: "used" | "remaining"): (T | undefined)[];
  until(check: IterableCheck<T>, callback: (iterator: TokenIterator) => void): void;
  collectUntil<I>(check: IterableCheck<T>, callback: (iterator: TokenIterator) => I): I[];
}
interface ParserContext {
  iterator: TokenIterator;
  system: System;
}
type PlagueFNCallback = () => [string, DataValue, VariableOptions?];
interface PluginImplCtx<D extends DataValue = DataValue> {
  name: string;
  data: D;
  args: DataValue[];
  scope: DataScope;
}
interface Plugin__Impl {
  name: string;
  case: (ctx: PluginImplCtx) => boolean;
  handle: (ctx: PluginImplCtx) => DataValue | undefined;
}
interface Plugin__Expression<E extends Expression> {
  case: (t: AnyToken) => boolean;
  create: (ctx: ParserContext) => E;
  test?: (expression: Expression) => boolean;
  handle: (expression: E, scope: DataScope) => DataValue;
}
interface Plugin__Statement<S extends Statement> {
  trim_case?: boolean;
  case: IterableCheck<AnyToken>;
  createStatement: (ctx: ParserContext) => S;
  test?: (statement: Statement) => boolean;
  handleStatement: (statement: S, scope: DataScope) => any;
}
declare abstract class Plugin<Opts extends {
  statement?: Plugin__Statement<Statement>[];
  expression?: Plugin__Expression<Expression>[];
} = {}> {
  static bindValues(scope: DataScope, plugin: Plugin): void;
  static functionHandler(name: string, data: DataValue, options?: VariableOptions): PlagueFNCallback;
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
declare class System {
  keywords?: LanguageDictionary;
  impl_list: Set<Plugin__Impl>;
  expression_handlers: Set<Plugin__Expression<Expression>>;
  statement_handlers: Set<Plugin__Statement<Statement>>;
  default_values: Map<string, [DataValue, VariableOptions?]>;
  clearUtilities(): void;
  loadValues(scope: DataScope): void;
  loadPlugins(plugins: Plugin[]): this;
}
declare class DataScope {
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
declare class Environment {
  system: System;
  root_scope: DataScope;
  options: EnvironmentOptions;
  states: EnvironmentStates;
  constructor(system: System);
  callDepth(): number;
  callDepth(move: number): this;
}
declare enum DataType {
  CUSTOM = "custom",
  NULL = "null",
  ANY = "any",
  NUMBER = "number",
  STRING = "string",
  OBJECT = "object",
  ARRAY = "array",
  IDENTIFIER = "identifier",
  BOOLEAN = "boolean",
  FUNCTION = "function",
  TYPE_REF = "data-type"
}
type FunctionContext = {
  args: DataValue[];
  this?: DataValue;
};
type FunctionDataCallback = (ctx: FunctionContext) => DataValue | undefined | void;
type FunctionDataValue<C extends FunctionDataCallback = FunctionDataCallback> = {
  type: DataType.FUNCTION;
  call: C;
  scope?: DataScope;
};
type CustomDataValue<K extends string = string, T extends any = any> = {
  type: DataType.CUSTOM;
  id: K;
  value: T;
};
type ObjectDataValue<T = any> = {
  type: DataType.OBJECT;
  value: Record<string, T>;
};
type DataValue = CustomDataValue | {
  type: DataType.NULL;
  value: 0;
} | {
  type: DataType.ANY;
  value: string;
} | {
  type: DataType.BOOLEAN;
  value: boolean;
} | {
  type: DataType.NUMBER;
  value: number;
} | {
  type: DataType.STRING;
  value: string;
} | {
  type: DataType.ARRAY;
  value: DataValue[];
} | {
  type: DataType.IDENTIFIER;
  value: string;
} | {
  type: DataType.OBJECT;
  value: Record<string, DataValue>;
} | {
  type: DataType.TYPE_REF;
  value: DataType;
} | FunctionDataValue;
type DataValueOf<T extends DataType> = Extract<DataValue, {
  type: T;
}>;
declare class Var {
  static Null: () => DataValueOf<DataType.NULL>;
  static Any: (value: string) => DataValueOf<DataType.ANY>;
  static Number: (value: number) => DataValueOf<DataType.NUMBER>;
  static String: (value: string) => DataValueOf<DataType.STRING>;
  static Array: (value: DataValue[]) => DataValueOf<DataType.ARRAY>;
  static Object: <T extends DataValue = DataValue>(value: Record<string, T>) => Exclude<DataValueOf<DataType.OBJECT>, "value"> & {
    value: Record<string, T>;
  };
  static Boolean: (value: boolean) => DataValueOf<DataType.BOOLEAN>;
  static Function: <C extends FunctionDataCallback = FunctionDataCallback>(call: C) => FunctionDataValue<C>;
  static Identifier: (name: string) => DataValueOf<DataType.IDENTIFIER>;
  static Custom: <K extends string, V extends any = any>(id: K, value: V) => CustomDataValue<K, V>;
  static TypeRef: <T extends DataType>(value: T) => DataValueOf<DataType.TYPE_REF>;
  static is<E extends DataType>(data: DataValue, expect: E): data is DataValueOf<E>;
  static satisfies<E extends DataType>(data: DataValue, expect: E): data is DataValueOf<E>;
  static defaults: {
    null: () => {
      type: DataType.NULL;
      value: 0;
    };
    any: () => {
      type: DataType.ANY;
      value: string;
    };
    boolean: () => {
      type: DataType.BOOLEAN;
      value: boolean;
    };
    number: () => {
      type: DataType.NUMBER;
      value: number;
    };
    string: () => {
      type: DataType.STRING;
      value: string;
    };
    array: () => {
      type: DataType.ARRAY;
      value: DataValue[];
    };
    object: () => {
      type: DataType.OBJECT;
      value: Record<string, DataValue>;
    } & {
      value: Record<string, DataValue>;
    };
    function: () => FunctionDataValue<() => {
      type: DataType.NULL;
      value: 0;
    }>;
    identifier: () => {
      type: DataType.IDENTIFIER;
      value: string;
    };
    custom: () => CustomDataValue<"*", {}>;
    "data-type": () => {
      type: DataType.TYPE_REF;
      value: DataType;
    };
  };
}
declare namespace interfaces_d_exports {
  export { CustomExpression, CustomStatement, Expression, ExpressionOf, FunctionParameter, Statement, StatementOf, VariableOptions };
}
interface VariableOptions {
  type?: DataType;
  readonly?: boolean;
}
type FunctionParameter = {
  name: string;
  type?: DataType;
  expect?: boolean;
};
type CustomStatement<T extends any = any> = {
  type: StatementType.CUSTOM;
  id: string;
  data: T;
};
type Statement = CustomStatement | {
  type: StatementType.VARIABLE;
  name: string;
  value: Expression;
} | {
  type: StatementType.EXPRESSION;
  expression: Expression;
} | {
  type: StatementType.FUNCTION;
  name: string;
  params: FunctionParameter[];
  body: Statement[];
} | {
  type: StatementType.RETURN;
  value?: Expression;
} | {
  type: StatementType.IF;
  condition: Expression;
  body: Statement[];
  else?: Statement[];
} | {
  type: StatementType.FORLOOP;
  name: string;
  start: Expression;
  end: Expression;
  body: Statement[];
};
type StatementOf<T extends StatementType> = Extract<Statement, {
  type: T;
}>;
type CustomExpression<K extends string = string, T extends any = any> = {
  type: ExpressionType.CUSTOM;
  id: K;
  data: T;
};
type Expression = CustomExpression | {
  type: ExpressionType.NUMBER;
  value: number;
} | {
  type: ExpressionType.STRING;
  value: string;
} | {
  type: ExpressionType.BOOLEAN;
  value: boolean;
} | {
  type: ExpressionType.IDENTIFIER;
  name: string;
} | {
  type: ExpressionType.ASSIGN;
  target: Expression;
  value: Expression;
} | {
  type: ExpressionType.BINARY;
  left: Expression;
  op: BinaryMethod;
  right: Expression;
} | {
  type: ExpressionType.UNARY;
  op: BinaryMethod;
  right: Expression;
} | {
  type: ExpressionType.CALL;
  callee: Expression;
  args: Expression[];
} | {
  type: ExpressionType.MEMBER_ACCESS;
  object: Expression;
  property: Expression;
} | {
  type: ExpressionType.FUNCTION;
  params: FunctionParameter[];
  body: Statement[];
} | {
  type: ExpressionType.IMPL;
  name: string;
  callee: Expression;
  args: Expression[];
} | {
  type: ExpressionType.TYPE_REF;
  value: DataType;
};
type ExpressionOf<T extends ExpressionType> = Extract<Expression, {
  type: T;
}>;
declare class VariablePlugin extends Plugin {
  id: string;
  constructor();
}
declare class FunctionPlugin extends Plugin<{}> {
  id: string;
  constructor();
}
declare class ReturnPlugin extends Plugin {
  id: string;
  constructor();
}
declare class IfPlugin extends Plugin {
  id: string;
  constructor();
}
type TableEntry = {
  key: string;
  value: Expression;
} | {
  value: Expression;
};
declare class TablesPlugin extends Plugin<{}> {
  readonly id = "table";
  constructor();
  static handleInlineMethod(ctx: ParserContext, entries: TableEntry[]): void;
}
declare class ClassPlugin extends Plugin {
  readonly id = "class";
  constructor();
}
declare class ArrayPlugin extends Plugin<{}> {
  readonly id = "vec";
  constructor();
}
declare class ForLoopPlugin extends Plugin<{}> {
  readonly id = "for-loop";
  max_calls: number;
  private static for_loop_statement;
  constructor();
}
declare class StringExtension extends Plugin<{}> {
  id: string;
  constructor();
}
declare class CoreMethodsPlugin {
  static READONLY_VARIABLE: VariableOptions;
  static FN_PRINT: PlagueFNCallback;
  static FN_LEN: PlagueFNCallback;
  static list: Plugin["values"];
}
declare const core_plugins: Plugin<any>[];
export { DataScope as A, StatementType as B, DataType as C, FunctionDataValue as D, FunctionContext as E, LanguageDictionary as F, TokenType as H, default_language_dicitionary as I, BinaryMethod as L, System as M, Plugin as N, ObjectDataValue as O, ParserContext as P, ExpressionType as R, CustomDataValue as S, DataValueOf as T, AnyToken as V, FunctionParameter as _, FunctionPlugin as a, VariableOptions as b, StringExtension as c, VariablePlugin as d, core_plugins as f, ExpressionOf as g, Expression as h, ForLoopPlugin as i, Environment as j, Var as k, TableEntry as l, CustomStatement as m, ClassPlugin as n, IfPlugin as o, CustomExpression as p, CoreMethodsPlugin as r, ReturnPlugin as s, ArrayPlugin as t, TablesPlugin as u, Statement as v, DataValue as w, interfaces_d_exports as x, StatementOf as y, LogicPriority as z };