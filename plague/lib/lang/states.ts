import { LanguageDictionary } from "../lexer.js";
import { VariableOptions } from "./interfaces.js";
import type { Plugin } from "./plugin-utility.js";
import { DataValue } from "./variables.js";

export class System {
	plugins: Plugin[];
	keywords?: LanguageDictionary;
}

interface EnvironmentOptions {
	max_call_stack: number;
	max_loop_stack: number;
}

interface EnvironmentStates {
	call_depth: number;
	// loop_count: number;
}

export class Environment {
	root_scope = new DataScope(this);

	options: EnvironmentOptions = {
		max_call_stack: 10,
		max_loop_stack: 10,
	};

	states: EnvironmentStates = {
		call_depth: 0,
		// loop_count: 0,
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

	loopDepth(): number;
	loopDepth(move: number): this;
	loopDepth(value?: number): this | number {
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

export class DataScope {
	static getVariable(scope: DataScope, name: string): DataValue | undefined {
		if (scope.variables[name] != undefined) {
			return scope.variables[name];
		} else if (scope.parent != undefined) {
			return DataScope.getVariable(scope.parent, name);
		}

		return undefined;
	}

	// static getFunction(scope: PlagueScope, name: string): any {
	// 	if (scope.functions[name] != undefined) {
	// 		return scope.functions[name];
	// 	} else if (scope.parent != undefined) {
	// 		return PlagueScope.getFunction(scope.parent, name);
	// 	}

	// 	return undefined;
	// }

	variables: Partial<Record<string, DataValue>> = {};
	variable_modes: Partial<Record<string, VariableOptions>> = {};

	// functions: Partial<Record<string, any>> = {};

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
