import type { LanguageDictionary } from "../parser/lexer.js";
import type {
	Plugin,
	Plugin__Expression,
	Plugin__Impl,
	Plugin__Statement,
} from "../plugin/plugin-utility.js";
import type { Expression, Statement, VariableOptions } from "./interfaces.js";
import type { DataValue } from "./variables.js";

export class System {
	keywords?: LanguageDictionary;

	impl_list: Set<Plugin__Impl> = new Set();
	expression_handlers: Set<Plugin__Expression<Expression>> = new Set();
	statement_handlers: Set<Plugin__Statement<Statement>> = new Set();

	default_values: Map<string, [DataValue, VariableOptions?]> = new Map();

	clearUtilities() {
		this.impl_list.clear();
		this.expression_handlers.clear();
		this.statement_handlers.clear();
	}

	loadValues(scope: DataScope) {
		for (const [key, [value, options]] of this.default_values) {
			scope.set(key, value, options);
		}
	}

	loadPlugins(plugins: Plugin[]): this {
		for (const plugin of plugins) {
			for (const impl of plugin.impl ?? []) {
				this.impl_list.add(impl);
			}

			for (const expression_handler of plugin.getExpressions() ?? []) {
				this.expression_handlers.add(expression_handler);
			}

			for (const statement_handler of plugin.getStatements() ?? []) {
				this.statement_handlers.add(statement_handler);
			}

			if (plugin.values != undefined) {
				const values = plugin.values();

				if (Array.isArray(values)) {
					for (const [key, value, options] of values) {
						this.default_values.set(key, [value, options]);
					}
				} else {
					for (const [k, v] of Object.entries(values)) {
						this.default_values.set(k, [v]);
					}
				}
			}
		}

		return this;
	}
}

export class DataScope {
	static getVariable(scope: DataScope, name: string): DataValue | undefined {
		if (scope.variables[name] != undefined) {
			return scope.variables[name];
		} else if (scope.parent != undefined) {
			return DataScope.getVariable(scope.parent, name);
		}

		return undefined;
	}

	variables: Partial<Record<string, DataValue>> = {};
	variable_modes: Partial<Record<string, VariableOptions>> = {};

	constructor(public environment: Environment, public parent?: DataScope) {}

	extend() {
		return new DataScope(this.environment, this);
	}

	get(name: string) {
		return DataScope.getVariable(this, name);
	}

	set(name: string, value: DataValue, options?: VariableOptions) {
		const opts = this.variable_modes[name];
		if (opts?.readonly == true) {
			throw new Error(`Cannot set over read-only variable (${name})`);
		}

		if (value.type != this.variables[name]?.type) {
			delete this.variable_modes[name];
		}

		if (options != undefined) {
			this.updateVariableOptions(name, options);
		}

		this.variables[name] = value;
	}

	updateVariableOptions(name: string, options?: VariableOptions) {
		if (options) {
			this.variable_modes[name] = options;
		} else {
			delete this.variable_modes[name];
		}
	}

	delete(name: string) {
		delete this.variables[name];
	}
}

interface EnvironmentOptions {
	max_call_stack: number;
	max_loop_stack: number;
}

interface EnvironmentStates {
	call_depth: number;
}

export class Environment {
	root_scope = new DataScope(this);

	options: EnvironmentOptions = {
		max_call_stack: 10,
		max_loop_stack: 10,
	};

	states: EnvironmentStates = {
		call_depth: 0,
	};

	constructor(public system: System) {}

	callDepth(): number;
	callDepth(move: number): this;
	callDepth(value?: number): this | number {
		if (value == undefined || isNaN(value)) {
			return this.states.call_depth;
		} else {
			this.states.call_depth += value;
			if (this.states.call_depth > this.options.max_call_stack) {
				throw new Error(
					`Maximum call stack exceeded (${this.states.call_depth} > ${this.options.max_call_stack})`
				);
			}
			return this;
		}
	}
}
