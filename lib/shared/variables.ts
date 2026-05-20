import type { DataScope } from "./data.js";

export enum DataType {
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
	TYPE_REF = "data-type",
}

export type FunctionContext = {
	// primary states
	args: DataValue[];
	this?: DataValue;

	//! I literally spent an hour trying to remove nesting from this
	//! just to realise args are passed anyways, which removes the point of ctx.get
	//! I also forgot my reason for wanting ctx.set or ctx.delete when all data in a function is scoped
	//! So nothing in here will be passed to outer scopes
	// methods
	// get: (name: string) => DataValue | undefined;
	// set: (name: string, value: DataValue) => void;
	// delete: (name: string) => void;
};

type FunctionDataCallback = (
	ctx: FunctionContext
) => DataValue | undefined | void;

export type FunctionDataValue<
	C extends FunctionDataCallback = FunctionDataCallback
> = {
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

export type DataValue =
	| CustomDataValue
	| { type: DataType.NULL; value: 0 }
	| { type: DataType.ANY; value: string }
	| { type: DataType.BOOLEAN; value: boolean }
	| { type: DataType.NUMBER; value: number }
	| { type: DataType.STRING; value: string }
	| { type: DataType.ARRAY; value: DataValue[] }
	| { type: DataType.IDENTIFIER; value: string }
	| { type: DataType.OBJECT; value: Record<string, DataValue> }
	| { type: DataType.TYPE_REF; value: DataType }
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

	static Custom = <K extends string, V extends any = any>(
		id: K,
		value: V
	): CustomDataValue<K, V> => ({
		type: DataType.CUSTOM,
		id,
		value,
	});

	static TypeRef = <T extends DataType>(
		value: T
	): DataValueOf<DataType.TYPE_REF> => ({
		type: DataType.TYPE_REF,
		value,
	});

	static is<E extends DataType>(
		data: DataValue,
		expect: E
	): data is DataValueOf<E> {
		return data.type == expect;
	}

	static satisfies<E extends DataType>(
		data: DataValue,
		expect: E
	): data is DataValueOf<E> {
		if (data.type == expect) {
			return true;
		} else {
			return expect == DataType.ANY && "type" in data;
		}
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
		[DataType.TYPE_REF]: () => Var.TypeRef(DataType.ANY),
	} satisfies {
		[K in DataType]: () => DataValueOf<K>;
	};
}
