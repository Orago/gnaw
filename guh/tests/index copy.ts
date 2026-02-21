import { Language } from "./language.js";
import { LanguageHandler_Variables } from "./plugins/variables.js";

const text = `
var cat = 5;
var test_reference = ref(cat);
var pluh = ref(test_reference);

on player_join
	log("hello!" + var(cat))

on player_message
	if message == "hi":
		log("yes!")
`;

const language = new Language();

language.handlers.inject([new LanguageHandler_Variables()]);
language.eval(text);
console.log(language.handlers.get("variables"));
