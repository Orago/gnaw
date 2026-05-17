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

export type DataValue =
	| { type: DataType.NULL; value: 0 }
	| { type: DataType.ANY; value: string }
	| { type: DataType.STRING; value: string }
	| { type: DataType.NUMBER; value: number }
	| { type: DataType.ARRAY; value: DataValue[] }
	| { type: DataType.OBJECT; value: Record<string, DataValue> }
	| { type: DataType.IDENTIFIER; value: string }
	| { type: DataType.CUSTOM; id: any; value: any }
	| { type: DataType.BOOLEAN; value: boolean }
	| FunctionDataValue;
