import { PlagueLanguage } from "./lang/plague-lang-main.js";
import { Lexer } from "./lexer.js";
import TokenIterator from "./token-iterator.js";
import { TokenType } from "./tokens.js";

const script = `let cat = "mittens"`;
const script2 = `let cat = "mittens"`;

// const lexed = Lexer.lex(script);
// const tokens = Lexer.tokenize(lexed, {});

// const iter = new TokenIterator(tokens);
const language = new PlagueLanguage().parseString(script);
console.log(JSON.stringify(language, null, 2));
