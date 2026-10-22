import { defineConfig } from "tsdown";

const entry: string[] = ["lib/index.ts", "lib/plugin/core-plugins.ts"];

export default defineConfig([
	{
		entry,
		format: ["esm", "cjs"],
		dts: true,
		// sourcemap: true,
		clean: true,
		minify: true,
		outExtensions: () => ({
			dts: ".d.ts",
		}),
	},
]);
