import type { IterableCheck } from "../token-iterator.js";
import type { AnyToken } from "../tokens.js";
import {
	type CustomStatement,
	Expression,
	type ParserContext,
	type Statement,
	StatementType,
	VariableOptions,
} from "./interfaces.js";
import { DataScope } from "./states.js";
import { DataValue } from "./variables.js";

export type PlagueFNCallback = () => [string, DataValue, VariableOptions?];

export interface PluginImpCtx<D extends DataValue = DataValue> {
	name: string;
	data: D;
	arguments: DataValue[];
}

export abstract class PlaguePlugin<
	Opts extends {
		statement?: Statement;
		expression?: Expression;
		imp?: DataValue;
	} = {}
> {
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

	static ownsStatement(plugin: PlaguePlugin, statement: Statement): boolean {
		return (
			statement.type == StatementType.CUSTOM && statement.id == plugin.id
		);
	}
	abstract id: string;

	declare imp?: Opts["imp"] extends undefined
		? never
		: {
				name: string;
				case: (ctx: PluginImpCtx) => boolean;
				handle: (ctx: PluginImpCtx) => DataValue | undefined;
		  }[];

	// * Primary
	declare primary_literal?: Opts["expression"] extends undefined
		? never
		: {
				case: (t: AnyToken) => boolean;
				create: (ctx: ParserContext) => Opts["expression"];
				test?: (expression: Expression) => boolean;
				handle: (
					expression: Opts["expression"],
					scope: DataScope
				) => DataValue;
		  };

	declare StatementType: Opts["statement"];

	declare statement: Opts extends undefined
		? never
		: {
				case: IterableCheck<AnyToken>;
				createStatement: (ctx: ParserContext) => Opts["statement"];

				test?: (statement: Statement) => boolean;
				handleStatement: (
					statement: Opts["statement"],
					scope: DataScope
				) => any;
		  };

	declare values?: () =>
		| Record<string, DataValue>
		| [string, DataValue, VariableOptions?][];

	protected formatStatement<T extends any>(data: T): CustomStatement<T> {
		return {
			type: StatementType.CUSTOM,
			id: this.id,
			data,
		};
	}
}
