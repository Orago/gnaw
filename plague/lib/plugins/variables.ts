import { VecUtility } from "../language.js";
import { SeparatorTokenType, TokenType } from "../tokens.js";
import {
	LanguageHandler,
	LanguageHook,
	type HandlerContext,
} from "../utility/handlers.js";

export enum VariableType {
	NULL = "null",
	ANY = "any",
	NUMBER = "number",
	STRING = "string",
	OBJECT = "object",
	ARRAY = "array",
	IDENTIFIER = "identifier",
	CUSTOM = "custom",
}

export type VariableLike =
	| {
			type: VariableType.NULL;
			value: 0;
	  }
	| { type: VariableType.ANY; value: string }
	| {
			type: VariableType.STRING;
			value: string;
	  }
	| { type: VariableType.NUMBER; value: number }
	| {
			type: VariableType.ARRAY;
			value: VariableLike[];
	  }
	| {
			type: VariableType.OBJECT;
			value: Record<string, VariableLike>;
	  }
	| {
			type: VariableType.IDENTIFIER;
			// variable id
			value: string;
	  }
	| {
			type: VariableType.CUSTOM;
			id: any;
			value: any;
	  };

export class LanguageHandler_Variables extends LanguageHandler {
	id = "variables";
	variables: Partial<Record<string, VariableLike>> = {
		orago: {
			type: VariableType.STRING,
			value: "meow",
		},
	};

	constructor() {
		super();

		this.line_hooks.push({
			test: (ref) => {
				return ref.iterator.disposeIf(
					"is",
					(token) =>
						token.type == TokenType.IDENTIFIER &&
						token.value == "var"
				);
			},
			run: (ref) => this.handleLineRun(ref),
		});
	}

	private getNull(): VariableLike {
		return {
			type: VariableType.NULL,
			value: 0,
		};
	}

	private unwrapVariable(name: string): VariableLike {
		let got = this.variables[name] ?? this.getNull();

		if (got.type == VariableType.IDENTIFIER) {
			return this.unwrapVariable(got.value);
		} else {
			return got;
		}
	}

	private getName(blob: HandlerContext): string | false {
		const capture = VecUtility.captureVec(blob.language, blob.iterator);

		if (capture[1] == 0 || capture[0].length != 1) {
			blob.language.error("Invalid thingymadingy");
			return false;
		}

		const variable_like = capture[0][0];

		if (
			variable_like.type == VariableType.IDENTIFIER ||
			variable_like.type == VariableType.STRING ||
			variable_like.type == VariableType.NUMBER
		) {
			return String(variable_like.value);
		}

		return false;
	}

	handleValue(blob: HandlerContext): VariableLike | false {
		if (
			blob.iterator.disposeIf(
				"is",
				(token) =>
					token.type == TokenType.IDENTIFIER && token.value == "ref"
			)
		) {
			const variable_name = this.getName(blob);

			if (variable_name == false) {
				return false;
			}

			return {
				type: VariableType.IDENTIFIER,
				value: variable_name,
			};
		} else if (
			blob.iterator.disposeIf(
				"is",
				(token) =>
					token.type == TokenType.IDENTIFIER && token.value == "var"
			)
		) {
			const variable_name = this.getName(blob);

			if (variable_name == false) {
				return false;
			}

			return this.unwrapVariable(variable_name);
		}

		return false;
	}

	handleLineRun({ language, iterator: line }: HandlerContext): void {
		const variable_name = line.next();

		if (variable_name?.value?.type != TokenType.IDENTIFIER) {
			language.error("Required identifier");
			return;
		}

		let variable: VariableLike = {
			type: VariableType.ANY,
			value: "",
		} as any;

		if (line.disposeIf("is", TokenType.COLON)) {
			language.error("Variables with types aren't handled yet");
			return;
		}

		if (line.disposeIf("is", TokenType.EQUAL)) {
		} else {
			language.error(`VAR(${variable_name.value.value}), Missing =`);
			return;
		}

		const got = language.expectValue(line);

		if (variable.type != VariableType.ANY && got.type != variable.type) {
			language.error("Variable type mismatch");
			return;
		}

		this.variables[variable_name.value.value] = got;

		const next = line.next()?.value;

		if ((next?.type == TokenType.SEMICOLON) != true) {
			language.error("Missing variable ender");
			return;
		}
	}
}

export class LanguageHandler_Events extends LanguageHandler {
	id = "event_handling";
	variables: Partial<Record<string, VariableLike>> = {
		orago: {
			type: VariableType.STRING,
			value: "meow",
		},
	};

	constructor() {
		super();

		this.line_hooks.push({
			test: (ref) => {
				return ref.iterator.disposeIf(
					"is",
					(token) =>
						token.type == TokenType.IDENTIFIER &&
						token.value == "on"
				);
			},
			run: (ref) => this.handleLineRun(ref),
		});
	}

	handleLineRun({ language, iterator: line }: HandlerContext): void {
		// console.log("handling, events", line.select("remaining"));
	}
}
