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
export var DataType = /*#__PURE__*/ function(DataType) {
    DataType["CUSTOM"] = "custom";
    DataType["NULL"] = "null";
    DataType["ANY"] = "any";
    DataType["NUMBER"] = "number";
    DataType["STRING"] = "string";
    DataType["OBJECT"] = "object";
    DataType["ARRAY"] = "array";
    DataType["IDENTIFIER"] = "identifier";
    DataType["BOOLEAN"] = "boolean";
    DataType["FUNCTION"] = "function";
    DataType["TYPE_REF"] = "data-type";
    return DataType;
}({});
export var Var = /*#__PURE__*/ function() {
    "use strict";
    function Var() {
        _class_call_check(this, Var);
    }
    _create_class(Var, null, [
        {
            key: "is",
            value: function is(data, expect) {
                return data.type == expect;
            }
        },
        {
            key: "satisfies",
            value: function satisfies(data, expect) {
                if (data.type == expect) {
                    return true;
                } else {
                    return expect == "any" && "type" in data;
                }
            }
        }
    ]);
    return Var;
}();
_define_property(Var, "Null", function() {
    return {
        type: "null",
        value: 0
    };
});
_define_property(Var, "Any", function(value) {
    return {
        type: "any",
        value: value
    };
});
_define_property(Var, "Number", function(value) {
    return {
        type: "number",
        value: value
    };
});
_define_property(Var, "String", function(value) {
    return {
        type: "string",
        value: value
    };
});
_define_property(Var, "Array", function(value) {
    return {
        type: "array",
        value: value
    };
});
_define_property(Var, "Object", function(value) {
    return {
        type: "object",
        value: value
    };
});
_define_property(Var, "Boolean", function(value) {
    return {
        type: "boolean",
        value: value
    };
});
_define_property(Var, "Function", function(call) {
    return {
        type: "function",
        call: call
    };
});
_define_property(Var, "Identifier", function(name) {
    return {
        type: "identifier",
        value: name
    };
});
_define_property(Var, "Custom", function(id, value) {
    return {
        type: "custom",
        id: id,
        value: value
    };
});
_define_property(Var, "TypeRef", function(value) {
    return {
        type: "data-type",
        value: value
    };
});
var _obj;
_define_property(Var, "defaults", (_obj = {}, _define_property(_obj, "null", function() {
    return Var.Null();
}), _define_property(_obj, "any", function() {
    return Var.Any("");
}), _define_property(_obj, "boolean", function() {
    return Var.Boolean(false);
}), _define_property(_obj, "number", function() {
    return Var.Number(0);
}), _define_property(_obj, "string", function() {
    return Var.String("");
}), _define_property(_obj, "array", function() {
    return Var.Array([]);
}), _define_property(_obj, "object", function() {
    return Var.Object({});
}), _define_property(_obj, "function", function() {
    return Var.Function(function() {
        return Var.Null();
    });
}), _define_property(_obj, "identifier", function() {
    return Var.Identifier("*");
}), _define_property(_obj, "custom", function() {
    return Var.Custom("*", {});
}), _define_property(_obj, "data-type", function() {
    return Var.TypeRef("any");
}), _obj));
