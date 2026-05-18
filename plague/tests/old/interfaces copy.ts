// import type TokenIterator from "../token-iterator.js";
// import type { PlagueSystem } from "./states.js";
// import type { DataType } from "./variables.js";

export enum BinaryMethod {
	ADD,
	SUBTRACT,
	MULTIPLY,
	DIVIDE,
	GREATER_THAN,
	LESS_THAN,
	IS,
	NOT,
	AS,
	AND,
	OR,
	ASSIGN,
	DOT,
}

export enum StatementType {
	VARIABLE,
	EXPRESSION,
	FUNCTION,
	RETURN,
	IF,
	FORLOOP,
	CUSTOM_PLUGIN,
}

export type CustomStatement<T extends any = any> = {
	type: StatementType.CUSTOM_PLUGIN;
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
			params: string[];
			body: Statement[];
	  }
	| ReturnStatement
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

export enum ExpressionType {
	NUMBER,
	STRING,
	BOOLEAN,
	IDENTIFIER,

	CALL_EXPRESSION,
	MEMBER_ACCESS,
	BINARY,
	UNARY,
	FUNCTION,
	ASSIGN,

	CUSTOM,
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
			type: ExpressionType.CALL_EXPRESSION;
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
			params: string[];
			body: Statement[];
	  }
	| CustomExpression;

export type ExpressionOf<T extends ExpressionType> = Extract<
	Expression,
	{ type: T }
>;

export class EDescribe {
	private static Wrap<T extends ExpressionType> (){

	}
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
	static Var = (name: string): ExpressionOf<ExpressionType.IDENTIFIER> => ({
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
	static Call = (
		callee: Expression,
		args: Expression[]
	): ExpressionOf<ExpressionType.CALL_EXPRESSION> => ({
		type: ExpressionType.CALL_EXPRESSION,
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
		params: string[],
		body: Statement[]
	): ExpressionOf<ExpressionType.FUNCTION> => ({
		type: ExpressionType.FUNCTION,
		params,
		body,
	});
}

export interface PlagueParserContext {
	iterator: TokenIterator;
	system: PlagueSystem;
}

export interface VariableOptions {
	type?: DataType;
	readonly?: boolean;
}
