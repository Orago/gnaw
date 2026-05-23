import { BinaryMethod } from "../shared/enums.js";
import { type DataValue, type DataValueOf, DataType } from "../shared/variables.js";
type OpMap<A extends DataType, B extends DataType> = (left: DataValueOf<A>, right: DataValueOf<B>) => DataValue;
type MethodDict = {
    [A in DataType]?: {
        [B in DataType]?: {
            [C in BinaryMethod]?: OpMap<A, B>;
        };
    };
};
export declare class DataOperations {
    private static filter;
    static Dict: MethodDict;
    static apply<L extends DataValue, R extends DataValue>(left: L, op: BinaryMethod, right: R): any;
}
export {};
