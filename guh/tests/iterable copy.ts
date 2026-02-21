interface IterableOptions {
	tracking?: boolean;
	/**
	 * Max stack
	 */
	max?: number;
}

type IterableCheck = string | ((value: any) => boolean) | RegExp;

export default class BetterIterator {
	readonly stack: string[] = [];
	public items: string[];

	constructor(
		items: BetterIterator["items"],
		public settings: IterableOptions = {}
	) {
		this.items = [...items];
	}

	*[Symbol.iterator]() {
		while (this.items.length > 0) {
			yield this.next().value;
		}
	}

	next(amount: number = 0) {
		const { items } = this;

		for (let i = 0; i < amount; i++) {
			items.shift();
		}

		if (this.settings?.tracking == true && this.settings.max != undefined) {
			this.stack.push(items[0]);

			if (this.stack.length > this.settings.max) {
				this.stack.shift();
			}
		}

		return {
			value: items.shift(),
			done: 1 > items.length,
		};
	}

	peek = (amount = 1) => ({
		value: this.items[amount - 1],
		done: 1 > this.items.length,
	});

	clone() {
		return new BetterIterator(this.items, this.settings);
	}

	test(check: IterableCheck, n = 1) {
		const item = this.items[n - 1];

		return (
			(check instanceof Function && check(item) === true) ||
			(check instanceof RegExp &&
				typeof item == "string" &&
				check.test(item)) ||
			check == item
		);
	}

	disposeIf(check: IterableCheck, n = 1) {
		const status = this.test(check, n);

		if (status) this.next(n - 1);

		return status;
	}

	disposeIfNot(check: IterableCheck, n = 1) {
		const status = this.test(check, n);

		if (!status) this.next(n - 1);

		return status;
	}

	stringify(join = " ") {
		return this.items.join(join);
	}

	last(n = 0) {
		return this.stack[this.stack.length - 1 - n];
	}
}
