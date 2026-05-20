import {
	type DataValueOf,
	type DataValue,
	DataType,
	Var,
} from "./variables.js";

type CastMap<From extends DataType> = {
	[To in DataType]?: (data: DataValueOf<From>) => DataValueOf<To>;
};

type CastDict = {
	[K in DataType]?: CastMap<K>;
};

export class TypeCasts {
	static from__to = {
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
				}
				if (data.value == String(false)) {
					return Var.Boolean(false);
				}
				return Var.Boolean(data.value.trim().length > 0);
			},
		},
		[DataType.BOOLEAN]: {
			[DataType.NUMBER]: (data) => Var.Number(+data.value),
			[DataType.STRING]: (data) => Var.String(String(data.value)),
		},
		[DataType.NULL]: {
			[DataType.NUMBER]: (data) => Var.Number(0),
			[DataType.STRING]: (data) => Var.String(""),
			[DataType.BOOLEAN]: (data) => Var.Boolean(false),
		},
	} as const satisfies CastDict;

	static convert<T extends DataType>(
		from: DataValue,
		to: T
	): DataValueOf<T> | undefined {
		const from_map = (this.from__to as any)[(from as any).type];
		if (!from_map) return;
		const cb = from_map[to];
		if (!cb) return;
		return cb(from);
	}

	static convertSafe<T extends DataType>(
		from: DataValue,
		to: T
	): DataValueOf<T> {
		if (Var.is(from, to)) {
			return from;
		}
		return (
			TypeCasts.convert(from, to) ??
			(Var.defaults[to]() as DataValueOf<T>)
		);
	}

	static cast_map: Partial<Record<string, DataType>> = {
		string: DataType.STRING,
		number: DataType.NUMBER,
		boolean: DataType.BOOLEAN,
	};

	static isValidCast(name: string): name is keyof typeof TypeCasts.cast_map {
		return TypeCasts.cast_map[name] != undefined;
	}

	/**
	 * ! can throw
	 */
	static getCastType(name: string): DataType {
		const dt = TypeCasts.cast_map[name];
		if (dt != undefined) {
			return dt;
		}
		throw new Error(`Cannot get data type (name: ${name})`);
	}

	/**
	 * ! can throw
	 */
	static cast(data: DataValue, name: string) {
		const dt = TypeCasts.getCastType(name);
		const p = TypeCasts.convert(data, dt);
		if (p != undefined) {
			return p;
		}
	}
}
