import {
	CustomExpression,
	type Expression,
	ExpressionOf,
	ExpressionType,
	StatementType,
} from "../lang/interfaces.js";
import { FunctionUtil, Language } from "../lang/language.js";
import { Parser } from "../lang/parser.js";
import { Plugin } from "../lang/plugin-utility.js";
import { DataType, DataValue, DataValueOf, Var } from "../lang/variables.js";
import { TokenType } from "../tokens.js";
import Emitter, { Signal } from "./emitter.js";

interface SignalDataValue {
	type: DataType.CUSTOM;
	id: "signal-instance";
	value: {
		emitter: Signal;
		refs: Map<DataValueOf<DataType.FUNCTION>, Function>;
	};
}
interface EmitterDataValue {
	type: DataType.CUSTOM;
	id: "emitter-instance";
	value: {
		emitter: Emitter;
		refs: Map<DataValueOf<DataType.FUNCTION>, Function>;
	};
}

export class EmitterPlugin extends Plugin {
	static IsEmitterData(data: DataValue): data is EmitterDataValue {
		return Var.is(data, DataType.CUSTOM) && data.id == "emitter-instance";
	}
	id = "emitter";
	constructor() {
		super();

		const instance_id: EmitterDataValue["id"] = "emitter-instance";

		const createEmitter = Plugin.wrapFunction(
			"emitter",
			{
				type: DataType.FUNCTION,
				call: (): EmitterDataValue => {
					return {
						type: DataType.CUSTOM,
						id: instance_id,
						value: {
							emitter: new Emitter(),
							refs: new Map(),
						},
					};
				},
			},

			{ readonly: true }
		);

		this.values = () => [createEmitter()];

		this.impl = [
			Plugin.implHandler({
				name: "emit",
				case: (ctx) =>
					ctx.name == "emit" &&
					EmitterPlugin.IsEmitterData(ctx.data) &&
					Var.is(ctx.args[0], DataType.STRING),
				handle: (ctx) => {
					const data = ctx.data as EmitterDataValue;
					const name = ctx.args[0] as DataValueOf<DataType.STRING>;
					data.value.emitter.emit(name.value, ...ctx.args.slice(1));
					return Var.Null();
				},
			}),

			Plugin.implHandler({
				name: "on",
				case: (ctx) =>
					ctx.name == "on" &&
					EmitterPlugin.IsEmitterData(ctx.data) &&
					Var.is(ctx.args[0], DataType.STRING),
				handle: (ctx) => {
					const data = ctx.data as EmitterDataValue;
					const name = ctx.args[0] as DataValueOf<DataType.STRING>;
					const fn = ctx.args[1];

					if (Var.is(fn, DataType.FUNCTION) != true) {
						throw new Error(`Cannot listen to non-function data`);
					}

					const wrapped_fn = (...values: DataValue[]) => {
						FunctionUtil.callFunction(fn, ctx.scope, values);
					};
					data.value.refs.set(fn, wrapped_fn);
					data.value.emitter.on(name.value, wrapped_fn);
					return Var.Null();
				},
			}),

			Plugin.implHandler({
				name: "off",
				case: (ctx) =>
					ctx.name == "off" &&
					EmitterPlugin.IsEmitterData(ctx.data) &&
					Var.is(ctx.args[0], DataType.STRING),
				handle: (ctx) => {
					const data = ctx.data as EmitterDataValue;
					const name = ctx.args[0] as DataValueOf<DataType.STRING>;
					const fn = ctx.args[1];

					if (Var.is(fn, DataType.FUNCTION)) {
						const wrapped_fn = data.value.refs.get(fn);
						data.value.refs.delete(fn);
						data.value.emitter.off(name.value, wrapped_fn);
					} else {
						data.value.emitter.off(name.value);
					}
					return Var.Null();
				},
			}),
		];
	}
}

