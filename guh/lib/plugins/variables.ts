import { SeparatorTokenType, TokenType } from "../tokens.js";
import {
	LanguageHandler,
	LanguageHook,
	type HandlerBlob,
} from "../utility/handlers.js";

export enum VariableType {
	NULL = "null",
	ANY = "any",
	NUMBER = "number",
	STRING = "string",
	OBJECT = "object",
	ARRAY = "array",
	REFERENCE = "reference",
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
			type: VariableType.REFERENCE;
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
				return ref.iterator.dispose(
					"if",
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

		if (got.type == VariableType.REFERENCE) {
			return this.unwrapVariable(got.value);
		} else {
			return got;
		}
	}

	private getName(blob: HandlerBlob): string | false {
		if (
			blob.iterator.dispose("if", (token) => token.value == "(") != true
		) {
			return false;
		}
		const name = blob.iterator.next();

		if (
			name.value?.type != TokenType.IDENTIFIER &&
			name.value?.type != TokenType.STRING &&
			name.value?.type != TokenType.NUMBER
		) {
			blob.language.error("Invalid identifier");
			return false;
		} else if (
			blob.iterator.dispose("if", (token) => token.value == ")") != true
		) {
			blob.language.error("Invalid closer");
			return false;
		}

		return String(name.value.value);
	}

	handleValue(blob: HandlerBlob): VariableLike | false {
		if (
			blob.iterator.dispose(
				"if",
				(token) =>
					token.type == TokenType.IDENTIFIER && token.value == "ref"
			)
		) {
			const variable_name = this.getName(blob);

			if (variable_name == false) {
				return false;
			}

			return {
				type: VariableType.REFERENCE,
				value: variable_name,
			};
		} else if (
			blob.iterator.dispose(
				"if",
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

	handleLineRun({ language, iterator: line }: HandlerBlob): void {
		console.log(
			"vna",
			line.items.slice(line.offset, line.offset + 5),
			line.peek()
		);
		const variable_name = line.next();

		if (variable_name?.value?.type != TokenType.IDENTIFIER) {
			language.error("Required identifier");
			return;
		}

		let variable: VariableLike = {
			type: VariableType.ANY,
			value: "",
		} as any;

		if (
			line.dispose(
				"if",
				(token) =>
					token.type == TokenType.OPERATOR && token.value == ":"
			)
		) {
			language.error("Variables with types aren't handled yet");
			return;
		}

		if (
			line.dispose(
				"if",
				(token) =>
					token.type == TokenType.IDENTIFIER && token.value == "="
			)
		) {
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

		if (
			(next?.type == TokenType.SEPARATOR &&
				next.subset == SeparatorTokenType.LINE_END) != true
		) {
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
				return ref.iterator.dispose(
					"if",
					(token) =>
						token.type == TokenType.IDENTIFIER &&
						token.value == "on"
				);
			},
			run: (ref) => this.handleLineRun(ref),
		});
	}

	handleLineRun({ language, iterator: line }: HandlerBlob): void {
		console.log("handling, events", line.select("remaining"));
	}
}
