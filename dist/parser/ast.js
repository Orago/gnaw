function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
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
import { ExpressionType } from "../shared/enums.js";
export var Ast = function Ast() {
    "use strict";
    _class_call_check(this, Ast);
};
_define_property(Ast, "Number", function(value) {
    return {
        type: ExpressionType.NUMBER,
        value: value
    };
});
_define_property(Ast, "String", function(value) {
    return {
        type: ExpressionType.STRING,
        value: value
    };
});
_define_property(Ast, "Boolean", function(value) {
    return {
        type: ExpressionType.BOOLEAN,
        value: value
    };
});
_define_property(Ast, "Identifier", function(name) {
    return {
        type: ExpressionType.IDENTIFIER,
        name: name
    };
});
_define_property(Ast, "Assign", function(target, value) {
    return {
        type: ExpressionType.ASSIGN,
        target: target,
        value: value
    };
});
_define_property(Ast, "Binary", function(left, op, right) {
    return {
        type: ExpressionType.BINARY,
        left: left,
        op: op,
        right: right
    };
});
_define_property(Ast, "Unary", function(op, right) {
    return {
        type: ExpressionType.UNARY,
        op: op,
        right: right
    };
});
_define_property(Ast, "InvokeCall", function(callee, args) {
    return {
        type: ExpressionType.CALL,
        callee: callee,
        args: args
    };
});
_define_property(Ast, "Member", function(object, property) {
    return {
        type: ExpressionType.MEMBER_ACCESS,
        object: object,
        property: property
    };
});
_define_property(Ast, "Function", function(params, body) {
    return {
        type: ExpressionType.FUNCTION,
        params: params,
        body: body
    };
});
_define_property(Ast, "Impl", function(callee, name, args) {
    return {
        type: ExpressionType.IMPL,
        name: name,
        callee: callee,
        args: args
    };
});
_define_property(Ast, "TypeRef", function(value) {
    return {
        type: ExpressionType.TYPE_REF,
        value: value
    };
});
_define_property(Ast, "Custom", function(id, data) {
    return {
        type: ExpressionType.CUSTOM,
        id: id,
        data: data
    };
});
