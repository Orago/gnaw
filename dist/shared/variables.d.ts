import type { DataScope } from "./data.js";
export declare enum DataType {
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
export type FunctionContext = {
    args: DataValue[];
    this?: DataValue;
};
type FunctionDataCallback = (ctx: FunctionContext) => DataValue | undefined | void;
export type FunctionDataValue<C extends FunctionDataCallback = FunctionDataCallback> = {
    type: DataType.FUNCTION;
    call: C;
    scope?: DataScope;
};
export type CustomDataValue<K extends string = string, T extends any = any> = {
    type: DataType.CUSTOM;
    id: K;
    value: T;
};
export type ObjectDataValue<T = any> = {
    type: DataType.OBJECT;
    value: Record<string, T>;
};
export type DataValue = CustomDataValue | {
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
export type DataValueOf<T extends DataType> = Extract<DataValue, {
    type: T;
}>;
export declare class Var {
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
export {};
