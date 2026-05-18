import { core_plugins } from "./lang/core-plugins.js";
import { PlagueLanguage } from "./lang/language.js";
import { Parser } from "./lang/parser.js";
import { Environment, System } from "./lang/states.js";
import { DataType } from "./lang/variables.js";
const script = `
// test meow
for i = (1,1) {
	print("count", i)
}

`;

const script2 = `fn paddedDimensions (x, y, width, height, padding){
  return [x + padding, y + padding, x + width - padding * 2, y + width - padding * 2]
}

print(paddedDimensions(0, 0, 500, 500, 20))`;

const system = new System();
system.plugins = [...core_plugins];

const env = new Environment(system);
env.root_scope.set("print", {
	type: DataType.FUNCTION,
	call(args) {
		console.log(
			">>",
			args.map((e) => ("value" in e ? e.value : Symbol("Custom")))
		);
		return { type: DataType.NULL, value: 0 };
	},
});
const statements = Parser.parseString(system, script);
// console.log(JSON.stringify(statements, null, 2), ["statements!"]);

PlagueLanguage.run(env, statements);
// const lexed = Lexer.lex(script);
// const tokens = Lexer.tokenize(lexed, {});

// const iter = new TokenIterator(tokens);
// console.log();
