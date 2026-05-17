export enum DataTypes {
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
	type: DataTypes.FUNCTION;
	call: (args: DataValue[]) => DataValue;
};

export type DataValue =
	| { type: DataTypes.NULL; value: 0 }
	| { type: DataTypes.ANY; value: string }
	| { type: DataTypes.STRING; value: string }
	| { type: DataTypes.NUMBER; value: number }
	| { type: DataTypes.ARRAY; value: DataValue[] }
	| { type: DataTypes.OBJECT; value: Record<string, DataValue> }
	| { type: DataTypes.IDENTIFIER; value: string }
	| { type: DataTypes.CUSTOM; id: any; value: any }
	| { type: DataTypes.BOOLEAN; value: boolean }
	| FunctionDataValue;
