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
import { TypeCasts } from "../shared/casts.js";
import { BinaryMethod, ExpressionType, StatementType } from "../shared/enums.js";
import { DataType, Var } from "../shared/variables.js";
import { DataOperations } from "./core-utilities.js";
export var FunctionUtil = /*#__PURE__*/ function() {
    "use strict";
    function FunctionUtil() {
        _class_call_check(this, FunctionUtil);
    }
    _create_class(FunctionUtil, null, [
        {
            key: "functionReturn",
            value: function functionReturn(value) {
                throw {
                    type: StatementType.RETURN,
                    value: value !== null && value !== void 0 ? value : Var.Null()
                };
            }
        },
        {
            key: "expectReturn",
            value: function expectReturn(cb) {
                try {
                    cb();
                } catch (ret) {
                    if (ret.type === StatementType.RETURN) return ret.value;
                    else throw ret;
                }
            }
        },
        {
            key: "processFunction",
            value: function processFunction(statements, scope) {
                return FunctionUtil.expectReturn(function() {
                    return Language.execManyStatements(statements, scope);
                });
            }
        },
        {
            key: "bindParameters",
            value: /**
	 * ? Parameter binding must be handled inside of function data value
	 */ function bindParameters(scope, parameter_info, args, this_value) {
                if (this_value != undefined) {
                    scope.set("this", this_value);
                }
                parameter_info.forEach(function(p, i) {
                    var _args_i;
                    var data = (_args_i = args[i]) !== null && _args_i !== void 0 ? _args_i : Var.Null();
                    if (p.type != undefined) {
                        // TODO: probably should be moved into parser but we ball
                        if (TypeCasts.isValidCast(p.type)) {
                            data = TypeCasts.convertSafe(data, p.type);
                        } else {
                            throw new Error("Invalid type to cast to (parameter: ".concat(p.name, ") -> (type: ").concat(p.type, ")"));
                        }
                        if (p.expect == true && Var.is(data, p.type)) {
                            throw new Error("Expected (parameter: ".concat(p.name, ") of (type: ").concat(p.type, "), but got (type: ").concat(data.type, ")"));
                        }
                    }
                    scope.set(p.name, data);
                });
            }
        },
        {
            key: "createFunction",
            value: function createFunction(parameters, body, scope) {
                return Var.Function(function(ctx) {
                    var local_scope = scope.extend();
                    FunctionUtil.bindParameters(local_scope, parameters, ctx.args);
                    return FunctionUtil.processFunction(body, local_scope);
                });
            }
        },
        {
            key: "createContext",
            value: function createContext(args, this_value) {
                return {
                    // primary states
                    args: args,
                    this: this_value
                };
            }
        },
        {
            key: "callFunction",
            value: function callFunction(fn, scope, args, this_value) {
                var env = scope.environment;
                var ctx = FunctionUtil.createContext(args, this_value);
                env.callDepth(1);
                try {
                    return fn.call(ctx);
                } finally{
                    env.callDepth(-1);
                }
            }
        }
    ]);
    return FunctionUtil;
}();
export var Language = /*#__PURE__*/ function() {
    "use strict";
    function Language() {
        _class_call_check(this, Language);
    }
    _create_class(Language, null, [
        {
            key: "run",
            value: function run(environment, program) {
                return FunctionUtil.expectReturn(function() {
                    return Language.runNest(environment, program);
                });
            }
        },
        {
            key: "runNest",
            value: function runNest(environment, program) {
                var scope = environment.root_scope;
                environment.system.loadValues(scope);
                this.execManyStatements(program, scope);
            }
        },
        {
            key: "execManyStatements",
            value: /** wrapper */ function execManyStatements(statements, scope) {
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = statements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var statement = _step.value;
                        Language.execStatement(statement, scope);
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
        },
        {
            key: "execStatement",
            value: function execStatement(statement, scope) {
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = scope.environment.system.statement_handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var handler = _step.value;
                        var test = handler.test != undefined && handler.test(statement);
                        if (test) {
                            handler.handleStatement(statement, scope);
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
                switch(statement.type){
                    case StatementType.VARIABLE:
                        {
                            var value = this.evaluateExpression(statement.value, scope);
                            scope.set(statement.name, value);
                            return;
                        }
                    case StatementType.EXPRESSION:
                        {
                            this.evaluateExpression(statement.expression, scope);
                            return;
                        }
                }
            }
        },
        {
            key: "evalUnary",
            value: /** Unary handling (special operator symbol handlign that comes before data) */ function evalUnary(op, value) {
                switch(op){
                    case BinaryMethod.SUBTRACT:
                        if (value.type === DataType.NUMBER) {
                            return Var.Number(-value.value);
                        }
                        throw new Error("Cannot negate non-number");
                    case BinaryMethod.EXCLAMATION:
                        if (value.type === DataType.BOOLEAN) {
                            return Var.Boolean(!value.value);
                        }
                        throw new Error("Cannot invert non-boolean");
                    default:
                        throw new Error("Unknown unary operator: ".concat(op));
                }
            }
        },
        {
            key: "resolveTarget",
            value: function resolveTarget(expr, scope) {
                if (expr.type === ExpressionType.IDENTIFIER) {
                    return {
                        get: function get() {
                            var _scope_get;
                            return (_scope_get = scope.get(expr.name)) !== null && _scope_get !== void 0 ? _scope_get : Var.Null();
                        },
                        set: function set(value) {
                            return scope.set(expr.name, value);
                        }
                    };
                }
                if (expr.type === ExpressionType.MEMBER_ACCESS) {
                    var obj = this.evaluateExpression(expr.object, scope);
                    var key = this.evaluateExpression(expr.property, scope);
                    if (key.type != DataType.NUMBER && key.type != DataType.STRING) {
                        throw "Invalid member-key type ".concat(key.type);
                    }
                    if (obj.type === DataType.OBJECT) {
                        return {
                            get: function get() {
                                var _obj_value_key_value;
                                return (_obj_value_key_value = obj.value[key.value]) !== null && _obj_value_key_value !== void 0 ? _obj_value_key_value : Var.Null();
                            },
                            set: function set(value) {
                                obj.value[key.value] = value;
                            }
                        };
                    }
                    if (obj.type === DataType.ARRAY && key.type === DataType.NUMBER) {
                        return {
                            get: function get() {
                                var _obj_value_key_value;
                                return (_obj_value_key_value = obj.value[key.value]) !== null && _obj_value_key_value !== void 0 ? _obj_value_key_value : Var.Null();
                            },
                            set: function set(value) {
                                obj.value[key.value] = value;
                            }
                        };
                    }
                }
                throw new Error("Invalid assignment target");
            }
        },
        {
            key: "evaluateExpression",
            value: function evaluateExpression(expression, scope) {
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = scope.environment.system.expression_handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var handler = _step.value;
                        var test = handler.test != undefined && handler.test(expression);
                        if (test) {
                            return handler.handle(expression, scope);
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
                switch(expression.type){
                    case ExpressionType.IMPL:
                        {
                            var name = expression.name;
                            var value = Language.evaluateExpression(expression.callee, scope);
                            var args = expression.args.map(function(arg) {
                                return Language.evaluateExpression(arg, scope);
                            });
                            var ctx = {
                                name: name,
                                data: value,
                                args: args,
                                scope: scope
                            };
                            var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
                            try {
                                for(var _iterator1 = scope.environment.system.impl_list[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                                    var impl = _step1.value;
                                    var _impl_handle;
                                    if (impl.case(ctx) != true) continue;
                                    return (_impl_handle = impl.handle(ctx)) !== null && _impl_handle !== void 0 ? _impl_handle : Var.Null();
                                }
                            } catch (err) {
                                _didIteratorError1 = true;
                                _iteratorError1 = err;
                            } finally{
                                try {
                                    if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                                        _iterator1.return();
                                    }
                                } finally{
                                    if (_didIteratorError1) {
                                        throw _iteratorError1;
                                    }
                                }
                            }
                            throw new Error("^^^ Cannot imp for :".concat(name, "()"));
                        }
                    case ExpressionType.NUMBER:
                        return Var.Number(expression.value);
                    case ExpressionType.STRING:
                        return Var.String(expression.value);
                    case ExpressionType.BOOLEAN:
                        return Var.Boolean(expression.value);
                    case ExpressionType.IDENTIFIER:
                        var _scope_get;
                        return (_scope_get = scope.get(expression.name)) !== null && _scope_get !== void 0 ? _scope_get : Var.Null();
                    case ExpressionType.TYPE_REF:
                        return Var.TypeRef(expression.value);
                    case ExpressionType.UNARY:
                        {
                            var right = Language.evaluateExpression(expression.right, scope);
                            return Language.evalUnary(expression.op, right);
                        }
                    case ExpressionType.BINARY:
                        {
                            var left = Language.evaluateExpression(expression.left, scope);
                            var right1 = Language.evaluateExpression(expression.right, scope);
                            var method_applied = DataOperations.apply(left, expression.op, right1);
                            if (method_applied) {
                                return method_applied;
                            } else {
                                throw new Error("Invalid operator ".concat(expression.op));
                            }
                        }
                    case ExpressionType.CALL:
                        {
                            var fn = Language.evaluateExpression(expression.callee, scope);
                            var args1 = expression.args.map(function(arg) {
                                return Language.evaluateExpression(arg, scope);
                            });
                            var this_value;
                            if (expression.callee.type == ExpressionType.MEMBER_ACCESS) {
                                var obj = this.evaluateExpression(expression.callee.object, scope);
                                var key = this.evaluateExpression(expression.callee.property, scope);
                                if (obj.type != DataType.OBJECT || key.type != DataType.NUMBER && key.type != DataType.STRING) {
                                    throw "Invalid member-key xx type ".concat(key.type);
                                }
                                this_value = obj.value[key.value];
                            }
                            if (fn.type == DataType.FUNCTION) {
                                var data = FunctionUtil.callFunction(fn, scope, args1, this_value);
                                if (data) {
                                    return data;
                                }
                            }
                            return Var.Null();
                        }
                    case ExpressionType.MEMBER_ACCESS:
                        {
                            var object = this.evaluateExpression(expression.object, scope);
                            var key1 = this.evaluateExpression(expression.property, scope);
                            if (object.type == DataType.ARRAY && key1.type == DataType.NUMBER) {
                                var _ref;
                                var _object_value;
                                return (_ref = (_object_value = object.value) === null || _object_value === void 0 ? void 0 : _object_value[key1.value]) !== null && _ref !== void 0 ? _ref : Var.Null();
                            } else if (object.type == DataType.OBJECT && (key1.type == DataType.STRING || key1.type == DataType.NUMBER)) {
                                var _ref1;
                                var _object_value1;
                                return (_ref1 = (_object_value1 = object.value) === null || _object_value1 === void 0 ? void 0 : _object_value1[key1.value]) !== null && _ref1 !== void 0 ? _ref1 : Var.Null();
                            } else {
                                return Var.Null();
                            }
                        }
                    case ExpressionType.ASSIGN:
                        {
                            var value1 = this.evaluateExpression(expression.value, scope);
                            var ref = this.resolveTarget(expression.target, scope);
                            ref.set(value1);
                            return value1;
                        }
                }
                throw new Error("Invalid expression ".concat(expression.type));
            }
        }
    ]);
    return Language;
}();
