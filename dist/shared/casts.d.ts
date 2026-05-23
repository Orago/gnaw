import { type DataValueOf, type DataValue, DataType } from "./variables.js";
export declare class TypeCasts {
    static from__to: {
        readonly number: {
            readonly string: (data: {
                type: DataType.NUMBER;
                value: number;
            }) => {
                type: DataType.STRING;
                value: string;
            };
            readonly boolean: (data: {
                type: DataType.NUMBER;
                value: number;
            }) => {
                type: DataType.BOOLEAN;
                value: boolean;
            };
        };
        readonly string: {
            readonly number: (data: {
                type: DataType.STRING;
                value: string;
            }) => {
                type: DataType.NUMBER;
                value: number;
            };
            readonly boolean: (data: {
                type: DataType.STRING;
                value: string;
            }) => {
                type: DataType.BOOLEAN;
                value: boolean;
            };
        };
        readonly boolean: {
            readonly number: (data: {
                type: DataType.BOOLEAN;
                value: boolean;
            }) => {
                type: DataType.NUMBER;
                value: number;
            };
            readonly string: (data: {
                type: DataType.BOOLEAN;
                value: boolean;
            }) => {
                type: DataType.STRING;
                value: string;
            };
        };
        readonly null: {
            readonly number: (data: {
                type: DataType.NULL;
                value: 0;
            }) => {
                type: DataType.NUMBER;
                value: number;
            };
            readonly string: (data: {
                type: DataType.NULL;
                value: 0;
            }) => {
                type: DataType.STRING;
                value: string;
            };
            readonly boolean: (data: {
                type: DataType.NULL;
                value: 0;
            }) => {
                type: DataType.BOOLEAN;
                value: boolean;
            };
        };
    };
    static convert<T extends DataType>(from: DataValue, to: T): DataValueOf<T> | undefined;
    static convertSafe<T extends DataType>(from: DataValue, to: T): DataValueOf<T>;
    static cast_names: Partial<Record<string, DataType>>;
    static isValidCast(name: string): name is keyof typeof TypeCasts.cast_names;
    static getCastType(name: string): DataType;
    static cast(data: DataValue, name: string): DataValueOf<DataType> | undefined;
}
