import type { PlaguePlugin } from "./plugin-utility.js";
import { DataValue } from "./variables.js";

export class PlagueSystem {
	plugins: PlaguePlugin[];
}

export class PlagueEnvironment {
	root_scope = new PlagueScope(this);

	constructor(public system: PlagueSystem) {}
}

export class PlagueScope {
	static getVariable(
		scope: PlagueScope,
		name: string
	): DataValue | undefined {
		if (scope.variables[name] != undefined) {
			return scope.variables[name];
		} else if (scope.parent != undefined) {
			return PlagueScope.getVariable(scope.parent, name);
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
	// functions: Partial<Record<string, any>> = {};

	constructor(
		public environment: PlagueEnvironment,
		public parent?: PlagueScope
	) {}

	extend() {
		return new PlagueScope(this.environment, this);
	}

	get(name: string) {
		return PlagueScope.getVariable(this, name);
	}

	set(name: string, value: DataValue) {
		this.variables[name] = value;
	}
}
