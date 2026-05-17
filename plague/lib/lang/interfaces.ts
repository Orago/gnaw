import type TokenIterator from "../token-iterator.js";
import type { PlaguePlugin } from "./plugin-utility.js";
import { PlagueSystem } from "./states.js";

export enum BinaryMethod {
	ADD,
	SUBTRACT,
	MULTIPLY,
	DIVIDE,
	GREATER_THAN,
	LESS_THAN,
	IS,
	NOT,
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

	CallExpression,
	MemberAccess,
	Binary,

	TABLE,
	ASSIGN,

	CUSTOM,
}

export type TableEntry =
	| { key: string; value: Expression }
	| { value: Expression };

export type CustomExpression<T extends any = any> = {
	type: ExpressionType.CUSTOM;
	id: string;
	data: T;
};

export type Expression =
	| CustomExpression
	| { type: ExpressionType.NUMBER; value: number }
	| { type: ExpressionType.STRING; value: string }
	| { type: ExpressionType.BOOLEAN; value: boolean }
	| { type: ExpressionType.IDENTIFIER; name: string }
	| { type: ExpressionType.ASSIGN; target: Expression; value: Expression }
	| {
			type: ExpressionType.Binary;
			left: Expression;
			op: BinaryMethod;
			right: Expression;
	  }
	| {
			type: ExpressionType.CallExpression;
			callee: Expression;
			args: Expression[];
	  }
	| {
			type: ExpressionType.MemberAccess;
			object: Expression;
			property: Expression;
	  }
	| { type: ExpressionType.TABLE; entries: TableEntry[] };

export interface PlagueParserContext {
	iterator: TokenIterator;
	system: PlagueSystem;
}
