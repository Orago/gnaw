import { AnyToken, TokenType } from "./tokens.js";
export interface LanguageDictionary extends Record<string, string[]> {
    brace_left: string[];
    brace_right: string[];
    bracket_left: string[];
    bracket_right: string[];
    parenthesis_left: string[];
    parenthesis_right: string[];
    plus: string[];
    minus: string[];
    star: string[];
    slash: string[];
    equals: string[];
    greater_than: string[];
    less_than: string[];
    exclamation: string[];
    hashtag: string[];
    is: string[];
    not: string[];
    cast: string[];
    comma: string[];
    dot: string[];
    colon: string[];
    semicolon: string[];
    newline: string[];
    indent: string[];
    question_mark: string[];
    boolean_true: string[];
    boolean_false: string[];
    operators: string[];
    delimiters: string[];
}
export declare const default_language_dicitionary: LanguageDictionary;
export declare class Lexer {
    static lex(input: string): RegExpMatchArray;
    static chunk(lexed: string[], options?: {
        line_end?: string | string[];
    }): string[][];
    private static _parseOperator;
    private static _parsePunctuation;
    private static _parseDelimiter;
    static parseToken(lexed: string[], value: string, index: number, level: number, keywords: LanguageDictionary): {
        token: AnyToken;
        level: number;
        index: number;
    };
    static tokenize(lexed: string[], options: {
        keywords?: LanguageDictionary;
    }): AnyToken[];
    static including(list: AnyToken[], include: TokenType[]): AnyToken[];
    static excluding(list: AnyToken[], exclude: TokenType[]): AnyToken[];
}
