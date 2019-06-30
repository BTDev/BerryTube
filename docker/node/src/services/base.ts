import { ObjectShape, Unwrap, Shape } from "lib/shapes";
import { CanDo } from "lib/auth";
import { VoidShape } from "lib/shapes.base";

export type DeclarationType =
	| "query"
	| "command"
	| "event"
	| "entity"
	| "attachment";

export interface BaseDecl {
	type: DeclarationType;
}

export interface EntityDecl<
	T extends ObjectShape<any> = ObjectShape<any>,
	TKey extends string = any
> extends BaseDecl {
	readonly type: "entity";
	readonly name: TKey;
	readonly shape: T;
	readonly default: Unwrap<T>;
}

export interface AttachmentDecl<
	T extends ObjectShape<any> = ObjectShape<any>,
	TEntityDecls = any
> extends BaseDecl {
	readonly targets: TEntityDecls[];
	readonly name: string;
	readonly shape: T;
	readonly default: Unwrap<T>;
}

export type ActionType = "query" | "command" | "event";

export interface ActionDecl<
	TType extends ActionType = any,
	TActionName extends string = any,
	TInShape = Shape,
	TOutShape = Shape
> extends BaseDecl {
	readonly type: TType;
	readonly name: TActionName;
	readonly inShape: TInShape;
	readonly outShape: TOutShape;
	readonly can: CanDo;
}

export type Declaration =
	| EntityDecl
	| AttachmentDecl
	| ActionDecl<"query">
	| ActionDecl<"command", any, any, VoidShape>
	| ActionDecl<"event", any, any, VoidShape>;

export class ServiceBase {
	public async init() {
		/* */
	}
}
