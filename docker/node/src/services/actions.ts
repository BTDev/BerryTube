import { Shape, Unwrap, VoidShape } from "lib/shapes";
import { AuthInfo, CanDo } from "lib/auth";
import { Disposable } from "lib/types";
import { ServiceBase, ActionDecl } from "services/base";
import { returnTrue } from "lib/funcs";

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

export function declareQuery<
	TActionName extends string = any,
	TInShape = Shape,
	TOutShape = Shape
>(
	name: TActionName,
	inShape: TInShape,
	outShape: TOutShape,
	can: CanDo,
): ActionDecl<"query", TActionName, TInShape, TOutShape> {
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
): ActionDecl<"command", TActionName, TInShape, typeof VoidShape> {
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
): ActionDecl<"event", TActionName, TInShape, typeof VoidShape> {
	return {
		type: "event",
		name,
		inShape,
		outShape: VoidShape,
		can: returnTrue,
	};
}

export type EventController<TAction extends ActionDecl> = (
	param: ExtractActionIn<TAction>,
) => void;

export class ActionsService<TContext> extends ServiceBase {
	public dispatch<TAction extends ActionDecl<"query">>(
		action: TAction,
		param: ExtractActionIn<TAction>,
		context: TContext,
	): Promise<ExtractActionOut<TAction>>;

	public dispatch<
		TAction extends ActionDecl<"command", any, any, typeof VoidShape>
	>(
		action: TAction,
		param: ExtractActionIn<TAction>,
		context: TContext,
	): Promise<void>;

	public dispatch<TAction extends ActionDecl>(
		action: TAction,
		param: ExtractActionIn<TAction>,
		context: TContext,
	): Promise<ExtractActionOut<TAction>> | Promise<void> {
		return null as any;
	}

	public define<TAction extends ActionDecl<"query">>(
		action: TAction,
		handler: ActionHandler<TContext, TAction>,
	): void;

	public define<
		TAction extends ActionDecl<"command", any, any, typeof VoidShape>
	>(action: TAction, handler: ActionHandler<TContext, TAction>): void;

	public define<
		TAction extends ActionDecl<"event", any, any, typeof VoidShape>
	>(action: TAction): EventController<TAction>;

	public define<TAction extends ActionDecl>(
		action: TAction,
		handler?: ActionHandler<TContext, TAction>,
	): EventController<TAction> | void {
		/* */
	}
}

export type ActionDispatcher = <TAction extends ActionDecl>(
	action: TAction,
	param: ExtractActionIn<TAction>,
) => Promise<ExtractActionOut<TAction>>;

export type ActionHandler<TContext, TAction extends ActionDecl> = (
	param: ExtractActionIn<TAction>,
	context: TContext,
	action: TAction,
) => Promise<ExtractActionOut<TAction>>;

export type RegisterActionHandler<TContext> = <TAction extends ActionDecl>(
	action: TAction,
	handler: ActionHandler<TContext, TAction>,
) => Disposable;

export type ExtractActionInShape<T extends ActionDecl> = T extends ActionDecl<
	any,
	any,
	infer TShape
>
	? TShape
	: never;

export type ExtractActionOutShape<T extends ActionDecl> = T extends ActionDecl<
	any,
	any,
	any,
	infer TShape
>
	? TShape
	: never;

export type ExtractActionIn<T extends ActionDecl> = T extends ActionDecl<
	any,
	any,
	infer TShape
>
	? Unwrap<TShape>
	: never;

export type ExtractActionOut<T extends ActionDecl> = T extends ActionDecl<
	any,
	any,
	any,
	infer TShape
>
	? Unwrap<TShape>
	: never;
