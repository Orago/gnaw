import { type BinaryMethod, ExpressionType } from "../shared/enums.js";
import type {
	Expression,
	ExpressionOf,
	FunctionParameter,
	Statement,
} from "../shared/interfaces.js";
import type { DataType } from "../shared/variables.js";

export class Ast {
	static Number = (value: number): ExpressionOf<ExpressionType.NUMBER> => ({
		type: ExpressionType.NUMBER,
		value,
	});

	static String = (value: string): ExpressionOf<ExpressionType.STRING> => ({
		type: ExpressionType.STRING,
		value,
	});
	static Boolean = (
		value: boolean
	): ExpressionOf<ExpressionType.BOOLEAN> => ({
		type: ExpressionType.BOOLEAN,
		value,
	});
	static Identifier = (
		name: string
	): ExpressionOf<ExpressionType.IDENTIFIER> => ({
		type: ExpressionType.IDENTIFIER,
		name,
	});
	static Assign = (
		target: Expression,
		value: Expression
	): ExpressionOf<ExpressionType.ASSIGN> => ({
		type: ExpressionType.ASSIGN,
		target,
		value,
	});
	static Binary = (
		left: Expression,
		op: BinaryMethod,
		right: Expression
	): ExpressionOf<ExpressionType.BINARY> => ({
		type: ExpressionType.BINARY,
		left,
		op,
		right,
	});
	static Unary = (
		op: BinaryMethod,
		right: Expression
	): ExpressionOf<ExpressionType.UNARY> => ({
		type: ExpressionType.UNARY,
		op,
		right,
	});
	static InvokeCall = (
		callee: Expression,
		args: Expression[]
	): ExpressionOf<ExpressionType.CALL> => ({
		type: ExpressionType.CALL,
		callee,
		args,
	});
	static Member = (
		object: Expression,
		property: Expression
	): ExpressionOf<ExpressionType.MEMBER_ACCESS> => ({
		type: ExpressionType.MEMBER_ACCESS,
		object,
		property,
	});
	static Function = (
		params: FunctionParameter[],
		body: Statement[]
	): ExpressionOf<ExpressionType.FUNCTION> => ({
		type: ExpressionType.FUNCTION,
		params,
		body,
	});
	static Impl = (
		callee: Expression,
		name: string,
		args: Expression[]
	): ExpressionOf<ExpressionType.IMPL> => ({
		type: ExpressionType.IMPL,
		name,
		callee,
		args,
	});

	static TypeRef = (
		value: DataType
	): ExpressionOf<ExpressionType.TYPE_REF> => ({
		type: ExpressionType.TYPE_REF,
		value,
	});
}
