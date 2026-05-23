function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
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
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
function _ts_generator(thisArg, body) {
    var f, y, t, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype), d = Object.defineProperty;
    return d(g, "next", {
        value: verb(0)
    }), d(g, "throw", {
        value: verb(1)
    }), d(g, "return", {
        value: verb(2)
    }), typeof Symbol === "function" && d(g, Symbol.iterator, {
        value: function() {
            return this;
        }
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
import { TokenType } from "./tokens.js";
var TokenIterator = /*#__PURE__*/ function() {
    "use strict";
    function TokenIterator(items) {
        var settings = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        _class_call_check(this, TokenIterator);
        _define_property(this, "settings", void 0);
        _define_property(this, "stack", void 0);
        _define_property(this, "items", void 0);
        _define_property(this, "offset", void 0);
        _define_property(this, "log_count", void 0);
        this.settings = settings;
        this.stack = [];
        this.offset = 0;
        this.log_count = 10;
        this.items = _to_consumable_array(items);
    }
    _create_class(TokenIterator, [
        {
            key: "remainingItems",
            value: function remainingItems() {
                return this.items.slice(this.offset);
            }
        },
        {
            key: Symbol.iterator,
            value: function value() {
                var found;
                return _ts_generator(this, function(_state) {
                    switch(_state.label){
                        case 0:
                            found = this.peek();
                            _state.label = 1;
                        case 1:
                            if (!true) return [
                                3,
                                5
                            ];
                            found = this.advance();
                            if (!(found.type == TokenType.EOF)) return [
                                3,
                                2
                            ];
                            return [
                                3,
                                5
                            ];
                        case 2:
                            return [
                                4,
                                found.value
                            ];
                        case 3:
                            _state.sent();
                            _state.label = 4;
                        case 4:
                            return [
                                3,
                                1
                            ];
                        case 5:
                            return [
                                2
                            ];
                    }
                });
            }
        },
        {
            key: "consumer",
            value: function consumer() {
                var found;
                return _ts_generator(this, function(_state) {
                    switch(_state.label){
                        case 0:
                            found = this.peek();
                            _state.label = 1;
                        case 1:
                            if (!true) return [
                                3,
                                5
                            ];
                            found = this.advance();
                            if (!(found.type == TokenType.EOF)) return [
                                3,
                                2
                            ];
                            return [
                                3,
                                5
                            ];
                        case 2:
                            return [
                                4,
                                found.value
                            ];
                        case 3:
                            _state.sent();
                            _state.label = 4;
                        case 4:
                            return [
                                3,
                                1
                            ];
                        case 5:
                            return [
                                2
                            ];
                    }
                });
            }
        },
        {
            key: "isDone",
            value: function isDone() {
                var offset = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
                return 1 > this.items.length - this.offset - offset;
            }
        },
        {
            key: "advance",
            value: function advance() {
                var amount = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
                var result = this.peek(amount - 1);
                this.offset += amount;
                return result;
            }
        },
        {
            key: "next",
            value: function next() {
                return this.advance(1);
            }
        },
        {
            key: "peek",
            value: function peek() {
                var amount = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
                var eof = {
                    type: TokenType.EOF,
                    raw: ""
                };
                return this.items[amount + this.offset] || eof;
            }
        },
        {
            key: "clone",
            value: function clone() {
                var iter = new TokenIterator(this.items, this.settings);
                iter.offset = this.offset;
                return iter;
            }
        },
        {
            key: "injectAfter",
            value: function injectAfter(inject_items, after_position) {
                this.items = [].concat(this.items.slice(0, after_position), inject_items, this.items.slice(after_position, this.items.length));
            }
        },
        {
            key: "match",
            value: function match(check) {
                var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                var item = this.peek(n - 1);
                if (item == undefined || item.type == TokenType.EOF) {
                    return false;
                } else if (item.type == check) {
                    return true;
                } else if (Array.isArray(check)) {
                    return check.some(function(check) {
                        return item.value == check;
                    });
                }
                switch(typeof check === "undefined" ? "undefined" : _type_of(check)){
                    case "function":
                        return check(item) == true;
                    case "string":
                        return item.value == check;
                }
                if (_instanceof(check, RegExp) && check.test(item.value.toString())) {
                    return true;
                }
                return false;
            }
        },
        {
            key: "disposeIf",
            value: function disposeIf(check) {
                var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                var status = this.match(check, n);
                if (status == true) this.advance(n);
                return status;
            }
        },
        {
            key: "disposeNot",
            value: function disposeNot(check) {
                var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                var status = this.match(check, n);
                if (status == false) this.advance(n);
                return status;
            }
        },
        {
            key: "expect",
            value: function expect(check) {
                var status = this.match(check, 1);
                if (status == true) {
                    return this.advance(1);
                }
                console.log(">>>", this.remainingItems().slice(0, this.log_count));
                throw new Error("^^^ Expected token match for (".concat(check, ") and failed"));
            }
        },
        {
            key: "expectResult",
            value: function expectResult(check, or) {
                var status = this.match(check, 1);
                if (status == true) {
                    return this.advance(1);
                }
                if (or != undefined) {
                    return or();
                } else {
                    console.log(">>>", this.remainingItems().slice(0, this.log_count));
                    throw new Error("Expected token id (".concat(check, ") and failed"));
                }
            }
        },
        {
            key: "last",
            value: function last() {
                var n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
                return this.items[this.offset - n];
            }
        },
        {
            key: "select",
            value: function select(mode) {
                switch(mode){
                    case "remaining":
                        return this.items.slice(this.offset);
                    case "used":
                        return this.items.slice(0, this.offset);
                }
            }
        },
        {
            key: "until",
            value: function until(check, callback) {
                while(this.match(check) != true){
                    callback(this);
                }
                this.expect(check);
            }
        },
        {
            key: "collectUntil",
            value: function collectUntil(check, callback) {
                var collected = [];
                while(this.match(check) != true){
                    collected.push(callback(this));
                }
                return collected;
            }
        }
    ]);
    return TokenIterator;
}();
export { TokenIterator as default };
