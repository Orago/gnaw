import { core_plugins } from "./lang/core-plugins.js";
import { Statement } from "./lang/interfaces.js";
import { PlagueLanguage } from "./lang/language.js";
import { PlagueEnvironment, PlagueSystem } from "./lang/states.js";
import { DataTypes } from "./lang/variables.js";
const script = `
fn add (a,b){
	return a + b
}


print(add(5,3))
`;

const system = new PlagueSystem();
system.plugins = [...core_plugins];

const env = new PlagueEnvironment(system);
env.root_scope.set("print", {
	type: DataTypes.FUNCTION,
	call(args) {
		console.log(
			">>",
			args.map((e) => ("value" in e ? e.value : Symbol("Custom")))
		);
		return { type: DataTypes.NULL, value: 0 };
	},
});
const statements = PlagueLanguage.parseString(system, script);
// console.log(JSON.stringify(statements, null, 2), ["statements!"]);

PlagueLanguage.run(env, statements);
console.log(env.root_scope);
// const lexed = Lexer.lex(script);
// const tokens = Lexer.tokenize(lexed, {});

// const iter = new TokenIterator(tokens);
// console.log();
