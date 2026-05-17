export enum ExpressionType {
	NUMBER,
	STRING,
	BOOLEAN,
	IDENTIFIER,

	CallExpression,
	MemberAccess,
	Binary,
}

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
	| { type: StatementType.RETURN; value?: Expression }
	| {
			type: StatementType.IF;
			condition: Expression;
			then: Statement[];
			else?: Statement[];
	  }
	| {
			type: StatementType.FORLOOP;
			name: string;
			start: Expression;
			end: Expression;
			body: Statement[];
	  };

export type Expression =
	| { type: ExpressionType.NUMBER; value: number }
	| { type: ExpressionType.STRING; value: string }
	| { type: ExpressionType.BOOLEAN; value: boolean }
	| { type: ExpressionType.IDENTIFIER; name: string }
	| {
			type: ExpressionType.Binary;
			// initial: DataValue;
			// operatiosn: [method: BinaryExpressionMethod, value: DataValue][];
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
			property: string;
	  };
