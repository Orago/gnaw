import { BinaryMethod } from "./interfaces.js";
import { DataType, DataValue } from "./variables.js";

export class MethodMod {
	private static $STR(
		value: string
	): Extract<DataValue, { type: DataType.STRING }> {
		return { type: DataType.STRING, value };
	}
	private static $NUM(
		value: number
	): Extract<DataValue, { type: DataType.NUMBER }> {
		return { type: DataType.NUMBER, value };
	}

	private static $ARR(
		value: DataValue[]
	): Extract<DataValue, { type: DataType.ARRAY }> {
		return { type: DataType.ARRAY, value };
	}

	private static $BOOL(
		value: boolean | number
	): Extract<DataValue, { type: DataType.BOOLEAN }> {
		return { type: DataType.BOOLEAN, value: !!value };
	}

	static operateArray(
		left: Extract<DataValue, { type: DataType.ARRAY }>,
		op: BinaryMethod,
		right: DataValue
	): DataValue | undefined {
		switch (op) {
			case BinaryMethod.ADD:
				return this.$ARR([...left.value, right]);

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
					return this.$ARR(filtered);
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
					return this.$NUM(left.value + right.value);
				case BinaryMethod.SUBTRACT:
					return this.$NUM(left.value - right.value);
				case BinaryMethod.MULTIPLY:
					return this.$NUM(left.value * right.value);
				case BinaryMethod.DIVIDE:
					return this.$NUM(left.value / right.value);
				case BinaryMethod.IS:
					return this.$BOOL(left.value === right.value);
				case BinaryMethod.NOT:
					return this.$BOOL(left.value !== right.value);
				case BinaryMethod.LESS_THAN:
					return this.$BOOL(left.value < right.value);
				case BinaryMethod.GREATER_THAN:
					return this.$BOOL(left.value > right.value);
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
					return this.$STR(left_string.concat(right_string));
				case BinaryMethod.SUBTRACT:
					return this.$STR(left_string.replace(right_string, ""));
				case BinaryMethod.DIVIDE:
					return this.$STR(left_string.replaceAll(right_string, ""));
				case BinaryMethod.IS:
					this.$BOOL(left_string === right_string);
				case BinaryMethod.NOT:
					this.$BOOL(left_string !== right_string);
			}
		}
	}

	static operateAny(left: DataValue, op: BinaryMethod, right: DataValue) {
		if (left.type == DataType.ARRAY) {
			const m = MethodMod.operateArray(left, op, right);
			if (m) return m;
		}

		if (left.type == DataType.NUMBER) {
			const m = MethodMod.operateNumber(left, op, right);
			if (m) return m;
		}

		if (left.type == DataType.STRING || left.type == DataType.NUMBER) {
			const m = MethodMod.operateString(left, op, right);
			if (m) return m;
		}
	}
}
