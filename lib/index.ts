export { Parser } from "./parser/core.js";
export {
	default_language_dicitionary,
	type LanguageDictionary,
} from "./parser/lexer.js";
export { ParserQuick } from "./parser/quick.js";
export { core_plugins } from "./plugin/core-plugins.js";
export { Plugin } from "./plugin/plugin-utility.js";
export { Language, FunctionUtil } from "./runtime/index.js";
export { DataScope, Environment, System } from "./shared/data.js";
export {
	BinaryMethod,
	ExpressionType,
	LogicPriority,
	StatementType,
} from "./shared/enums.js";
export {
	DataType,
	type CustomDataValue,
	type FunctionContext,
	type FunctionDataValue,
	type ObjectDataValue,
	type DataValue,
	type DataValueOf,
	Var,
} from "./shared/variables.js";
export * as Interface from "./shared/interfaces.js";
