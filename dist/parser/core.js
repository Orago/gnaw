function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
import { Lexer } from "./lexer.js";
import TokenIterator from "./token-iterator.js";
import { TokenType } from "./tokens.js";
import { StatementParser } from "./statements.js";
export var Parser = /*#__PURE__*/ function() {
    "use strict";
    function Parser() {
        _class_call_check(this, Parser);
    }
    _create_class(Parser, null, [
        {
            key: "createContext",
            value: function createContext(system, tokens) {
                var iterator = new TokenIterator(tokens);
                return {
                    iterator: iterator,
                    system: system
                };
            }
        },
        {
            key: "parseString",
            value: function parseString(system, script) {
                var lexed = Lexer.lex(script);
                var tokens = Lexer.tokenize(lexed, {
                    keywords: system.keywords
                });
                tokens = Lexer.excluding(tokens, [
                    TokenType.NEWLINE,
                    TokenType.INDENT
                ]);
                return this.parseTokens(system, tokens);
            }
        },
        {
            key: "parseTokens",
            value: function parseTokens(system, tokens) {
                var statements = [];
                var ctx = this.createContext(system, tokens);
                while(ctx.iterator.peek().type != TokenType.EOF){
                    statements.push(StatementParser.parse(ctx));
                }
                return statements;
            }
        }
    ]);
    return Parser;
}();
