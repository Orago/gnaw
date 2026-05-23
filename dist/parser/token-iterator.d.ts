import { TokenType, type AnyToken } from "./tokens.js";
interface IterableOptions {
    tracking?: boolean;
    max?: number;
}
export type IterableCheck<T extends AnyToken = AnyToken> = TokenType | TokenType[] | ((value: T) => boolean) | RegExp;
export default class TokenIterator<T extends AnyToken = AnyToken> {
    settings: IterableOptions;
    readonly stack: T[];
    items: (T | undefined)[];
    offset: number;
    log_count: number;
    constructor(items: T[], settings?: IterableOptions);
    remainingItems(): (T | undefined)[];
    [Symbol.iterator](): Generator<string | number, void, unknown>;
    consumer(): Generator<string | number, void, unknown>;
    isDone(offset?: number): boolean;
    advance(amount?: number): import("./tokens.js").EOFToken | T;
    next(): import("./tokens.js").EOFToken | T;
    peek(amount?: number): import("./tokens.js").EOFToken | T;
    clone(): TokenIterator<T>;
    injectAfter(inject_items: (T | undefined)[], after_position: number): void;
    match(check: IterableCheck<T>, n?: number): boolean;
    disposeIf(check: IterableCheck<T>, n?: number): boolean;
    disposeNot(check: IterableCheck<T>, n?: number): boolean;
    expect(check: IterableCheck<T>): import("./tokens.js").EOFToken | T;
    expectResult<T extends TokenType>(check: T, or?: () => AnyToken & {
        type: T;
    }): AnyToken & {
        type: T;
    };
    last(n?: number): T | undefined;
    select(mode: "used" | "remaining"): (T | undefined)[];
    until(check: IterableCheck<T>, callback: (iterator: TokenIterator) => void): void;
    collectUntil<I>(check: IterableCheck<T>, callback: (iterator: TokenIterator) => I): I[];
}
export {};
