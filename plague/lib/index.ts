import { core_plugins } from "./lang/core-plugins.js";
import { Language } from "./lang/language.js";
import { Parser } from "./lang/parser.js";
import { Environment, System } from "./lang/states.js";
import { DataType } from "./lang/variables.js";
const script = `
fn getAge(name){
	if name == "john" {
		return 32
	}
	if name == "michael" {
		return 20
	}

	if name == "dave" {
		return 21
	}

	if name == "rob" {
		return 38
	}
	return 0
}

print(getAge("meow"))
`;

const script2 = `
fn paddedDimensions (x, y, width, height, padding){
  return [x + padding, y + padding, x + width - padding * 2, y + width - padding * 2]
}

print(paddedDimensions(0, 0, 500, 500, 20))
`;

const system = new System();
system.plugins = [...core_plugins];

const env = new Environment(system);
env.root_scope.set("print", {
	type: DataType.FUNCTION,
	call(ctx) {
		console.log(
			">>",
			ctx.args.map((e) => ("value" in e ? e.value : Symbol("Custom")))
		);
		return { type: DataType.NULL, value: 0 };
	},
});
const statements = Parser.parseString(system, script);
// console.log(JSON.stringify(statements, null, 2), ["statements!"]);

Language.run(env, statements);
// const lexed = Lexer.lex(script);
// const tokens = Lexer.tokenize(lexed, {});

// const iter = new TokenIterator(tokens);
// console.log();
