// import { BinaryMethod } from "./interfaces.js";
// import { DataType, DataValue } from "./variables.js";

type ModName<
	L extends DataType = DataType,
	BM extends BinaryMethod = BinaryMethod,
	R extends DataType = DataType
> = `${L} ${BM} ${R}`;
type BinaryMethodModList = Partial<
	Record<ModName, (left: DataValue, right: DataValue) => DataValue>
>;
type ModCB<
	L extends DataType = DataType,
	R extends DataType = DataType,
	O extends DataType = DataType
> = (
	left: Extract<DataValue, { type: L }>,
	right: Extract<DataValue, { type: R }>
) => DataValue & { type: O };

type MethodEntry<
	L extends DataType = DataType,
	R extends DataType = DataType,
	M extends BinaryMethod = BinaryMethod,
	O extends DataType = DataType
> = readonly [ModName<L, M, R>, ModCB<L, R, O>];

export class MethodMod {
	static create<
		L extends DataType,
		M extends BinaryMethod,
		R extends DataType
	>(
		[left, op, right]: [left: L, op: M, right: R],
		cb: ModCB<L, R>
	): MethodEntry<L, R, M> {
		return [`${left} ${op} ${right}`, cb];
	}

	static name<L extends DataType, M extends BinaryMethod, R extends DataType>(
		left: L,
		op: M,
		right: R
	): ModName<L, M, R> {
		return `${left} ${op} ${right}`;
	}

	static cb(cb: ModCB) {
		return cb;
	}

	static list = [
		this.create(
			[DataType.ARRAY, BinaryMethod.ADD, DataType.ANY],
			(left, right) => ({
				type: DataType.ARRAY,
				value: [...left.value, right],
			})
		),
	] as const;

	static dict: Partial<BinaryMethodModList> = Object.fromEntries(this.list);

	static operateArray(
		left: Extract<DataValue, { type: DataType.ARRAY }>,
		op: BinaryMethod,
		right: DataValue
	): DataValue | undefined {
		switch (op) {
			case BinaryMethod.ADD:
				return {
					type: DataType.ARRAY,
					value: [...left.value, right],
				};

			case BinaryMethod.SUBTRACT:
			case BinaryMethod.DIVIDE: {
				const filtered = left.value.filter(
					(a) =>
						a.type != right.type &&
						("value" in a && "value" in right
							? a.value != right.value
							: true)
				);

				if (op == BinaryMethod.SUBTRACT) {
					return {
						type: DataType.ARRAY,
						value: filtered,
					};
				} else {
					left.value = filtered;
					return left;
				}
			}

			case BinaryMethod.MULTIPLY: {
				left.value.push(right);
				return left;
			}
		}
	}

	static operateNumber(
		left: Extract<DataValue, { type: DataType.NUMBER }>,
		op: BinaryMethod,
		right: DataValue
	): DataValue | undefined {
		if (right.type == DataType.NUMBER) {
			switch (op) {
				case BinaryMethod.ADD:
					return {
						type: DataType.NUMBER,
						value: left.value + right.value,
					};
				case BinaryMethod.SUBTRACT:
					return {
						type: DataType.NUMBER,
						value: left.value - right.value,
					};
				case BinaryMethod.MULTIPLY:
					return {
						type: DataType.NUMBER,
						value: left.value * right.value,
					};

				case BinaryMethod.DIVIDE:
					return {
						type: DataType.NUMBER,
						value: left.value / right.value,
					};
				case BinaryMethod.IS:
					return {
						type: DataType.BOOLEAN,
						value: left.value === right.value,
					};
				case BinaryMethod.NOT:
					return {
						type: DataType.BOOLEAN,
						value: left.value !== right.value,
					};
				case BinaryMethod.LESS_THAN:
					return {
						type: DataType.BOOLEAN,
						value: left.value < right.value,
					};

				case BinaryMethod.GREATER_THAN:
					return {
						type: DataType.BOOLEAN,
						value: left.value > right.value,
					};
			}
		}
	}

	static operateString(
		left: Extract<DataValue, { type: DataType.NUMBER | DataType.STRING }>,
		op: BinaryMethod,
		right: DataValue
	): DataValue | undefined {
		if (right.type == DataType.STRING || right.type == DataType.NUMBER) {
			const left_string = String(left.value);
			const right_string = String(right.value);
			switch (op) {
				case BinaryMethod.ADD:
					return {
						type: DataType.STRING,
						value: left_string.concat(right_string),
					};
				case BinaryMethod.SUBTRACT:
					return {
						type: DataType.STRING,
						value: left_string.replace(right_string, ""),
					};

				case BinaryMethod.DIVIDE:
					return {
						type: DataType.STRING,
						value: left_string.replaceAll(right_string, ""),
					};
				case BinaryMethod.IS:
					return {
						type: DataType.BOOLEAN,
						value: left_string === right_string,
					};
				case BinaryMethod.NOT:
					return {
						type: DataType.BOOLEAN,
						value: left_string !== right_string,
					};
			}
		}
	}
}
