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
import { StatementType } from "../shared/enums.js";
import { ExpressionParser } from "./expressions.js";
export var StatementParser = /*#__PURE__*/ function() {
    "use strict";
    function StatementParser() {
        _class_call_check(this, StatementParser);
    }
    _create_class(StatementParser, null, [
        {
            key: "parse",
            value: function parse(ctx) {
                var iterator = ctx.iterator;
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = ctx.system.statement_handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var handler = _step.value;
                        if (iterator.match(handler.case)) {
                            if (handler.trim_case == true) {
                                iterator.expect(handler.case);
                            }
                            return handler.createStatement(ctx);
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
                return {
                    type: StatementType.EXPRESSION,
                    expression: ExpressionParser.parse(ctx)
                };
            }
        }
    ]);
    return StatementParser;
}();
