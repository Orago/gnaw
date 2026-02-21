import { Language } from "./language.js";
import {
	LanguageHandler_Events,
	LanguageHandler_Variables,
} from "./plugins/variables.js";

const text = `
var cat = 5;
var test_reference = ref(cat);
var pluh = ref(test_reference);
var meow = var(pluh);

on player_join
	log("hello!" + var(cat))

on player_message
	if message == "hi":
		log("yes!")
`;

const language = new Language();

language.handlers.inject([
	new LanguageHandler_Variables(),
	new LanguageHandler_Events(),
]);
try {
	language.eval(text);
} catch (e) {
	console.error(e);
}
console.log(language.handlers.get("variables"));
