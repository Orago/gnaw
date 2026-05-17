import type { IterableCheck } from "../token-iterator.js";
import type { AnyToken } from "../tokens.js";
import {
	type CustomStatement,
	Expression,
	type PlagueParserContext,
	type Statement,
	StatementType,
} from "./interfaces.js";
import { PlagueScope } from "./states.js";
import { DataValue } from "./variables.js";

// abstract class PlaguePluginStatement {
// 	constructor(public plugin: PlaguePlugin) {}
// 	abstract case: IterableCheck<AnyToken>;
// 	abstract handleStatement(statement: Statement, scope: PlagueScope): any;

// 	abstract createStatement(ctx: PlagueParserContext): Statement;
// 	protected formatStatement<T extends any>(data: T): CustomStatement<T> {
// 		return {
// 			type: StatementType.CUSTOM_PLUGIN,
// 			id: this.plugin.id,
// 			data,
// 		};
// 	}
// }

export abstract class PlaguePlugin<
	Opts extends {
		statement?: Statement;
		expression?: Expression;
	} = {}
> {
	// static Statement = PlaguePluginStatement;
	static ownsStatement(plugin: PlaguePlugin, statement: Statement): boolean {
		return (
			statement.type == StatementType.CUSTOM_PLUGIN &&
			statement.id == plugin.id
		);
	}
	abstract id: string;

	// abstract statement: PlaguePluginStatement
	// * Primary
	declare primary_literal?: Opts["expression"] extends undefined
		? never
		: {
				case: (t: AnyToken) => boolean;
				create: (ctx: PlagueParserContext) => Opts["expression"];
				handle: (
					expression: Opts["expression"],
					scope: PlagueScope
				) => DataValue;
		  };

	declare StatementType: Opts["statement"];

	declare statement: Opts extends undefined
		? never
		: {
				case: IterableCheck<AnyToken>;
				createStatement: (
					ctx: PlagueParserContext
				) => Opts["statement"];

				test?: (statement: Statement) => boolean;
				handleStatement: (
					statement: Opts["statement"],
					scope: PlagueScope
				) => any;
		  };

	declare values?: ()=>Record<string, DataValue>;
	// * Statement
	// abstract statement_case: IterableCheck<AnyToken>;

	// abstract handleStatement(statement: Statement, scope: PlagueScope): any;

	// abstract createStatement(ctx: PlagueParserContext): Statement;

	protected formatStatement<T extends any>(data: T): CustomStatement<T> {
		return {
			type: StatementType.CUSTOM_PLUGIN,
			id: this.id,
			data,
		};
	}
}
