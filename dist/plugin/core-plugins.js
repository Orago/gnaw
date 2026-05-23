function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _assert_this_initialized(self) {
    if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
}
function _call_super(_this, derived, args) {
    derived = _get_prototype_of(derived);
    return _possible_constructor_return(_this, _is_native_reflect_construct() ? Reflect.construct(derived, args || [], _get_prototype_of(_this).constructor) : derived.apply(_this, args));
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _construct(Parent, args, Class) {
    if (_is_native_reflect_construct()) {
        _construct = Reflect.construct;
    } else {
        _construct = function construct(Parent, args, Class) {
            var a = [
                null
            ];
            a.push.apply(a, args);
            var Constructor = Function.bind.apply(Parent, a);
            var instance = new Constructor();
            if (Class) _set_prototype_of(instance, Class.prototype);
            return instance;
        };
    }
    return _construct.apply(null, arguments);
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
function _get_prototype_of(o) {
    _get_prototype_of = Object.setPrototypeOf ? Object.getPrototypeOf : function getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _get_prototype_of(o);
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _set_prototype_of(subClass, superClass);
}
function _is_native_function(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _possible_constructor_return(self, call) {
    if (call && (_type_of(call) === "object" || typeof call === "function")) {
        return call;
    }
    return _assert_this_initialized(self);
}
function _set_prototype_of(o, p) {
    _set_prototype_of = Object.setPrototypeOf || function setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _set_prototype_of(o, p);
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function _wrap_native_super(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;
    _wrap_native_super = function wrapNativeSuper(Class) {
        if (Class === null || !_is_native_function(Class)) return Class;
        if (typeof Class !== "function") {
            throw new TypeError("Super expression must either be null or a function");
        }
        if (typeof _cache !== "undefined") {
            if (_cache.has(Class)) return _cache.get(Class);
            _cache.set(Class, Wrapper);
        }
        function Wrapper() {
            return _construct(Class, arguments, _get_prototype_of(this).constructor);
        }
        Wrapper.prototype = Object.create(Class.prototype, {
            constructor: {
                value: Wrapper,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        return _set_prototype_of(Wrapper, Class);
    };
    return _wrap_native_super(Class);
}
function _is_native_reflect_construct() {
    try {
        var result = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
    } catch (_) {}
    return (_is_native_reflect_construct = function() {
        return !!result;
    })();
}
import { TypeCasts } from "../shared/casts.js";
import { ExpressionType, StatementType } from "../shared/enums.js";
import { FunctionUtil, Language } from "../runtime/language.js";
import { Ast, ExpressionParser, ParserQuick, TokenType } from "../parser/index.js";
import { DataType, Var } from "../shared/variables.js";
import { Plugin } from "./plugin-utility.js";
export var VariablePlugin = /*#__PURE__*/ function(Plugin1) {
    "use strict";
    _inherits(VariablePlugin, Plugin1);
    function VariablePlugin() {
        _class_call_check(this, VariablePlugin);
        var _this;
        _this = _call_super(this, VariablePlugin), _define_property(_this, "id", "variable");
        _this.statements = [
            Plugin.statementHandler({
                trim_case: true,
                case: function _case(t) {
                    return t.type == TokenType.IDENTIFIER && t.value == "let";
                },
                createStatement: function createStatement(ctx) {
                    var iterator = ctx.iterator;
                    var name = iterator.expectResult(TokenType.IDENTIFIER).value;
                    iterator.expect(TokenType.EQUAL);
                    var value = ExpressionParser.parse(ctx);
                    return {
                        type: StatementType.VARIABLE,
                        name: name,
                        value: value
                    };
                },
                handleStatement: function handleStatement(statement, scope) {
                    var value = Language.evaluateExpression(statement.value, scope);
                    scope.set(statement.name, value);
                }
            })
        ];
        return _this;
    }
    return VariablePlugin;
}(_wrap_native_super(Plugin));
export var FunctionPlugin = /*#__PURE__*/ function(Plugin1) {
    "use strict";
    _inherits(FunctionPlugin, Plugin1);
    function FunctionPlugin() {
        _class_call_check(this, FunctionPlugin);
        var _this;
        _this = _call_super(this, FunctionPlugin), _define_property(_this, "id", "function");
        _this.expressions = [
            Plugin.expressionHandler({
                case: function _case(t) {
                    return t.type == TokenType.IDENTIFIER && t.value == "fn";
                },
                create: function create(ctx) {
                    var params = ParserQuick.parseParameters(ctx);
                    var body = ParserQuick.parseStatementBlock(ctx);
                    return Ast.Function(params, body);
                },
                test: function test(expression) {
                    return expression.type == ExpressionType.FUNCTION;
                },
                handle: function handle(expression, scope) {
                    return FunctionUtil.createFunction(expression.params, expression.body, scope);
                }
            })
        ];
        _this.statements = [
            Plugin.statementHandler({
                trim_case: true,
                case: function _case(t) {
                    return t.type == TokenType.IDENTIFIER && t.value == "fn";
                },
                createStatement: function createStatement(ctx) {
                    var iterator = ctx.iterator;
                    var name = iterator.expectResult(TokenType.IDENTIFIER).value;
                    var params = ParserQuick.parseParameters(ctx);
                    var body = ParserQuick.parseStatementBlock(ctx);
                    return {
                        type: StatementType.FUNCTION,
                        name: name,
                        params: params,
                        body: body
                    };
                },
                test: function test(statement) {
                    return statement.type == StatementType.FUNCTION;
                },
                handleStatement: function handleStatement(statement, scope) {
                    var fn = FunctionUtil.createFunction(statement.params, statement.body, scope);
                    scope.set(statement.name, fn);
                }
            })
        ];
        return _this;
    }
    return FunctionPlugin;
}(_wrap_native_super(Plugin));
export var ReturnPlugin = /*#__PURE__*/ function(Plugin1) {
    "use strict";
    _inherits(ReturnPlugin, Plugin1);
    function ReturnPlugin() {
        _class_call_check(this, ReturnPlugin);
        var _this;
        _this = _call_super(this, ReturnPlugin), _define_property(_this, "id", "return");
        _this.statements = [
            Plugin.statementHandler({
                trim_case: true,
                case: function _case(t) {
                    return t.type == TokenType.IDENTIFIER && t.value == "return";
                },
                createStatement: function createStatement(ctx) {
                    var iterator = ctx.iterator;
                    if (iterator.peek().type == TokenType.BRACE_RIGHT) {
                        return {
                            type: StatementType.RETURN
                        };
                    } else {
                        var value = ExpressionParser.parse(ctx);
                        if (iterator.match(function(t) {
                            return t.type == TokenType.IDENTIFIER && t.value == "if";
                        })) {
                            iterator.next();
                            var condition = ExpressionParser.parse(ctx);
                            //! disabled placeholder injection because I can't remember why it'd be useful
                            // if (
                            // 	iterator.match(
                            // 		(t) => t.type == TokenType.QUESTION_MARK
                            // 	)
                            // ) {
                            // 	iterator.next();
                            // 	console.log("GOT VALUE", value)
                            // 	condition = Parser.Math.handleInfix(
                            // 		ctx,
                            // 		value,
                            // 		LogicPriority.LOWEST
                            // 	);
                            // } else {
                            // condition = ExpressionParser.parse(ctx);
                            // }
                            return {
                                type: StatementType.IF,
                                condition: condition,
                                body: [
                                    {
                                        type: StatementType.RETURN,
                                        value: value
                                    }
                                ]
                            };
                        }
                        return {
                            type: StatementType.RETURN,
                            value: value
                        };
                    }
                },
                test: function test(statement) {
                    return statement.type == StatementType.RETURN;
                },
                handleStatement: function handleStatement(statement, scope) {
                    if (statement.type != StatementType.RETURN) return;
                    var value = statement.value ? Language.evaluateExpression(statement.value, scope) : null;
                    FunctionUtil.functionReturn(value);
                }
            })
        ];
        return _this;
    }
    return ReturnPlugin;
}(_wrap_native_super(Plugin));
export var IfPlugin = /*#__PURE__*/ function(Plugin1) {
    "use strict";
    _inherits(IfPlugin, Plugin1);
    function IfPlugin() {
        _class_call_check(this, IfPlugin);
        var _this;
        _this = _call_super(this, IfPlugin), _define_property(_this, "id", "if");
        _this.statements = [
            Plugin.statementHandler({
                trim_case: true,
                case: function _case(t) {
                    return t.type == TokenType.IDENTIFIER && t.value == "if";
                },
                createStatement: function createStatement(ctx) {
                    var iterator = ctx.iterator;
                    var condition = ExpressionParser.parse(ctx);
                    var main_block = ParserQuick.parseStatementBlock(ctx);
                    var else_block = [];
                    if (iterator.disposeIf(function(t) {
                        return t.type == TokenType.IDENTIFIER && t.value == "else";
                    })) {
                        else_block = ParserQuick.parseStatementBlock(ctx);
                    }
                    return {
                        type: StatementType.IF,
                        condition: condition,
                        body: main_block,
                        else: else_block
                    };
                },
                test: function test(statement) {
                    return statement.type == StatementType.IF;
                },
                handleStatement: function handleStatement(statement, scope) {
                    var condition = Language.evaluateExpression(statement.condition, scope);
                    if (condition.type == DataType.BOOLEAN && condition.value == true) {
                        Language.execManyStatements(statement.body, scope);
                    } else if (statement.else != undefined) {
                        Language.execManyStatements(statement.else, scope);
                    }
                }
            })
        ];
        return _this;
    }
    return IfPlugin;
}(_wrap_native_super(Plugin));
export var TablesPlugin = /*#__PURE__*/ function(Plugin1) {
    "use strict";
    _inherits(TablesPlugin, Plugin1);
    function TablesPlugin() {
        _class_call_check(this, TablesPlugin);
        var _this;
        _this = _call_super(this, TablesPlugin), _define_property(_this, "id", "table");
        _this.impl = [
            Plugin.implHandler({
                name: "set",
                case: function _case(ctx) {
                    return ctx.name == "set" && ctx.data.type == DataType.OBJECT;
                },
                handle: function handle(ctx) {
                    if (Var.is(ctx.data, DataType.OBJECT) != true) {
                        return ctx.data;
                    }
                    var key = ctx.args[0];
                    var value = ctx.args[1];
                    if (key == undefined || Var.is(key, DataType.STRING) != true) {
                        throw new Error("Invalid key for map");
                    } else if (value == undefined) {
                        throw new Error("Missing value for table");
                    }
                    ctx.data.value[key.value] = value;
                }
            }),
            Plugin.implHandler({
                name: "delete",
                case: function _case(ctx) {
                    return ctx.name == "delete" && ctx.data.type == DataType.OBJECT;
                },
                handle: function handle(ctx) {
                    if (Var.is(ctx.data, DataType.OBJECT) != true) {
                        return ctx.data;
                    }
                    var key = ctx.args[0];
                    if (key == undefined || Var.is(key, DataType.STRING) != true) {
                        throw new Error("Invalid key for map");
                    }
                    delete ctx.data.value[key.value];
                }
            }),
            Plugin.implHandler({
                name: "clear",
                case: function _case(ctx) {
                    return ctx.name == "clear" && ctx.data.type == DataType.OBJECT;
                },
                handle: function handle(ctx) {
                    if (Var.is(ctx.data, DataType.OBJECT) != true) {
                        return ctx.data;
                    }
                    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                    try {
                        for(var _iterator = Object.keys(ctx.data.value)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                            var key = _step.value;
                            delete ctx.data.value[key];
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
                }
            })
        ];
        _this.expressions = [
            Plugin.expressionHandler({
                case: function _case(t) {
                    return t.type == TokenType.BRACE_LEFT;
                },
                create: function create(ctx) {
                    var entries = [];
                    var iterator = ctx.iterator;
                    while(iterator.peek().type !== TokenType.BRACE_RIGHT){
                        if (iterator.peek().type == TokenType.IDENTIFIER && iterator.peek(1).type == TokenType.EQUAL) {
                            var key = iterator.expectResult(TokenType.IDENTIFIER).value;
                            iterator.expect(TokenType.EQUAL);
                            var value = ExpressionParser.parse(ctx);
                            entries.push({
                                key: key,
                                value: value
                            });
                        } else {
                            var value1 = ExpressionParser.parse(ctx);
                            entries.push({
                                value: value1
                            });
                        }
                        iterator.disposeIf(TokenType.COMMA);
                    }
                    iterator.expect(TokenType.BRACE_RIGHT);
                    return {
                        type: ExpressionType.CUSTOM,
                        id: _this.id,
                        data: entries
                    };
                },
                handle: function handle(expression, scope) {
                    var obj = {};
                    var index = 1;
                    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                    try {
                        for(var _iterator = expression.data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                            var entry = _step.value;
                            if ("key" in entry) {
                                obj[entry.key] = Language.evaluateExpression(entry.value, scope);
                            } else {
                                obj[index++] = Language.evaluateExpression(entry.value, scope);
                            }
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
                    return Var.Object(obj);
                }
            })
        ];
        return _this;
    }
    _create_class(TablesPlugin, null, [
        {
            key: "handleInlineMethod",
            value: //! currently unused since function objects are supported and preferred
            function handleInlineMethod(ctx, entries) {
                var iterator = ctx.iterator;
                var name = iterator.expectResult(TokenType.IDENTIFIER);
                iterator.expect(TokenType.PAREN_LEFT);
                var parameters = ParserQuick.parseParameters(ctx);
                var body = ParserQuick.parseStatementBlock(ctx);
                entries.push({
                    key: name.value,
                    value: Ast.Function(parameters, body)
                });
            }
        }
    ]);
    return TablesPlugin;
}(_wrap_native_super(Plugin));
export var ClassPlugin = /*#__PURE__*/ function(Plugin1) {
    "use strict";
    _inherits(ClassPlugin, Plugin1);
    function ClassPlugin() {
        _class_call_check(this, ClassPlugin);
        var _this;
        _this = _call_super(this, ClassPlugin), _define_property(_this, "id", "class");
        _this.statements = [
            Plugin.statementHandler({
                trim_case: true,
                case: function _case(t) {
                    return t.type == TokenType.IDENTIFIER && t.value == "class";
                },
                createStatement: function createStatement(ctx) {
                    var iterator = ctx.iterator;
                    var class_name = iterator.expectResult(TokenType.IDENTIFIER).value;
                    var methods = {};
                    ParserQuick.parseBlock(ctx, function() {
                        var method_name = iterator.expectResult(TokenType.IDENTIFIER).value;
                        var params = ParserQuick.parseParameters(ctx);
                        var body = ParserQuick.parseStatementBlock(ctx);
                        methods[method_name] = {
                            params: params,
                            body: body
                        };
                    });
                    return {
                        type: StatementType.CUSTOM,
                        id: _this.id,
                        data: {
                            name: class_name,
                            methods: methods
                        }
                    };
                },
                test: Plugin.ownsStatement(_this.id),
                handleStatement: function handleStatement(statement, scope_ref) {
                    var _statement_data = statement.data, methods = _statement_data.methods, class_name = _statement_data.name;
                    var class_fn = Var.Function(function(ctx) {
                        var obj = Var.Object({});
                        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                        try {
                            var _loop = function() {
                                var _step_value = _sliced_to_array(_step.value, 2), name = _step_value[0], m = _step_value[1];
                                obj.value[name] = Var.Function(function(ctx) {
                                    var method_scope = scope_ref.extend();
                                    FunctionUtil.bindParameters(method_scope, m.params, ctx.args, obj);
                                    return FunctionUtil.processFunction(m.body, method_scope);
                                });
                            };
                            for(var _iterator = Object.entries(methods)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
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
                        // call constructor if there is one
                        if (obj.value["constructor"] != undefined) {
                            FunctionUtil.callFunction(obj.value["constructor"], scope_ref, ctx.args, obj);
                        }
                        return obj;
                    });
                    scope_ref.set(class_name, class_fn);
                }
            })
        ];
        return _this;
    }
    return ClassPlugin;
}(_wrap_native_super(Plugin));
export var ArrayPlugin = /*#__PURE__*/ function(Plugin1) {
    "use strict";
    _inherits(ArrayPlugin, Plugin1);
    function ArrayPlugin() {
        _class_call_check(this, ArrayPlugin);
        var _this;
        _this = _call_super(this, ArrayPlugin), _define_property(_this, "id", "vec");
        var key = "vec";
        _this.impl = [
            Plugin.implHandler({
                name: "push",
                case: function _case(ctx) {
                    return ctx.name == "push" && ctx.data.type == DataType.ARRAY && Var.is(ctx.data, DataType.ARRAY);
                },
                handle: function handle(ctx) {
                    if (Var.is(ctx.data, DataType.ARRAY)) {
                        var _ctx_data_value;
                        (_ctx_data_value = ctx.data.value).push.apply(_ctx_data_value, _to_consumable_array(ctx.args));
                    }
                    return ctx.data;
                }
            }),
            Plugin.implHandler({
                name: "each",
                case: function _case(ctx) {
                    return ctx.name == "each" && ctx.data.type == DataType.ARRAY && Var.is(ctx.data, DataType.ARRAY);
                },
                handle: function handle(ctx) {
                    if (Var.is(ctx.data, DataType.ARRAY)) {
                        if (Var.is(ctx.args[0], DataType.FUNCTION)) {
                            return Var.Array(_to_consumable_array(ctx.data.value));
                        }
                        throw new Error("Cannot call 'Array:each<fn>' using a non-function");
                    }
                    throw new Error("Cannot call 'Array:each(<fn>)' on a non-array");
                // return ctx.data;
                }
            })
        ];
        _this.expressions = [
            Plugin.expressionHandler({
                case: function _case(t) {
                    return t.type == TokenType.BRACKET_LEFT;
                },
                create: function create(ctx) {
                    var entries = [];
                    var iterator = ctx.iterator;
                    while(iterator.peek().type !== TokenType.BRACKET_RIGHT){
                        var value = ExpressionParser.parse(ctx);
                        entries.push(value);
                        iterator.disposeIf(TokenType.COMMA);
                    }
                    iterator.expect(TokenType.BRACKET_RIGHT);
                    return Ast.Custom(key, entries);
                },
                handle: function handle(expression, scope) {
                    var obj = [];
                    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                    try {
                        for(var _iterator = expression.data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                            var entry = _step.value;
                            var value = Language.evaluateExpression(entry, scope);
                            obj.push(value);
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
                    return Var.Array(obj);
                }
            })
        ];
        return _this;
    }
    return ArrayPlugin;
}(_wrap_native_super(Plugin));
export var ForLoopPlugin = /*#__PURE__*/ function(Plugin) {
    "use strict";
    _inherits(ForLoopPlugin, Plugin);
    function ForLoopPlugin() {
        _class_call_check(this, ForLoopPlugin);
        var _this;
        _this = _call_super(this, ForLoopPlugin), _define_property(_this, "id", "for-loop"), _define_property(_this, "max_calls", Infinity);
        _this.statements = [
            ForLoopPlugin.for_loop_statement
        ];
        return _this;
    }
    return ForLoopPlugin;
}(_wrap_native_super(Plugin));
_define_property(ForLoopPlugin, "for_loop_statement", Plugin.statementHandler({
    trim_case: true,
    case: function _case(t) {
        return t.type == TokenType.IDENTIFIER && t.value == "for";
    },
    createStatement: function createStatement(ctx) {
        var iterator = ctx.iterator;
        var name = iterator.expectResult(TokenType.IDENTIFIER).value;
        iterator.expect(TokenType.EQUAL);
        iterator.expect(TokenType.PAREN_LEFT);
        var start = ExpressionParser.parse(ctx);
        iterator.expect(TokenType.COMMA);
        var end = ExpressionParser.parse(ctx);
        iterator.expect(TokenType.PAREN_RIGHT);
        var body = ParserQuick.parseStatementBlock(ctx);
        return {
            type: StatementType.CUSTOM,
            id: "for-loop",
            data: {
                name: name,
                start: start,
                end: end,
                body: body
            }
        };
    },
    handleStatement: function handleStatement(statement, scope) {
        var start = Language.evaluateExpression(statement.data.start, scope);
        var end = Language.evaluateExpression(statement.data.end, scope);
        var start_v = start.type == DataType.NUMBER ? start.value : 0;
        var end_v = end.type == DataType.NUMBER ? end.value : 0;
        var calls = 0;
        var local_scope = scope.extend();
        var max = scope.environment.options.max_loop_stack;
        for(var i = start_v; i <= end_v; i++){
            if (++calls > max) {
                throw new Error("Too many for-loop calls! (".concat(calls, " > ").concat(max, ")"));
            }
            local_scope.set(statement.data.name, Var.Number(i));
            Language.execManyStatements(statement.data.body, local_scope);
        }
    }
}));
export var StringExtension = /*#__PURE__*/ function(Plugin) {
    "use strict";
    _inherits(StringExtension, Plugin);
    function StringExtension() {
        _class_call_check(this, StringExtension);
        var _this;
        _this = _call_super(this, StringExtension), _define_property(_this, "id", "string-extension");
        _this.impl = [
            {
                name: "with",
                case: function _case(ctx) {
                    var _ctx_args_;
                    return ctx.name == "with" && ((_ctx_args_ = ctx.args[0]) === null || _ctx_args_ === void 0 ? void 0 : _ctx_args_.type) == DataType.FUNCTION;
                },
                handle: function handle(ctx) {
                    if (Var.is(ctx.args[0], DataType.FUNCTION)) {
                        var _FunctionUtil_callFunction;
                        return (_FunctionUtil_callFunction = FunctionUtil.callFunction(ctx.args[0], ctx.scope, [
                            ctx.data
                        ])) !== null && _FunctionUtil_callFunction !== void 0 ? _FunctionUtil_callFunction : Var.Null();
                    }
                    return ctx.data;
                }
            },
            {
                name: "string-uppercase",
                case: function _case(ctx) {
                    return ctx.name == "upper" && ctx.data.type == DataType.STRING;
                },
                handle: function handle(ctx) {
                    if (Var.is(ctx.data, DataType.STRING)) {
                        return Var.String(ctx.data.value.toUpperCase());
                    }
                    return ctx.data;
                }
            },
            {
                name: "string-lowercase",
                case: function _case(ctx) {
                    return ctx.name == "lower" && ctx.data.type == DataType.STRING;
                },
                handle: function handle(ctx) {
                    if (Var.is(ctx.data, DataType.STRING)) {
                        return Var.String(ctx.data.value.toLowerCase());
                    }
                    return ctx.data;
                }
            }
        ];
        return _this;
    }
    return StringExtension;
}(_wrap_native_super(Plugin));
var TypeCastPlugin = /*#__PURE__*/ function(Plugin1) {
    "use strict";
    _inherits(TypeCastPlugin, Plugin1);
    function TypeCastPlugin() {
        _class_call_check(this, TypeCastPlugin);
        var _this;
        _this = _call_super(this, TypeCastPlugin), _define_property(_this, "id", "basic-type-casts");
        _this.impl = [
            Plugin.implHandler({
                name: "is",
                case: function _case(ctx) {
                    return ctx.name == "is" && ctx.args[0].type == DataType.TYPE_REF;
                },
                handle: function handle(ctx) {
                    var type_ref = ctx.args[0];
                    return Var.Boolean(Var.is(ctx.data, type_ref.value));
                }
            }),
            Plugin.implHandler({
                name: "cast",
                case: function _case(ctx) {
                    return ctx.name == "cast";
                },
                handle: function handle(ctx) {
                    if (Var.is(ctx.args[0], DataType.STRING) != true) {
                        throw new Error("Invalid cast type");
                    }
                    try {
                        return TypeCasts.cast(ctx.data, ctx.args[0].value);
                    } catch (e) {
                        throw new Error("Cannot cast data to type (".concat(ctx.data.type, ") -> (").concat(ctx.args[0].type, ")"));
                    }
                }
            })
        ];
        return _this;
    }
    return TypeCastPlugin;
}(_wrap_native_super(Plugin));
export var CoreMethodsPlugin = function CoreMethodsPlugin() {
    "use strict";
    _class_call_check(this, CoreMethodsPlugin);
};
_define_property(CoreMethodsPlugin, "READONLY_VARIABLE", {
    readonly: true
});
_define_property(CoreMethodsPlugin, "FN_PRINT", Plugin.wrapFunction("print", {
    type: DataType.FUNCTION,
    call: function call(ctx) {
        console.log(">>", ctx.args.map(function(e) {
            return "value" in e ? e.value : Symbol("Custom");
        }));
        return {
            type: DataType.NULL,
            value: 0
        };
    }
}, CoreMethodsPlugin.READONLY_VARIABLE));
_define_property(CoreMethodsPlugin, "FN_LEN", Plugin.wrapFunction("len", {
    type: DataType.FUNCTION,
    call: function call(ctx) {
        var v = ctx.args[0];
        switch(v.type){
            // return { type: DataType.NUMBER, value: v.value.length }
            case DataType.STRING:
            case DataType.ARRAY:
                return {
                    type: DataType.NUMBER,
                    value: v.value.length
                };
            case DataType.OBJECT:
                return {
                    type: DataType.NUMBER,
                    value: Object.keys(v.value).length
                };
        }
        return {
            type: DataType.NULL,
            value: 0
        };
    }
}, CoreMethodsPlugin.READONLY_VARIABLE));
_define_property(CoreMethodsPlugin, "list", function() {
    return [
        CoreMethodsPlugin.FN_PRINT(),
        CoreMethodsPlugin.FN_LEN()
    ];
});
export var core_plugins = [
    new VariablePlugin(),
    new FunctionPlugin(),
    new ReturnPlugin(),
    new TablesPlugin(),
    new ArrayPlugin(),
    new ForLoopPlugin(),
    new IfPlugin(),
    new ClassPlugin(),
    new StringExtension(),
    new TypeCastPlugin()
];
