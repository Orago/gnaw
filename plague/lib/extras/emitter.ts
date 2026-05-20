type EmitterEvents = Record<string, (...args: any[]) => any>;
type Evt<K, Strict extends boolean> = Strict extends true
	? keyof K | "*"
	: keyof K | "*" | (string & {});
type CallbackListen<T, K> = K extends keyof T ? T[K] : Function;
type CallbackEmit<T extends EmitterEvents, K> = K extends keyof T
	? Parameters<T[K]>
	: any[];
class Emitter<
	T extends EmitterEvents & {} = {},
	Strict extends boolean = false
> {
	declare Type: T;

	public readonly all: Map<Evt<T, Strict>, Function[]> = new Map();

	constructor(all?: any[] | Map<any, any>) {
		if (all instanceof Map) {
			this.all = all;
		} else if (Array.isArray(all)) {
			this.all = new Map(all);
		}
	}

	/** Adds a listener */
	public on<K extends Evt<T, Strict>>(
		event: K,
		callback: CallbackListen<T, K>
	): this {
		const handlers = this.all.get(event);

		if (handlers) {
			handlers.push(callback);
		} else {
			this.all.set(event, [callback]);
		}

		return this;
	}

	/** Disables a listener */
	public off<K extends Evt<T, Strict>>(
		event: K,
		callback?: CallbackListen<T, K>
	): this {
		const handlers = this.all.get(event);

		if (handlers) {
			if (callback) {
				const index = handlers.indexOf(callback);

				if (index !== -1) {
					handlers.splice(index, 1);
				}
			} else {
				this.all.set(event, []);
			}
		}

		return this;
	}

	/** Notifies all active listeners */
	public emit<K extends Evt<T, Strict>>(
		event: K,
		...args: CallbackEmit<T, K>
	): this {
		let handlers = this.all.get(event);

		if (handlers != undefined) {
			for (const handler of handlers.slice()) {
				handler(...args);
			}
		}

		if ((handlers = this.all.get("*")) != undefined) {
			for (const handler of handlers.slice()) {
				handler(event, ...args);
			}
		}
		return this;
	}

	public once<K extends Evt<T, Strict>>(
		event: K,
		callback: CallbackListen<T, K>
	): this {
		const once_callback: any = (...args: any[]) => {
			this.off(event, once_callback);
			callback(...args);

			return void 0;
		};

		this.on(event, once_callback);

		return this;
	}

	*[Symbol.iterator]() {
		for (const entry of this.all.entries()) {
			yield entry;
		}
	}
}

class Signal<T extends (...args: any[]) => any = () => void> {
	all: Set<Function> = new Set();

	constructor(all?: any[] | Set<Function>) {
		if (all instanceof Set) {
			this.all = all;
		} else if (Array.isArray(all)) {
			this.all = new Set(all);
		}
	}

	/** Adds a listener */
	public on(callback: T): this {
		this.all.add(callback);

		return this;
	}

	/** Disables a listener */
	public off(callback: T): this {
		this.all.delete(callback);

		return this;
	}

	/** Notifies all active listeners */
	public emit(...args: Parameters<T>): this {
		let handlers = Array.from(this.all.values());

		for (const handler of handlers.slice()) {
			handler(...args);
		}
		return this;
	}

	public once(callback: T): this {
		const once_callback: any = (...args: any[]) => {
			this.off(once_callback);
			callback(...args);
			return void 0;
		};

		this.on(once_callback);

		return this;
	}
}

class DebouncedSignal<T extends (...args: any[]) => any> extends Signal<T> {
	private timer: ReturnType<typeof setTimeout> | null = null;

	/**
	 *
	 * @param delay - milliseconds
	 */
	constructor(public delay: number) {
		super();
	}

	forceEmit(...args: Parameters<T>): this {
		return super.emit(...args);
	}

	emit(...args: Parameters<T>): this {
		if (this.timer !== null) {
			clearTimeout(this.timer);
		}

		this.timer = setTimeout(() => {
			super.emit(...args);
			this.timer = null;
		}, this.delay);
		return this;
	}

	cancel() {
		if (this.timer !== null) {
			clearTimeout(this.timer);
			this.timer = null;
		}
	}
}

class State<T> {
	public readonly change = new Signal<(value: T, old_value: T) => void>();

	constructor(private _value: T) {}

	protected shouldUpdate(value: T): boolean {
		return this._value !== value;
	}

	protected transform<IN = any>(value: IN): T {
		return value as unknown as T;
	}

	public get(): T {
		return this._value;
	}

	public set(next: T) {
		const value = this.transform(next);

		if (this.shouldUpdate(value)) {
			const old_value = this._value;
			this._value = value;
			this.change.emit(this._value, old_value);
		}
	}

	public value(): T;
	public value(value: T): this;
	public value(...args: [T?]) {
		if (args.length === 0) {
			return this._value;
		} else {
			this.set(args[0]!);
			return this;
		}
	}
}

export { Emitter as default, Emitter, Signal, DebouncedSignal, State };
export type { EmitterEvents, Evt, CallbackListen, CallbackEmit };
