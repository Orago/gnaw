import { DataScope, Environment } from "../shared/data.js";
import { BinaryMethod } from "../shared/enums.js";
import { Expression, FunctionParameter, Statement } from "../shared/interfaces.js";
import type { DataValue, FunctionContext } from "../shared/variables.js";
import { FunctionDataValue } from "../shared/variables.js";
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
