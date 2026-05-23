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
export var default_language_dicitionary = {
    // grouping
    brace_left: [
        "{"
    ],
    brace_right: [
        "}"
    ],
    bracket_left: [
        "["
    ],
    bracket_right: [
        "]"
    ],
    parenthesis_left: [
        "("
    ],
    parenthesis_right: [
        ")"
    ],
    // operators
    plus: [
        "+"
    ],
    minus: [
        "-"
    ],
    star: [
        "*"
    ],
    slash: [
        "/"
    ],
    equals: [
        "="
    ],
    greater_than: [
        ">"
    ],
    less_than: [
        "<"
    ],
    exclamation: [
        "!"
    ],
    hashtag: [
        "#"
    ],
    is: [
        "=="
    ],
    not: [
        "!="
    ],
    cast: [
        "as"
    ],
    // punctuation
    comma: [
        ","
    ],
    dot: [
        "."
    ],
    colon: [
        ":"
    ],
    semicolon: [
        ";"
    ],
    newline: [
        "\n"
    ],
    indent: [
        "\t"
    ],
    question_mark: [
        "?"
    ],
    // extra
    boolean_true: [
        "true"
    ],
    boolean_false: [
        "false"
    ],
    operators: [
        "+",
        "-",
        "<",
        ">",
        ".",
        ",",
        "/",
        ":"
    ],
    delimiters: [
        "{",
        "}",
        "(",
        ")",
        "[",
        "]"
    ]
};
var TypeHandler = function TypeHandler() {
    "use strict";
    _class_call_check(this, TypeHandler);
};
_define_property(TypeHandler, "isNum", function(num) {
    return !isNaN(Number(num));
});
_define_property(TypeHandler, "isA0", function(x) {
    return x != undefined && /[a-z0-9]/i.test(x);
});
_define_property(TypeHandler, "isA_0", function(x) {
    return x != undefined && /[a-z0-9_]/i.test(x);
});
_define_property(TypeHandler, "str_reg", /(['"])(.*?)\1/);
_define_property(TypeHandler, "isString", function(input) {
    return TypeHandler.str_reg.test(input);
});
_define_property(TypeHandler, "parseString", function(input) {
    var _TypeHandler_str_reg_exec;
    return (_TypeHandler_str_reg_exec = TypeHandler.str_reg.exec(input)) === null || _TypeHandler_str_reg_exec === void 0 ? void 0 : _TypeHandler_str_reg_exec[2];
});
export var Lexer = /*#__PURE__*/ function() {
    "use strict";
    function Lexer() {
        _class_call_check(this, Lexer);
    }
    _create_class(Lexer, null, [
        {
            key: "lex",
            value: function lex(input) {
                var output = input.match(/(['"])(.*?)\1|\w+|(?!\\)[~!@#$%^&*{}()-_+"'\\/.;:\[\]\s]|[\uD83C-\uDBFF\uDC00-\uDFFF]+/g);
                if (output == null) {
                    throw "This is a blank file!";
                }
                while(output.indexOf(" ") != -1){
                    output.splice(output.indexOf(" "), 1);
                }
                return output;
            }
        },
        {
            key: "chunk",
            value: /**
	 *  @deprecated
	 */ function chunk(lexed, options) {
                var _ref;
                var line_end = Array.isArray(options === null || options === void 0 ? void 0 : options.line_end) ? options.line_end : [
                    (_ref = options === null || options === void 0 ? void 0 : options.line_end) !== null && _ref !== void 0 ? _ref : ";"
                ];
                var chunks = [];
                var chunk = [];
                var scope_depth = 0;
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = lexed[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var item = _step.value;
                        if (item === "{") scope_depth++;
                        else if (item === "}") {
                            scope_depth--;
                            if (scope_depth == 0) {
                                chunk.push(item);
                                chunks.push(chunk);
                                chunk = [];
                                continue;
                            }
                        }
                        if (line_end.includes(item) && scope_depth === 0) {
                            chunks.push(chunk);
                            chunk = [];
                        } else if (![
                            "\n",
                            "\t",
                            "\r"
                        ].includes(item)) chunk.push(item);
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
                return chunks;
            }
        },
        {
            key: "_parseOperator",
            value: function _parseOperator(value, keywords) {
                if (value == undefined) return undefined;
                if (keywords.plus.includes(value)) {
                    return TokenType.PLUS; // `+`
                } else if (keywords.minus.includes(value)) {
                    return TokenType.MINUS; // `-`
                } else if (keywords.star.includes(value)) {
                    return TokenType.STAR; // `*`
                } else if (keywords.slash.includes(value)) {
                    return TokenType.SLASH; // `/`
                } else if (keywords.equals.includes(value)) {
                    return TokenType.EQUAL; // `=`
                } else if (keywords.exclamation.includes(value)) {
                    return TokenType.EXCLAMATION; // `!`
                } else if (keywords.less_than.includes(value)) {
                    return TokenType.LESS_THAN; // `<`
                } else if (keywords.greater_than.includes(value)) {
                    return TokenType.GREATER_THAN; // `>`
                }
                return undefined;
            }
        },
        {
            key: "_parsePunctuation",
            value: function _parsePunctuation(value, keywords) {
                if (keywords.comma.includes(value)) {
                    return TokenType.COMMA;
                } else if (keywords.dot.includes(value)) {
                    return TokenType.DOT;
                } else if (keywords.colon.includes(value)) {
                    return TokenType.COLON;
                } else if (keywords.semicolon.includes(value)) {
                    return TokenType.SEMICOLON;
                } else if (keywords.newline.includes(value)) {
                    return TokenType.NEWLINE;
                } else if (keywords.indent.includes(value)) {
                    return TokenType.INDENT;
                } else if (keywords.question_mark.includes(value)) {
                    return TokenType.QUESTION_MARK;
                }
                return undefined;
            }
        },
        {
            key: "_parseDelimiter",
            value: function _parseDelimiter(value, keywords) {
                if (keywords.brace_left.includes(value)) {
                    return TokenType.BRACE_LEFT;
                } else if (keywords.brace_right.includes(value)) {
                    return TokenType.BRACE_RIGHT;
                } else if (keywords.bracket_left.includes(value)) {
                    return TokenType.BRACKET_LEFT;
                } else if (keywords.bracket_right.includes(value)) {
                    return TokenType.BRACKET_RIGHT;
                } else if (keywords.parenthesis_left.includes(value)) {
                    return TokenType.PAREN_LEFT;
                } else if (keywords.parenthesis_right.includes(value)) {
                    return TokenType.PAREN_RIGHT;
                } else if (keywords.newline.includes(value)) {
                    return TokenType.NEWLINE;
                } else if (keywords.indent.includes(value)) {
                    return TokenType.INDENT;
                }
            }
        },
        {
            key: "parseToken",
            value: function parseToken(lexed, value, index, level, keywords) {
                var token;
                var tmptoken;
                if (keywords.brace_left.includes(value)) {
                    token = {
                        type: TokenType.BRACE_LEFT,
                        group: TokenGroup.DELIMITER,
                        raw: value,
                        value: value,
                        level: ++level
                    };
                } else if (keywords.brace_right.includes(value)) {
                    token = {
                        type: TokenType.BRACE_RIGHT,
                        group: TokenGroup.DELIMITER,
                        raw: value,
                        value: value,
                        level: level--
                    };
                } else if ((tmptoken = this._parseDelimiter(value, keywords)) != undefined) {
                    token = {
                        type: tmptoken,
                        group: TokenGroup.DELIMITER,
                        raw: value,
                        value: value
                    };
                } else if (TypeHandler.isString(value)) {
                    var _TypeHandler_parseString;
                    token = {
                        type: TokenType.STRING,
                        raw: value,
                        value: (_TypeHandler_parseString = TypeHandler.parseString(value)) !== null && _TypeHandler_parseString !== void 0 ? _TypeHandler_parseString : ""
                    };
                } else if ((tmptoken = this._parsePunctuation(value, keywords)) != undefined) {
                    token = {
                        type: tmptoken,
                        group: TokenGroup.PUNCTUATION,
                        raw: value,
                        value: value
                    };
                } else if (!isNaN(Number.parseFloat(value))) {
                    token = {
                        type: TokenType.NUMBER,
                        raw: value,
                        value: Number.parseFloat(value)
                    };
                } else if (keywords.boolean_true.includes(value)) {
                    token = {
                        type: TokenType.NUMBER,
                        group: TokenGroup.BOOLEAN,
                        raw: value,
                        value: +true
                    };
                } else if (keywords.boolean_false.includes(value)) {
                    token = {
                        type: TokenType.NUMBER,
                        group: TokenGroup.BOOLEAN,
                        raw: value,
                        value: +false
                    };
                } else if (keywords.is.includes(value)) {
                    token = {
                        type: TokenType.IS,
                        value: value,
                        raw: value
                    };
                } else if (keywords.not.includes(value)) {
                    token = {
                        type: TokenType.IS,
                        value: value,
                        raw: value
                    };
                } else if (keywords.cast.includes(value)) {
                    token = {
                        type: TokenType.CAST,
                        group: TokenGroup.OPERATOR,
                        value: value,
                        raw: value
                    };
                } else if (keywords.hashtag.includes(value)) {
                    index++;
                    var text = [];
                    while(keywords.newline.includes(lexed[index]) != true){
                        text.push(lexed[++index]);
                    }
                    var string = text.join(" ");
                    token = {
                        type: TokenType.COMMENT,
                        value: string,
                        raw: "#COMMENT: " + string
                    };
                } else if ((tmptoken = this._parseOperator(value, keywords)) != undefined) {
                    token = {
                        type: tmptoken,
                        group: TokenGroup.OPERATOR,
                        raw: value,
                        value: value
                    };
                    var next_value = lexed[index + 1];
                    var next_token = this._parseOperator(next_value, keywords);
                    if (next_token != undefined) {
                        var matching = function matching(left, right) {
                            return token.type == left && next_token == right;
                        };
                        if (matching(TokenType.EQUAL, TokenType.EQUAL)) {
                            token.type = TokenType.IS;
                            token.value = token.value + next_value;
                            token.raw = token.value;
                            index++;
                        } else if (matching(TokenType.EXCLAMATION, TokenType.EQUAL)) {
                            token.type = TokenType.NOT;
                            token.value = token.value + next_value;
                            token.raw = token.value;
                            index++;
                        }
                    }
                } else if (value != "\t" && value != "\r") {
                    token = {
                        type: TokenType.IDENTIFIER,
                        raw: value,
                        value: value
                    };
                }
                return {
                    token: token,
                    level: level,
                    index: index
                };
            }
        },
        {
            key: "tokenize",
            value: function tokenize(lexed, options) {
                var _options_keywords;
                var keywords = (_options_keywords = options.keywords) !== null && _options_keywords !== void 0 ? _options_keywords : default_language_dicitionary;
                var tokens = [];
                var level = 0;
                for(var i = 0; i < lexed.length; i++){
                    var value = lexed[i];
                    var _this_parseToken = this.parseToken(lexed, value, i, level, keywords), token = _this_parseToken.token, new_level = _this_parseToken.level, index = _this_parseToken.index;
                    level = new_level;
                    i = index;
                    tokens.push(token);
                }
                tokens.push({
                    type: TokenType.EOF,
                    raw: "EOF"
                });
                return tokens;
            }
        },
        {
            key: "including",
            value: function including(list, include) {
                return list.filter(function(token) {
                    return include.includes(token.type);
                });
            }
        },
        {
            key: "excluding",
            value: function excluding(list, exclude) {
                return list.filter(function(token) {
                    return exclude.includes(token.type) != true;
                });
            }
        }
    ]);
    return Lexer;
}();
