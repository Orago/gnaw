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
// I did not know what else to name this file
// it's generally just for quick preset schemas
import { TokenType } from "./tokens.js";
import { TypeCasts } from "../shared/casts.js";
import { StatementParser } from "./statements.js";
export var ParserQuick = /*#__PURE__*/ function() {
    "use strict";
    function ParserQuick() {
        _class_call_check(this, ParserQuick);
    }
    _create_class(ParserQuick, null, [
        {
            key: "parseBlock",
            value: function parseBlock(ctx, collect) {
                var left = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : TokenType.BRACE_LEFT, right = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : TokenType.BRACE_RIGHT;
                var iterator = ctx.iterator;
                iterator.expect(left);
                var items = [];
                while(!iterator.isDone() && iterator.peek().type !== right){
                    items.push(collect());
                }
                iterator.expect(right);
                return items;
            }
        },
        {
            key: "parseStatementBlock",
            value: function parseStatementBlock(ctx) {
                return ParserQuick.parseBlock(ctx, function() {
                    return StatementParser.parse(ctx);
                });
            }
        },
        {
            key: "parseParameters",
            value: function parseParameters(ctx) {
                var left = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : TokenType.PAREN_LEFT, right = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : TokenType.PAREN_RIGHT;
                var iterator = ctx.iterator;
                iterator.expect(left);
                var params = [];
                while(iterator.peek().type !== right){
                    var parameter = {
                        name: iterator.expectResult(TokenType.IDENTIFIER).value
                    };
                    if (iterator.disposeIf(TokenType.COLON)) {
                        if (iterator.disposeIf(TokenType.EXCLAMATION)) {
                            parameter.expect = true;
                        }
                        var type_name = iterator.expectResult(TokenType.IDENTIFIER).value;
                        var type = TypeCasts.getCastType(type_name);
                        parameter.type = type;
                    }
                    params.push(parameter);
                    iterator.disposeIf(TokenType.COMMA);
                }
                iterator.expect(right);
                return params;
            }
        }
    ]);
    return ParserQuick;
}();
