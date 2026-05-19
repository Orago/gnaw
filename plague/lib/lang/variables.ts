import type { DataScope } from "./states.js";

export enum DataType {
	NULL = "null",
	ANY = "any",
	NUMBER = "number",
	STRING = "string",
	OBJECT = "object",
	ARRAY = "array",
	IDENTIFIER = "identifier",
	CUSTOM = "custom",
	BOOLEAN = "boolean",
	FUNCTION = "function",
}

export type FunctionContext = {
	// primary states
	args: DataValue[];
	this?: DataValue;

	// reference hooks
	scope_ref: DataScope;

	// methods
	get: (name: string) => DataValue | undefined;
	set: (name: string, value: DataValue) => void;
	delete: (name: string) => void;
};

type FunctionDataCallback = (
	options: FunctionContext
) => DataValue | undefined | void;

export type FunctionDataValue<
	C extends FunctionDataCallback = FunctionDataCallback
> = {
	type: DataType.FUNCTION;
	call: C;
};

export type CustomDataValue<T extends any = any> = {
	type: DataType.CUSTOM;
	id: any;
	value: T;
};

export type ObjectDataValue<T = any> = {
	type: DataType.OBJECT;
	value: Record<string, T>;
};

export type DataValue =
	| { type: DataType.NULL; value: 0 }
	| { type: DataType.ANY; value: string }
	| { type: DataType.BOOLEAN; value: boolean }
	| { type: DataType.NUMBER; value: number }
	| { type: DataType.STRING; value: string }
	| { type: DataType.ARRAY; value: DataValue[] }
	| { type: DataType.IDENTIFIER; value: string }
	| { type: DataType.OBJECT; value: Record<string, DataValue> }
	| CustomDataValue
	| FunctionDataValue;

export type DataValueOf<T extends DataType> = Extract<DataValue, { type: T }>;

export class Var {
	static Null = (): DataValueOf<DataType.NULL> => ({
		type: DataType.NULL,
		value: 0,
	});
	static Any = (value: string): DataValueOf<DataType.ANY> => ({
		type: DataType.ANY,
		value,
	});
	static Number = (value: number): DataValueOf<DataType.NUMBER> => ({
		type: DataType.NUMBER,
		value,
	});
	static String = (value: string): DataValueOf<DataType.STRING> => ({
		type: DataType.STRING,
		value,
	});
	static Array = (value: DataValue[]): DataValueOf<DataType.ARRAY> => ({
		type: DataType.ARRAY,
		value,
	});

	static Object = <T extends DataValue = DataValue>(
		value: Record<string, T>
	): Exclude<DataValueOf<DataType.OBJECT>, "value"> & {
		value: Record<string, T>;
	} => ({
		type: DataType.OBJECT,
		value,
	});

	static Boolean = (value: boolean): DataValueOf<DataType.BOOLEAN> => ({
		type: DataType.BOOLEAN,
		value,
	});

	static Function = <C extends FunctionDataCallback = FunctionDataCallback>(
		call: C
	): FunctionDataValue<C> => ({
		type: DataType.FUNCTION,
		call,
	});

	static Identifier = (name: string): DataValueOf<DataType.IDENTIFIER> => ({
		type: DataType.IDENTIFIER,
		value: name,
	});

	static Custom = <T extends any = any>(
		id: string,
		value: T
	): CustomDataValue<T> => ({
		type: DataType.CUSTOM,
		id,
		value,
	});

	static is<E extends DataType>(
		data: DataValue,
		expect: E
	): data is DataValueOf<E> {
		return data.type == expect;
	}

	static defaults = {
		[DataType.NULL]: () => Var.Null(),
		[DataType.ANY]: () => Var.Any(""),
		[DataType.BOOLEAN]: () => Var.Boolean(false),
		[DataType.NUMBER]: () => Var.Number(0),
		[DataType.STRING]: () => Var.String(""),
		[DataType.ARRAY]: () => Var.Array([]),
		[DataType.OBJECT]: () => Var.Object({}),
		[DataType.FUNCTION]: () => Var.Function(() => Var.Null()),
		[DataType.IDENTIFIER]: () => Var.Identifier("*"),
		[DataType.CUSTOM]: () => Var.Custom("*", {}),
	} satisfies {
		[K in DataType]: () => DataValueOf<K>;
	};
}
