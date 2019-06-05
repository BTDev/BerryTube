import { Shape, Unwrap, VoidShape } from "./shapes";
import { AuthInfo, CanDo } from "./auth";
import { Disposable } from "./types";
import { ServiceBase } from "./service";
import { returnTrue } from "./funcs";

// Action types declare in which way the action may be used:

// Queries:
// can be dispatched anywhere, but only handled by the module that declared them. They may return data.
// examples:
//  queries sent internally from the system, such as querying the user service to see if a user can log in or not.

// Commands:
// can be dispatched anywhere, but only handled by the module that declared them. They may not return any data.
// examples:
//  commands sent from the client, such as creating a poll
//  commands sent internally from the system

// Events:
// can only be dispatched by the module that declared them, but may be handled anywhere. They may not return data. They
// also have no concept of authorization.
// examples:
//  Events that are dispatched internally or externally. Examples include notifying clients that polls have been
//  created.

export type ActionType = "query" | "command" | "event";

export interface ActionDefinition<
	TType extends ActionType = any,
	TActionName extends string = any,
	TInShape = Shape,
	TOutShape = Shape
> {
	readonly type: TType;
	readonly name: TActionName;
	readonly inShape: TInShape;
	readonly outShape: TOutShape;
	readonly can: CanDo;
}

export function declareQuery<
	TActionName extends string = any,
	TInShape = Shape,
	TOutShape = Shape
>(
	name: TActionName,
	inShape: TInShape,
	outShape: TOutShape,
	can: CanDo,
): ActionDefinition<"query", TActionName, TInShape, TOutShape> {
	return {
		type: "query",
		name,
		inShape,
		outShape,
		can,
	};
}

export function declareCommand<
	TActionName extends string = any,
	TInShape = Shape
>(
	name: TActionName,
	inShape: TInShape,
	can: CanDo,
): ActionDefinition<"command", TActionName, TInShape, typeof VoidShape> {
	return {
		type: "command",
		name,
		inShape,
		outShape: VoidShape,
		can,
	};
}

export function declareEvent<
	TActionName extends string = any,
	TInShape = Shape
>(
	name: TActionName,
	inShape: TInShape,
): ActionDefinition<"event", TActionName, TInShape, typeof VoidShape> {
	return {
		type: "event",
		name,
		inShape,
		outShape: VoidShape,
		can: returnTrue,
	};
}

export type EventController<TAction extends ActionDefinition> = (
	param: ExtractActionIn<TAction>,
) => void;

export class ActionsService<TContext> extends ServiceBase {
	public dispatch<TAction extends ActionDefinition<"query">>(
		action: TAction,
		param: ExtractActionIn<TAction>,
		context: TContext,
	): Promise<ExtractActionOut<TAction>>;

	public dispatch<
		TAction extends ActionDefinition<"command", any, any, typeof VoidShape>
	>(
		action: TAction,
		param: ExtractActionIn<TAction>,
		context: TContext,
	): Promise<void>;

	public dispatch<TAction extends ActionDefinition>(
		action: TAction,
		param: ExtractActionIn<TAction>,
		context: TContext,
	): Promise<ExtractActionOut<TAction>> | Promise<void> {
		return null as any;
	}

	public define<TAction extends ActionDefinition<"query">>(
		action: TAction,
		handler: ActionHandler<TContext, TAction>,
	): void;

	public define<
		TAction extends ActionDefinition<"command", any, any, typeof VoidShape>
	>(action: TAction, handler: ActionHandler<TContext, TAction>): void;

	public define<
		TAction extends ActionDefinition<"event", any, any, typeof VoidShape>
	>(action: TAction): EventController<TAction>;

	public define<TAction extends ActionDefinition>(
		action: TAction,
		handler?: ActionHandler<TContext, TAction>,
	): EventController<TAction> | void {
		/* */
	}
}

export type ActionDispatcher = <TAction extends ActionDefinition>(
	action: TAction,
	param: ExtractActionIn<TAction>,
) => Promise<ExtractActionOut<TAction>>;

export type ActionHandler<TContext, TAction extends ActionDefinition> = (
	param: ExtractActionIn<TAction>,
	context: TContext,
	action: TAction,
) => Promise<ExtractActionOut<TAction>>;

export type RegisterActionHandler<TContext> = <
	TAction extends ActionDefinition
>(
	action: TAction,
	handler: ActionHandler<TContext, TAction>,
) => Disposable;

export type ExtractActionInShape<
	T extends ActionDefinition
> = T extends ActionDefinition<any, any, infer TShape> ? TShape : never;

export type ExtractActionOutShape<
	T extends ActionDefinition
> = T extends ActionDefinition<any, any, any, infer TShape> ? TShape : never;

export type ExtractActionIn<
	T extends ActionDefinition
> = T extends ActionDefinition<any, any, infer TShape> ? Unwrap<TShape> : never;

export type ExtractActionOut<
	T extends ActionDefinition
> = T extends ActionDefinition<any, any, any, infer TShape>
	? Unwrap<TShape>
	: never;
