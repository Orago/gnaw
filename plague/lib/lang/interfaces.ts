import type { DataType } from "./variables.js";

export enum BinaryMethod {
	ADD,
	SUBTRACT,
	MULTIPLY,
	DIVIDE,
	GREATER_THAN,
	LESS_THAN,
	IS,
	NOT,
	EXCLAMATION,
	AND,
	OR,
	ASSIGN,
	DOT,
}

export interface VariableOptions {
	type?: DataType;
	readonly?: boolean;
}

export type FunctionParameter = {
	name: string;
	type?: DataType;
	expect?: boolean;
};

export enum StatementType {
	VARIABLE,
	EXPRESSION,
	FUNCTION,
	RETURN,
	IF,
	FORLOOP,
	CUSTOM,
}

export type CustomStatement<T extends any = any> = {
	type: StatementType.CUSTOM;
	id: string;
	data: T;
};

export type ReturnStatement = {
	type: StatementType.RETURN;
	value?: Expression;
};

export type Statement =
	| CustomStatement
	| { type: StatementType.VARIABLE; name: string; value: Expression }
	| { type: StatementType.EXPRESSION; expression: Expression }
	| {
			type: StatementType.FUNCTION;
			name: string;
			params: FunctionParameter[];
			body: Statement[];
	  }
	| { type: StatementType.RETURN; value?: Expression }
	| {
			type: StatementType.IF;
			condition: Expression;
			body: Statement[];
			else?: Statement[];
	  }
	| {
			type: StatementType.FORLOOP;
			name: string;
			start: Expression;
			end: Expression;
			body: Statement[];
	  };

export type StatementOf<T extends StatementType> = Extract<
	Statement,
	{ type: T }
>;

export enum ExpressionType {
	NUMBER,
	STRING,
	BOOLEAN,
	IDENTIFIER,

	CALL,
	MEMBER_ACCESS,
	BINARY,
	UNARY,
	FUNCTION,
	ASSIGN,
	IMPL,

	CUSTOM,
	TYPE_REF,
}

export type CustomExpression<T extends any = any> = {
	type: ExpressionType.CUSTOM;
	id: string;
	data: T;
};

export type Expression =
	| { type: ExpressionType.NUMBER; value: number }
	| { type: ExpressionType.STRING; value: string }
	| { type: ExpressionType.BOOLEAN; value: boolean }
	| { type: ExpressionType.IDENTIFIER; name: string }
	| { type: ExpressionType.ASSIGN; target: Expression; value: Expression }
	| {
			type: ExpressionType.BINARY;
			left: Expression;
			op: BinaryMethod;
			right: Expression;
	  }
	| {
			type: ExpressionType.UNARY;
			op: BinaryMethod;
			right: Expression;
	  }
	| {
			type: ExpressionType.CALL;
			callee: Expression;
			args: Expression[];
	  }
	| {
			type: ExpressionType.MEMBER_ACCESS;
			object: Expression;
			property: Expression;
	  }
	| {
			type: ExpressionType.FUNCTION;
			params: FunctionParameter[];
			body: Statement[];
	  }
	| {
			type: ExpressionType.IMPL;
			name: string;
			callee: Expression;
			args: Expression[];
	  }
	| CustomExpression
	| { type: ExpressionType.TYPE_REF; value: DataType };

export type ExpressionOf<T extends ExpressionType> = Extract<
	Expression,
	{ type: T }
>;

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
