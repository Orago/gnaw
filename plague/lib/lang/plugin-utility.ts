import type { IterableCheck } from "../token-iterator.js";
import type { AnyToken } from "../tokens.js";
import {
	type CustomStatement,
	Expression,
	ExpressionOf,
	type ParserContext,
	type Statement,
	StatementOf,
	StatementType,
	VariableOptions,
} from "./interfaces.js";
import { DataScope } from "./states.js";
import { DataValue } from "./variables.js";

export type PlagueFNCallback = () => [string, DataValue, VariableOptions?];

export interface PluginImplCtx<D extends DataValue = DataValue> {
	name: string;
	data: D;
	args: DataValue[];
	scope: DataScope;
}

export interface Plugin__Impl {
	name: string;
	case: (ctx: PluginImplCtx) => boolean;
	handle: (ctx: PluginImplCtx) => DataValue | undefined;
}

export interface Plugin__Expression<E extends Expression> {
	case: (t: AnyToken) => boolean;
	create: (ctx: ParserContext) => E;
	test?: (expression: Expression) => boolean;
	handle: (expression: E, scope: DataScope) => DataValue;
}

export interface Plugin__Statement<S extends Statement> {
	trim_case?: boolean;
	case: IterableCheck<AnyToken>;
	/** Removes case from iterator */
	createStatement: (ctx: ParserContext) => S;

	test?: (statement: Statement) => boolean;
	handleStatement: (statement: S, scope: DataScope) => any;
}

export abstract class Plugin<
	Opts extends {
		statement?: Plugin__Statement<Statement>[];
		expression?: Plugin__Expression<Expression>[];
		imp?: DataValue;
	} = {}
> {
	static bindValues(scope: DataScope, plugin: Plugin): void {
		if (plugin.values == undefined) return;
		const values = plugin.values();
		if (Array.isArray(values)) {
			for (const [key, value, options] of values) {
				scope.set(key, value, options);
			}
		} else {
			for (const [k, v] of Object.entries(values)) {
				scope.set(k, v);
			}
		}
	}

	static wrapFunction(
		name: string,
		data: DataValue,
		options?: VariableOptions
	): PlagueFNCallback {
		if (options != undefined) {
			return () => [name, data, options];
		} else {
			return () => [name, data];
		}
	}

	static ownsStatement(plugin: Plugin, statement: Statement): boolean {
		return (
			statement.type == StatementType.CUSTOM && statement.id == plugin.id
		);
	}

	static implHandler<T extends Plugin__Impl>(options: T): T {
		return options;
	}

	static expressionHandler<T extends Expression>(
		options: Plugin__Expression<T>
	): Plugin__Expression<T> {
		return options as any;
	}

	static statementHandler<S extends Statement>(
		options: Plugin__Statement<S>
	): Plugin__Statement<S> {
		return options as any;
	}

	abstract id: string;

	// * Primary

	declare StatementType: Opts["statement"];

	declare impl?: Plugin__Impl[];

	declare expressions?: Opts["expression"] | Plugin__Expression<Expression>;
	getExpressions(): Plugin__Expression<Expression>[] | undefined {
		return this.expressions as Plugin__Expression<Expression>[];
	}

	declare statements?: Opts["statement"];
	getStatements(): Plugin__Statement<Statement>[] | undefined {
		return this.statements as Plugin__Statement<Statement>[];
	}

	declare values?: () =>
		| Record<string, DataValue>
		| [string, DataValue, VariableOptions?][];
}
