import { System } from "../shared/data.js";
import type TokenIterator from "./token-iterator.js";

export interface ParserContext {
	iterator: TokenIterator;
	system: System;
}
