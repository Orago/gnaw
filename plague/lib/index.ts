import {
	core_plugins,
	DataType,
	Environment,
	Language,
	Parser,
	System,
} from "./lang/index.js";

const script = `
fn get (name: string){
	return 1 if ? == "michael"
	return 3 if ? == "meow"
	return 2 if ? == "ora"
	return 4 if ? == "woa"
	return 5 if ? == "hmm"
	return -1
}

print (get("ora"))
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
