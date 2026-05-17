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

export type FunctionDataValue = {
	type: DataType.FUNCTION;
	call: (args: DataValue[]) => DataValue | null;
};

export type CustomDataValue<T extends any = any> = {
	type: DataType.CUSTOM;
	id: any;
	value: T;
};

export type DataValue =
	| { type: DataType.NULL; value: 0 }
	| { type: DataType.ANY; value: string }
	| { type: DataType.BOOLEAN; value: boolean }
	| { type: DataType.NUMBER; value: number }
	| { type: DataType.STRING; value: string }
	| { type: DataType.ARRAY; value: DataValue[] }
	| { type: DataType.OBJECT; value: Record<string, DataValue> }
	| { type: DataType.IDENTIFIER; value: string }
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

	static Object = (
		value: Record<string, DataValue>
	): DataValueOf<DataType.OBJECT> => ({
		type: DataType.OBJECT,
		value,
	});

	static Boolean = (value: boolean): DataValueOf<DataType.BOOLEAN> => ({
		type: DataType.BOOLEAN,
		value,
	});

	static Function = (
		call: FunctionDataValue["call"]
	): DataValueOf<DataType.FUNCTION> => ({
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
