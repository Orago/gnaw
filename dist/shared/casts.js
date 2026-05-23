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
import { DataType, Var } from "./variables.js";
export var TypeCasts = /*#__PURE__*/ function() {
    "use strict";
    function TypeCasts() {
        _class_call_check(this, TypeCasts);
    }
    _create_class(TypeCasts, null, [
        {
            key: "convert",
            value: function convert(from, to) {
                var from_map = this.from__to[from.type];
                if (!from_map) return;
                var cb = from_map[to];
                if (!cb) return;
                return cb(from);
            }
        },
        {
            key: "convertSafe",
            value: function convertSafe(from, to) {
                var _TypeCasts_convert;
                if (Var.is(from, to)) {
                    return from;
                }
                return (_TypeCasts_convert = TypeCasts.convert(from, to)) !== null && _TypeCasts_convert !== void 0 ? _TypeCasts_convert : Var.defaults[to]();
            }
        },
        {
            key: "isValidCast",
            value: function isValidCast(name) {
                return TypeCasts.cast_names[name] != undefined;
            }
        },
        {
            key: "getCastType",
            value: /**
	 * ! can throw
	 */ function getCastType(name) {
                var dt = TypeCasts.cast_names[name];
                if (dt != undefined) {
                    return dt;
                }
                throw new Error("Cannot get data type (name: ".concat(name, ")"));
            }
        },
        {
            key: "cast",
            value: /**
	 * ! can throw
	 */ function cast(data, name) {
                var dt = TypeCasts.getCastType(name);
                var p = TypeCasts.convert(data, dt);
                if (p != undefined) {
                    return p;
                }
            }
        }
    ]);
    return TypeCasts;
}();
var _obj, _obj1, _obj2, _obj3, _obj4;
_define_property(TypeCasts, "from__to", (_obj4 = {}, _define_property(_obj4, DataType.NUMBER, (_obj = {}, _define_property(_obj, DataType.STRING, function(data) {
    return Var.String(String(data.value));
}), _define_property(_obj, DataType.BOOLEAN, function(data) {
    return Var.Boolean(data.value != 0);
}), _obj)), _define_property(_obj4, DataType.STRING, (_obj1 = {}, _define_property(_obj1, DataType.NUMBER, function(data) {
    var num = Number(data.value);
    return Var.Number(isNaN(num) ? 0 : num);
}), _define_property(_obj1, DataType.BOOLEAN, function(data) {
    if (data.value == String(true)) {
        return Var.Boolean(true);
    }
    if (data.value == String(false)) {
        return Var.Boolean(false);
    }
    return Var.Boolean(data.value.trim().length > 0);
}), _obj1)), _define_property(_obj4, DataType.BOOLEAN, (_obj2 = {}, _define_property(_obj2, DataType.NUMBER, function(data) {
    return Var.Number(+data.value);
}), _define_property(_obj2, DataType.STRING, function(data) {
    return Var.String(String(data.value));
}), _obj2)), _define_property(_obj4, DataType.NULL, (_obj3 = {}, _define_property(_obj3, DataType.NUMBER, function(data) {
    return Var.Number(0);
}), _define_property(_obj3, DataType.STRING, function(data) {
    return Var.String("");
}), _define_property(_obj3, DataType.BOOLEAN, function(data) {
    return Var.Boolean(false);
}), _obj3)), _obj4));
_define_property(TypeCasts, "cast_names", {
    string: DataType.STRING,
    number: DataType.NUMBER,
    boolean: DataType.BOOLEAN
});
