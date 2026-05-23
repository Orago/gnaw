function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
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
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
export var System = /*#__PURE__*/ function() {
    "use strict";
    function System() {
        _class_call_check(this, System);
        _define_property(this, "keywords", void 0);
        _define_property(this, "impl_list", new Set());
        _define_property(this, "expression_handlers", new Set());
        _define_property(this, "statement_handlers", new Set());
        _define_property(this, "default_values", new Map());
    }
    _create_class(System, [
        {
            key: "clearUtilities",
            value: function clearUtilities() {
                this.impl_list.clear();
                this.expression_handlers.clear();
                this.statement_handlers.clear();
            }
        },
        {
            key: "loadValues",
            value: function loadValues(scope) {
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = this.default_values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var _step_value = _sliced_to_array(_step.value, 2), key = _step_value[0], _step_value_ = _sliced_to_array(_step_value[1], 2), value = _step_value_[0], options = _step_value_[1];
                        scope.set(key, value, options);
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
            key: "loadPlugins",
            value: function loadPlugins(plugins) {
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var plugin = _step.value;
                        var _plugin_impl, _plugin_getExpressions, _plugin_getStatements;
                        var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
                        try {
                            for(var _iterator1 = ((_plugin_impl = plugin.impl) !== null && _plugin_impl !== void 0 ? _plugin_impl : [])[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                                var impl = _step1.value;
                                this.impl_list.add(impl);
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
                        var _iteratorNormalCompletion2 = true, _didIteratorError2 = false, _iteratorError2 = undefined;
                        try {
                            for(var _iterator2 = ((_plugin_getExpressions = plugin.getExpressions()) !== null && _plugin_getExpressions !== void 0 ? _plugin_getExpressions : [])[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true){
                                var expression_handler = _step2.value;
                                this.expression_handlers.add(expression_handler);
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally{
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                                    _iterator2.return();
                                }
                            } finally{
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                        var _iteratorNormalCompletion3 = true, _didIteratorError3 = false, _iteratorError3 = undefined;
                        try {
                            for(var _iterator3 = ((_plugin_getStatements = plugin.getStatements()) !== null && _plugin_getStatements !== void 0 ? _plugin_getStatements : [])[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true){
                                var statement_handler = _step3.value;
                                this.statement_handlers.add(statement_handler);
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally{
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                                    _iterator3.return();
                                }
                            } finally{
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }
                        if (plugin.values != undefined) {
                            var values = plugin.values();
                            if (Array.isArray(values)) {
                                var _iteratorNormalCompletion4 = true, _didIteratorError4 = false, _iteratorError4 = undefined;
                                try {
                                    for(var _iterator4 = values[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true){
                                        var _step_value = _sliced_to_array(_step4.value, 3), key = _step_value[0], value = _step_value[1], options = _step_value[2];
                                        this.default_values.set(key, [
                                            value,
                                            options
                                        ]);
                                    }
                                } catch (err) {
                                    _didIteratorError4 = true;
                                    _iteratorError4 = err;
                                } finally{
                                    try {
                                        if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                                            _iterator4.return();
                                        }
                                    } finally{
                                        if (_didIteratorError4) {
                                            throw _iteratorError4;
                                        }
                                    }
                                }
                            } else {
                                var _iteratorNormalCompletion5 = true, _didIteratorError5 = false, _iteratorError5 = undefined;
                                try {
                                    for(var _iterator5 = Object.entries(values)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true){
                                        var _step_value1 = _sliced_to_array(_step5.value, 2), k = _step_value1[0], v = _step_value1[1];
                                        this.default_values.set(k, [
                                            v
                                        ]);
                                    }
                                } catch (err) {
                                    _didIteratorError5 = true;
                                    _iteratorError5 = err;
                                } finally{
                                    try {
                                        if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
                                            _iterator5.return();
                                        }
                                    } finally{
                                        if (_didIteratorError5) {
                                            throw _iteratorError5;
                                        }
                                    }
                                }
                            }
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
                return this;
            }
        }
    ]);
    return System;
}();
export var DataScope = /*#__PURE__*/ function() {
    "use strict";
    function DataScope(environment, parent) {
        _class_call_check(this, DataScope);
        _define_property(this, "environment", void 0);
        _define_property(this, "parent", void 0);
        _define_property(this, "variables", void 0);
        _define_property(this, "variable_modes", void 0);
        this.environment = environment;
        this.parent = parent;
        this.variables = {};
        this.variable_modes = {};
    }
    _create_class(DataScope, [
        {
            key: "extend",
            value: function extend() {
                return new DataScope(this.environment, this);
            }
        },
        {
            key: "get",
            value: function get(name) {
                return DataScope.getVariable(this, name);
            }
        },
        {
            key: "set",
            value: function set(name, value, options) {
                var _this_variables_name;
                var opts = this.variable_modes[name];
                if ((opts === null || opts === void 0 ? void 0 : opts.readonly) == true) {
                    throw new Error("Cannot set over read-only variable (".concat(name, ")"));
                }
                if (value.type != ((_this_variables_name = this.variables[name]) === null || _this_variables_name === void 0 ? void 0 : _this_variables_name.type)) {
                    delete this.variable_modes[name];
                }
                if (options != undefined) {
                    this.updateVariableOptions(name, options);
                }
                this.variables[name] = value;
            }
        },
        {
            key: "updateVariableOptions",
            value: function updateVariableOptions(name, options) {
                if (options) {
                    this.variable_modes[name] = options;
                } else {
                    delete this.variable_modes[name];
                }
            }
        },
        {
            key: "delete",
            value: function _delete(name) {
                delete this.variables[name];
            }
        }
    ], [
        {
            key: "getVariable",
            value: function getVariable(scope, name) {
                if (scope.variables[name] != undefined) {
                    return scope.variables[name];
                } else if (scope.parent != undefined) {
                    return DataScope.getVariable(scope.parent, name);
                }
                return undefined;
            }
        }
    ]);
    return DataScope;
}();
export var Environment = /*#__PURE__*/ function() {
    "use strict";
    function Environment(system) {
        _class_call_check(this, Environment);
        _define_property(this, "system", void 0);
        _define_property(this, "root_scope", void 0);
        _define_property(this, "options", void 0);
        _define_property(this, "states", void 0);
        this.system = system;
        this.root_scope = new DataScope(this);
        this.options = {
            max_call_stack: 10,
            max_loop_stack: 10
        };
        this.states = {
            call_depth: 0
        };
    }
    _create_class(Environment, [
        {
            key: "callDepth",
            value: function callDepth(value) {
                if (value == undefined || isNaN(value)) {
                    return this.states.call_depth;
                } else {
                    this.states.call_depth += value;
                    if (this.states.call_depth > this.options.max_call_stack) {
                        throw new Error("Maximum call stack exceeded (".concat(this.states.call_depth, " > ").concat(this.options.max_call_stack, ")"));
                    }
                    return this;
                }
            }
        }
    ]);
    return Environment;
}();
