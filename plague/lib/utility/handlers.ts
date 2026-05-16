import type TokenIterator from "../iterable.js";
import type { Language } from "../language.js";
import type { VariableLike } from "../plugins/variables.js";

export interface HandlerContext {
	language: Language;
	iterator: TokenIterator;
}

export interface LanguageHook {
	/** Runs every line if set */
	test(blob: HandlerContext): boolean;
	run(blob: HandlerContext): void;
}
export abstract class LanguageHandler {
	abstract id: string;
	declare identifier_hook?: string[];

	line_hooks: LanguageHook[] = [];

	/** Unused */
	handleIdentifier?(blob: HandlerContext): VariableLike | false;

	/** Takes place of variables */
	handleValue?(blob: HandlerContext): VariableLike | false;

	/** Unused */
	/** Runs every line if set */
	// handleLineTest?(blob: HandlerBlob): boolean;
	// handleLineRun?(blob: HandlerBlob): void;
}

export class LanguageHandlerList {
	private record: Partial<Record<string, LanguageHandler>> = {};
	private array: LanguageHandler[] = [];

	inject(handlers: LanguageHandler[]) {
		for (const handler of handlers) {
			this.record[handler.id] = handler;
		}
		this.array = Object.values(this.record) as LanguageHandler[];
	}

	get(id: string) {
		return this.record[id];
	}

	getArray() {
		return this.array;
	}
}
