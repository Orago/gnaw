import type { ExpressionType, StatementType, BinaryMethod } from "./enums.js";
import type { DataType } from "./variables.js";

export interface VariableOptions {
	type?: DataType;
	readonly?: boolean;
}

export type FunctionParameter = {
	name: string;
	type?: DataType;
	expect?: boolean;
};

export type CustomStatement<T extends any = any> = {
	type: StatementType.CUSTOM;
	id: string;
	data: T;
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
