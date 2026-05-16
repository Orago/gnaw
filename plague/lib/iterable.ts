import { AnyToken, TokenType } from "./tokens.js";

interface IterableOptions {
	tracking?: boolean;
	/**
	 * Max stack
	 */
	max?: number;
}

type IterableCheck<T extends AnyToken> =
	// | string
	TokenType | ((value: T) => boolean) | RegExp;

export default class TokenIterator<T extends AnyToken = AnyToken> {
	readonly stack: T[] = [];
	// public items: T[];
	offset: number = 0;

	constructor(public items: T[], public settings: IterableOptions = {}) {
		this.items = [...items];
	}

	*[Symbol.iterator]() {
		let found = this.peek();
		while (true) {
			found = this.next();
			if (found.done) {
				break;
			} else {
				yield found.value!;
			}
		}
	}

	*consumer() {
		let found = this.peek();
		while (true) {
			found = this.next();
			if (found.done) {
				break;
			} else {
				yield found.value!;
			}
		}
	}

	next(amount: number = 1) {
		for (let i = 0; i < amount - 1; i++) {
			this.offset++;
		}

		return {
			value: this.items[this.offset++],
			done: 1 > this.items.length - this.offset,
		};
	}

	peek(amount = 1) {
		return {
			value: this.items[amount + this.offset - 1] as AnyToken | undefined,
			done: 1 > this.items.length - this.offset,
		};
	}

	clone() {
		return new TokenIterator(this.items, this.settings);
	}

	match(check: IterableCheck<T>, n = 1) {
		const item = this.items[n + this.offset - 1];

		if (item == undefined) {
			return false;
		}

		if (item.type == check) {
			return true;
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
			this.next(n - 1);
		}

		return status;
	}

	last(n = 1) {
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
}
