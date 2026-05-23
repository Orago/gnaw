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
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
import { BinaryMethod } from "../shared/enums.js";
import { DataType, Var } from "../shared/variables.js";
export var DataOperations = /*#__PURE__*/ function() {
    "use strict";
    function DataOperations() {
        _class_call_check(this, DataOperations);
    }
    _create_class(DataOperations, null, [
        {
            key: "filter",
            value: function filter(list, value) {
                return list.filter(function(a) {
                    return a.type != value.type && ("value" in a && "value" in value ? a.value != value.value : true);
                });
            }
        },
        {
            key: "apply",
            value: function apply(left, op, right) {
                var left_part = this.Dict[left.type];
                if (left_part == undefined) return;
                var right_part = left_part[right.type];
                if (right_part == undefined) return;
                var op_method = right_part[op];
                if (op_method == undefined) return;
                return op_method(left, right);
            }
        }
    ]);
    return DataOperations;
}();
var _obj, _obj1, _obj2, _obj3;
/** Handle TypeA -> TypeB -> Operation */ _define_property(DataOperations, "Dict", (_obj3 = {}, _define_property(_obj3, DataType.NUMBER, _define_property({}, DataType.NUMBER, (_obj = {}, _define_property(_obj, BinaryMethod.ADD, function(left, right) {
    return Var.Number(left.value + right.value);
}), _define_property(_obj, BinaryMethod.SUBTRACT, function(left, right) {
    return Var.Number(left.value - right.value);
}), _define_property(_obj, BinaryMethod.MULTIPLY, function(left, right) {
    return Var.Number(left.value * right.value);
}), _define_property(_obj, BinaryMethod.DIVIDE, function(left, right) {
    return Var.Number(left.value / right.value);
}), _define_property(_obj, BinaryMethod.IS, function(left, right) {
    return Var.Boolean(left.value === right.value);
}), _define_property(_obj, BinaryMethod.NOT, function(left, right) {
    return Var.Boolean(left.value !== right.value);
}), _define_property(_obj, BinaryMethod.LESS_THAN, function(left, right) {
    return Var.Boolean(left.value < right.value);
}), _define_property(_obj, BinaryMethod.GREATER_THAN, function(left, right) {
    return Var.Boolean(left.value > right.value);
}), _obj))), _define_property(_obj3, DataType.STRING, _define_property({}, DataType.STRING, (_obj1 = {}, _define_property(_obj1, BinaryMethod.ADD, function(left, right) {
    return Var.String(String(left.value).concat(String(right.value)));
}), _define_property(_obj1, BinaryMethod.SUBTRACT, function(left, right) {
    return Var.String(String(left.value).replace(String(right.value), ""));
}), _define_property(_obj1, BinaryMethod.DIVIDE, function(left, right) {
    return Var.String(String(left.value).replaceAll(String(right.value), ""));
}), _define_property(_obj1, BinaryMethod.IS, function(left, right) {
    return Var.Boolean(String(left.value) === String(right.value));
}), _define_property(_obj1, BinaryMethod.NOT, function(left, right) {
    return Var.Boolean(String(left.value) !== String(right.value));
}), _obj1))), _define_property(_obj3, DataType.ARRAY, _define_property({}, DataType.ANY, (_obj2 = {}, _define_property(_obj2, BinaryMethod.ADD, function(left, right) {
    return Var.Array(_to_consumable_array(left.value).concat([
        right
    ]));
}), _define_property(_obj2, BinaryMethod.SUBTRACT, function(left, right) {
    return Var.Array(DataOperations.filter(left.value, right));
}), _define_property(_obj2, BinaryMethod.DIVIDE, function(left, right) {
    left.value = DataOperations.filter(left.value, right);
    return left;
}), _define_property(_obj2, BinaryMethod.MULTIPLY, function(left, right) {
    left.value.push(right);
    return left;
}), _obj2))), _obj3));
