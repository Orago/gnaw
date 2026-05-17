import { core_plugins } from "./lang/core-plugins.js";
import { PlagueLanguage } from "./lang/language.js";
import { PlagueEnvironment, PlagueSystem } from "./lang/states.js";
import { DataType } from "./lang/variables.js";
const script = `
fn divide (a, b){
	return a / b
}

fn multiply (a,b){
	return a * b
}

let cat = fn (a,b){
	return divide(multiply(a, b), 2)
}

print(cat(5,3))
`;

const script2 = `
fn divide (a, b){
	return a / b
}

fn multiply (a,b){
	return a * b
}

let cat = fn (a,b){
	return divide(multiply(a, b), 2)
}

print(cat(5,3))
`;

const system = new PlagueSystem();
system.plugins = [...core_plugins];

const env = new PlagueEnvironment(system);
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
const statements = PlagueLanguage.parseString(system, script);
// console.log(JSON.stringify(statements, null, 2), ["statements!"]);

PlagueLanguage.run(env, statements);
// const lexed = Lexer.lex(script);
// const tokens = Lexer.tokenize(lexed, {});

// const iter = new TokenIterator(tokens);
// console.log();
