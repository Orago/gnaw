import { type BinaryMethod, ExpressionType } from "../shared/enums.js";
import type { CustomExpression, Expression, ExpressionOf, FunctionParameter, Statement } from "../shared/interfaces.js";
import type { DataType } from "../shared/variables.js";
export declare class Ast {
    static Number: (value: number) => ExpressionOf<ExpressionType.NUMBER>;
    static String: (value: string) => ExpressionOf<ExpressionType.STRING>;
    static Boolean: (value: boolean) => ExpressionOf<ExpressionType.BOOLEAN>;
    static Identifier: (name: string) => ExpressionOf<ExpressionType.IDENTIFIER>;
    static Assign: (target: Expression, value: Expression) => ExpressionOf<ExpressionType.ASSIGN>;
    static Binary: (left: Expression, op: BinaryMethod, right: Expression) => ExpressionOf<ExpressionType.BINARY>;
    static Unary: (op: BinaryMethod, right: Expression) => ExpressionOf<ExpressionType.UNARY>;
    static InvokeCall: (callee: Expression, args: Expression[]) => ExpressionOf<ExpressionType.CALL>;
    static Member: (object: Expression, property: Expression) => ExpressionOf<ExpressionType.MEMBER_ACCESS>;
    static Function: (params: FunctionParameter[], body: Statement[]) => ExpressionOf<ExpressionType.FUNCTION>;
    static Impl: (callee: Expression, name: string, args: Expression[]) => ExpressionOf<ExpressionType.IMPL>;
    static TypeRef: (value: DataType) => ExpressionOf<ExpressionType.TYPE_REF>;
    static Custom: <K extends string, V extends any>(id: K, data: V) => CustomExpression<K, V>;
}
