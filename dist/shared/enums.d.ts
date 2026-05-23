export declare enum BinaryMethod {
    ADD = 0,
    SUBTRACT = 1,
    MULTIPLY = 2,
    DIVIDE = 3,
    GREATER_THAN = 4,
    LESS_THAN = 5,
    IS = 6,
    NOT = 7,
    EXCLAMATION = 8,
    AND = 9,
    OR = 10,
    ASSIGN = 11,
    DOT = 12
}
export declare enum StatementType {
    CUSTOM = 0,
    VARIABLE = 1,
    EXPRESSION = 2,
    FUNCTION = 3,
    RETURN = 4,
    IF = 5,
    FORLOOP = 6
}
export declare enum ExpressionType {
    CUSTOM = 0,
    NUMBER = 1,
    STRING = 2,
    BOOLEAN = 3,
    IDENTIFIER = 4,
    CALL = 5,
    MEMBER_ACCESS = 6,
    BINARY = 7,
    UNARY = 8,
    FUNCTION = 9,
    ASSIGN = 10,
    IMPL = 11,
    TYPE_REF = 12
}
export declare enum LogicPriority {
    LOWEST = 0,
    ASSIGN = 1,
    OR = 2,
    AND = 3,
    EQUALITY = 4,
    COMPARE = 5,
    TERM = 6,
    FACTOR = 7,
    UNARY = 8,
    CALL = 9,
    MEMBER = 10
}
