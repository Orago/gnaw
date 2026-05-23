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
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
import { TokenGroup, TokenType } from "./tokens.js";
import { TypeCasts } from "../shared/casts.js";
import { BinaryMethod, ExpressionType, LogicPriority } from "../shared/enums.js";
import { Ast } from "./ast.js";
export var MathExpressionParser = /*#__PURE__*/ function() {
    "use strict";
    function MathExpressionParser() {
        _class_call_check(this, MathExpressionParser);
    }
    _create_class(MathExpressionParser, null, [
        {
            key: "handleInfix",
            value: function handleInfix(ctx, left, p) {
                var iterator = ctx.iterator;
                while(!iterator.isDone()){
                    var peek = iterator.peek();
                    var op = MathExpressionParser.binary_method_dict[peek.type];
                    if (op == null) break;
                    var priority = MathExpressionParser.PRIORITY[op];
                    if (priority == null) break;
                    if (priority <= p) break;
                    iterator.next();
                    var right = ExpressionParser.parse(ctx, priority);
                    left = Ast.Binary(left, op, right);
                }
                return left;
            }
        }
    ]);
    return MathExpressionParser;
}();
var _obj;
_define_property(MathExpressionParser, "PRIORITY", (_obj = {}, _define_property(_obj, BinaryMethod.ASSIGN, LogicPriority.ASSIGN), _define_property(_obj, BinaryMethod.OR, LogicPriority.OR), _define_property(_obj, BinaryMethod.AND, LogicPriority.AND), _define_property(_obj, BinaryMethod.IS, LogicPriority.EQUALITY), _define_property(_obj, BinaryMethod.NOT, LogicPriority.EQUALITY), _define_property(_obj, BinaryMethod.LESS_THAN, LogicPriority.COMPARE), _define_property(_obj, BinaryMethod.GREATER_THAN, LogicPriority.COMPARE), _define_property(_obj, BinaryMethod.ADD, LogicPriority.TERM), _define_property(_obj, BinaryMethod.SUBTRACT, LogicPriority.TERM), _define_property(_obj, BinaryMethod.MULTIPLY, LogicPriority.FACTOR), _define_property(_obj, BinaryMethod.DIVIDE, LogicPriority.FACTOR), _define_property(_obj, BinaryMethod.DOT, LogicPriority.MEMBER), _obj));
var _obj1;
_define_property(MathExpressionParser, "binary_method_dict", (_obj1 = {}, _define_property(_obj1, TokenType.PLUS, BinaryMethod.ADD), _define_property(_obj1, TokenType.MINUS, BinaryMethod.SUBTRACT), _define_property(_obj1, TokenType.STAR, BinaryMethod.MULTIPLY), _define_property(_obj1, TokenType.SLASH, BinaryMethod.DIVIDE), _define_property(_obj1, TokenType.IS, BinaryMethod.IS), _define_property(_obj1, TokenType.NOT, BinaryMethod.NOT), _define_property(_obj1, TokenType.GREATER_THAN, BinaryMethod.GREATER_THAN), _define_property(_obj1, TokenType.LESS_THAN, BinaryMethod.LESS_THAN), _obj1));
export var ExpressionParser = /*#__PURE__*/ function() {
    "use strict";
    function ExpressionParser() {
        _class_call_check(this, ExpressionParser);
    }
    _create_class(ExpressionParser, null, [
        {
            key: "parse",
            value: /* parse expression object */ function parse(ctx) {
                var p = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : LogicPriority.LOWEST;
                var iterator = ctx.iterator;
                var target = ExpressionParser.parseBinary(ctx, p);
                if (iterator.disposeIf(TokenType.EQUAL)) {
                    // right association (cascade)
                    var value = ExpressionParser.parse(ctx);
                    if (target.type !== ExpressionType.IDENTIFIER && target.type !== ExpressionType.MEMBER_ACCESS) {
                        throw new Error("Invalid assignment type");
                    }
                    return Ast.Assign(target, value);
                }
                return target;
            }
        },
        {
            key: "parseBinary",
            value: function parseBinary(ctx) {
                var p = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : LogicPriority.LOWEST;
                var iterator = ctx.iterator;
                iterator.disposeIf(TokenType.COMMENT);
                var left = ExpressionParser.parsePrimary(ctx);
                left = MathExpressionParser.handleInfix(ctx, left, p);
                // impl
                while(iterator.disposeIf(TokenType.COLON)){
                    var name = iterator.expectResult(TokenType.IDENTIFIER).value;
                    var args = ExpressionParser.parseParameterValues(ctx);
                    left = Ast.Impl(left, name, args);
                }
                return left;
            }
        },
        {
            key: "parseParameterValues",
            value: function parseParameterValues(ctx) {
                var left = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : TokenType.PAREN_LEFT, right = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : TokenType.PAREN_RIGHT;
                var iterator = ctx.iterator;
                iterator.expect(left);
                var args = [];
                while(iterator.peek().type !== right){
                    args.push(ExpressionParser.parse(ctx));
                    iterator.disposeIf(TokenType.COMMA);
                }
                iterator.expect(right);
                return args;
            }
        },
        {
            key: "parsePrimary",
            value: function parsePrimary(ctx) {
                var iterator = ctx.iterator;
                var t = iterator.next();
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = ctx.system.expression_handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var handler = _step.value;
                        if (handler.case(t) != true) {
                            continue;
                        }
                        return handler.create(ctx);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                switch(t.type){
                    case TokenType.NUMBER:
                        {
                            if (t.group == TokenGroup.BOOLEAN) {
                                return Ast.Boolean(!!t.value);
                            } else {
                                return Ast.Number(t.value);
                            }
                        }
                    case TokenType.STRING:
                        return Ast.String(t.value);
                    case TokenType.MINUS:
                        return Ast.Unary(BinaryMethod.SUBTRACT, ExpressionParser.parse(ctx, LogicPriority.UNARY));
                    case TokenType.EXCLAMATION:
                        return Ast.Unary(BinaryMethod.EXCLAMATION, ExpressionParser.parse(ctx, LogicPriority.UNARY));
                    case TokenType.IDENTIFIER:
                        {
                            var expression = Ast.Identifier(t.value);
                            if (expression.name == "Type") {
                                iterator.expect(TokenType.COLON);
                                var type_name = iterator.expectResult(TokenType.IDENTIFIER).value;
                                var type = TypeCasts.getCastType(type_name);
                                return Ast.TypeRef(type);
                            }
                            while(true){
                                var next = iterator.peek();
                                // invoking
                                if (next.type === TokenType.PAREN_LEFT) {
                                    var args = ExpressionParser.parseParameterValues(ctx);
                                    expression = Ast.InvokeCall(expression, args);
                                    continue;
                                }
                                // member handling
                                if (iterator.disposeIf(TokenType.DOT)) {
                                    var next1 = iterator.peek();
                                    var property = void 0;
                                    if (next1.type === TokenType.BRACKET_LEFT) {
                                        iterator.next();
                                        property = ExpressionParser.parse(ctx);
                                        iterator.expect(TokenType.BRACKET_RIGHT);
                                    } else if (next1.type === TokenType.IDENTIFIER || next1.type === TokenType.STRING) {
                                        var t1 = iterator.next();
                                        property = Ast.String(t1.value);
                                    } else if (next1.type === TokenType.NUMBER) {
                                        var t2 = iterator.next();
                                        property = Ast.Number(t2.value);
                                    } else {
                                        throw new Error("Expected property after '.'");
                                    }
                                    expression = Ast.Member(expression, property);
                                    continue;
                                }
                                break;
                            }
                            return expression;
                        }
                    case TokenType.PAREN_LEFT:
                        {
                            var expr = ExpressionParser.parse(ctx);
                            iterator.expect(TokenType.PAREN_RIGHT);
                            return expr;
                        }
                }
                console.log(">>>", iterator.remainingItems().slice(0, iterator.log_count), [
                    t
                ]);
                throw new Error("^^^ Unexpected token in parser ".concat(t.type));
            }
        }
    ]);
    return ExpressionParser;
}();
