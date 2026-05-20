import { BinaryMethod } from "../shared/enums.js";
import {
	type DataValue,
	type DataValueOf,
	DataType,
	Var,
} from "../shared/variables.js";

type OpMap<A extends DataType, B extends DataType> = (
	left: DataValueOf<A>,
	right: DataValueOf<B>
) => DataValue;

type MethodDict = {
	[A in DataType]?: {
		[B in DataType]?: {
			[C in BinaryMethod]?: OpMap<A, B>;
		};
	};
};

export class MethodOps {
	private static filter(list: DataValue[], value: DataValue) {
		return list.filter((a) => {
			return (
				a.type != value.type &&
				("value" in a && "value" in value
					? a.value != value.value
					: true)
			);
		});
	}
	static Dict: MethodDict = {
		[DataType.NUMBER]: {
			[DataType.NUMBER]: {
				[BinaryMethod.ADD]: (left, right) =>
					Var.Number(left.value + right.value),
				[BinaryMethod.SUBTRACT]: (left, right) =>
					Var.Number(left.value - right.value),
				[BinaryMethod.MULTIPLY]: (left, right) =>
					Var.Number(left.value * right.value),
				[BinaryMethod.DIVIDE]: (left, right) =>
					Var.Number(left.value / right.value),
				[BinaryMethod.IS]: (left, right) =>
					Var.Boolean(left.value === right.value),
				[BinaryMethod.NOT]: (left, right) =>
					Var.Boolean(left.value !== right.value),
				[BinaryMethod.LESS_THAN]: (left, right) =>
					Var.Boolean(left.value < right.value),
				[BinaryMethod.GREATER_THAN]: (left, right) =>
					Var.Boolean(left.value > right.value),
			},
		},
		[DataType.STRING]: {
			[DataType.STRING]: {
				[BinaryMethod.ADD]: (left, right) =>
					Var.String(String(left.value).concat(String(right.value))),
				[BinaryMethod.SUBTRACT]: (left, right) =>
					Var.String(
						String(left.value).replace(String(right.value), "")
					),
				[BinaryMethod.DIVIDE]: (left, right) =>
					Var.String(
						String(left.value).replaceAll(String(right.value), "")
					),
				[BinaryMethod.IS]: (left, right) =>
					Var.Boolean(String(left.value) === String(right.value)),
				[BinaryMethod.NOT]: (left, right) =>
					Var.Boolean(String(left.value) !== String(right.value)),
			},
		},
		[DataType.ARRAY]: {
			[DataType.ANY]: {
				[BinaryMethod.ADD]: (left, right) =>
					Var.Array([...left.value, right]),
				[BinaryMethod.SUBTRACT]: (left, right) =>
					Var.Array(MethodOps.filter(left.value, right)),
				[BinaryMethod.DIVIDE]: (left, right) => {
					left.value = MethodOps.filter(left.value, right);
					return left;
				},
				[BinaryMethod.MULTIPLY]: (left, right) => {
					left.value.push(right);
					return left;
				},
			},
		},
	};

	static apply<L extends DataValue, R extends DataValue>(
		left: L,
		op: BinaryMethod,
		right: R
	) {
		const left_part = this.Dict[left.type];
		if (left_part == undefined) return;
		const right_part = left_part[right.type];
		if (right_part == undefined) return;
		const op_method = right_part[op];
		if (op_method == undefined) return;
		return (op_method as any)(left, right);
	}
}
