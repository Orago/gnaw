// import { VecUtility } from "../language.js";
// import { SeparatorTokenType, TokenType } from "../../../lib/tokens.js";
// import {
// 	LanguageHandler,
// 	LanguageHook,
// 	type HandlerContext,
// } from "./utility/handlers.js";

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
	variables: Partial<Record<string, VariableLike>> = {
		orago: {
			type: VariableType.STRING,
			value: "meow",
		},
	};

	constructor() {
		super("variables");

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

	private getName(ctx: HandlerContext): string | false {
		const capture = VecUtility.captureVec(ctx.language, ctx.iterator);

		if (capture[1] == 0 || capture[0].length != 1) {
			ctx.language.error("Invalid thingymadingy");
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

	handleValue(ctx: HandlerContext): VariableLike | false {
		if (
			ctx.iterator.disposeIf(
				"is",
				(token) =>
					token.type == TokenType.IDENTIFIER && token.value == "ref"
			)
		) {
			const variable_name = this.getName(ctx);

			if (variable_name == false) {
				return false;
			}

			return {
				type: VariableType.IDENTIFIER,
				value: variable_name,
			};
		} else if (
			ctx.iterator.disposeIf(
				"is",
				(token) =>
					token.type == TokenType.IDENTIFIER && token.value == "var"
			)
		) {
			const variable_name = this.getName(ctx);

			if (variable_name == false) {
				return false;
			}

			return this.unwrapVariable(variable_name);
		}

		return false;
	}

	handleLineRun(ctx: HandlerContext): void {
		const { language, iterator } = ctx;
		const variable_name = iterator.advance();

		if (variable_name?.value?.type != TokenType.IDENTIFIER) {
			language.error("Required identifier");
			return;
		}

		let variable: VariableLike = {
			type: VariableType.ANY,
			value: "",
		} as any;

		if (iterator.disposeIf("is", TokenType.COLON)) {
			language.error("Variables with types aren't handled yet");
			return;
		}

		if (iterator.disposeIf("is", TokenType.EQUAL)) {
		} else {
			language.error(`VAR(${variable_name.value.value}), Missing =`);
			return;
		}

		const got = language.expectValue(iterator);

		if (variable.type != VariableType.ANY && got.type != variable.type) {
			language.error("Variable type mismatch");
			return;
		}

		this.variables[variable_name.value.value] = got;

		const next = iterator.advance()?.value;

		if ((next?.type == TokenType.SEMICOLON) != true) {
			language.error("Missing variable ender");
			return;
		}
	}
}

export class LanguageHandler_Events extends LanguageHandler {
	variables: Partial<Record<string, VariableLike>> = {
		orago: {
			type: VariableType.STRING,
			value: "meow",
		},
	};

	constructor() {
		super("event_handling");

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
