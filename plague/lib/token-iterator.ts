import { EOFToken, TokenType, type AnyToken } from "./tokens.js";

interface IterableOptions {
	tracking?: boolean;
	/** Max stack */
	max?: number;
}

export type IterableCheck<T extends AnyToken = AnyToken> =
	// | string
	TokenType | TokenType[] | ((value: T) => boolean) | RegExp;

export default class TokenIterator<T extends AnyToken = AnyToken> {
	readonly stack: T[] = [];
	public items: (T | undefined)[];
	offset: number = 0;
	log_count: number = 10;

	constructor(items: T[], public settings: IterableOptions = {}) {
		this.items = [...items];
	}

	remainingItems() {
		return this.items.slice(this.offset);
	}

	*[Symbol.iterator]() {
		let found = this.peek();
		while (true) {
			found = this.advance();
			if (found.type == TokenType.EOF) {
				break;
			} else {
				yield found.value!;
			}
		}
	}

	*consumer() {
		let found = this.peek();
		while (true) {
			found = this.advance();
			if (found.type == TokenType.EOF) {
				break;
			} else {
				yield found.value!;
			}
		}
	}

	isDone(offset: number = 0) {
		return 1 > this.items.length - this.offset - offset;
	}

	advance(amount: number = 1) {
		const result = this.peek(amount - 1);
		this.offset += amount;
		return result;
	}

	next() {
		return this.advance(1);
	}

	peek(amount: number = 0) {
		const eof = { type: TokenType.EOF } as EOFToken;
		return this.items[amount + this.offset] || eof;
	}

	clone() {
		const iter = new TokenIterator(this.items as T[], this.settings);
		iter.offset = this.offset;
		return iter;
	}

	match(check: IterableCheck<T>, n = 1) {
		const item = this.peek(n - 1);

		if (item == undefined || item.type == TokenType.EOF) {
			return false;
		} else if (item.type == check) {
			return true;
		} else if (Array.isArray(check)) {
			return check.some((check) => item.value == check);
		}

		switch (typeof check) {
			case "function":
				return check(item) == true;
			case "string":
				return item.value == check;
		}

		if (check instanceof RegExp && check.test(item.value.toString())) {
			return true;
		}

		return false;
	}

	disposeIf(mode: "is" | "not", check: IterableCheck<T>, n = 1) {
		const status = this.match(check, n);

		if (
			(mode == "is" && status == true) ||
			(mode == "not" && status == false)
		) {
			this.advance(n);
		}

		return status;
	}

	expect(check: IterableCheck<T>) {
		const status = this.match(check, 1);

		if (status == true) {
			return this.advance(1);
		}

		console.log(
			">>>",
			this.remainingItems().slice(0, this.log_count)
		);
		throw new Error(`^^^ Expected token match for (${check}) and failed`);
	}
	expectResult<T extends TokenType>(check: T): AnyToken & { type: T } {
		const status = this.match(check, 1);

		if (status == true) {
			return this.advance(1) as any;
		}
		console.log(
			">>>",
			this.remainingItems().slice(0, this.log_count)
		);
		throw new Error(`Expected token id (${check}) and failed`);
	}

	last(n: number = 0) {
		return this.items[this.offset - n];
	}

	select(mode: "used" | "remaining") {
		switch (mode) {
			case "remaining":
				return this.items.slice(this.offset);
			case "used":
				return this.items.slice(0, this.offset);
		}
	}
	until<I>(
		check: IterableCheck<T>,
		callback: (iterator: TokenIterator) => void
	): void {
		while (this.match(check) != true) {
			callback(this);
		}
		this.expect(check);
	}

	collectUntil<I>(
		check: IterableCheck<T>,
		callback: (iterator: TokenIterator) => I
	): I[] {
		const collected: I[] = [];
		while (this.match(check) != true) {
			collected.push(callback(this));
		}
		return collected;
	}
}
