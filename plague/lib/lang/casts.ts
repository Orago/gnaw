import { DataType, DataValue, DataValueOf, Var } from "./variables.js";

type CastMap<From extends DataType> = {
	[To in DataType]?: (data: DataValueOf<From>) => DataValueOf<To>;
};

type CastDict = {
	[K in DataType]?: CastMap<K>;
};

export class TypeCasts {
	static FromTo = {
		[DataType.NUMBER]: {
			[DataType.STRING]: (data) => Var.String(String(data.value)),
			[DataType.BOOLEAN]: (data) => Var.Boolean(data.value != 0),
		},
		[DataType.STRING]: {
			[DataType.NUMBER]: (data) => {
				const num = Number(data.value);
				return Var.Number(isNaN(num) ? 0 : num);
			},
			[DataType.BOOLEAN]: (data) => {
				if (data.value == String(true)) {
					return Var.Boolean(true);
				} else if (data.value == String(false)) {
					return Var.Boolean(false);
				} else {
					return Var.Boolean(data.value.trim().length > 0);
				}
			},
		},
		[DataType.BOOLEAN]: {
			[DataType.NUMBER]: (data) => Var.Number(+data.value),
			[DataType.STRING]: (data) => Var.String(String(data.value)),
		},
	} as const satisfies CastDict;

	static convert<T extends DataType>(
		from: DataValue,
		to: T
	): DataValueOf<T> | undefined {
		const from_map = (this.FromTo as any)[(from as any).type];
		if (!from_map) return;
		const cb = from_map[to];
		if (!cb) return;
		return cb(from);
	}

	static convertSafe<T extends DataType>(
		from: DataValue,
		to: T
	): DataValueOf<T> | undefined {
		return (
			TypeCasts.convert(from, to) ??
			(Var.defaults[to]() as DataValueOf<T>)
		);
	}
}
