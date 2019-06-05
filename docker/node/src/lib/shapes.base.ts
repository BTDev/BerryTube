export type MakeOptional<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>> &
	{ [TProp in K]?: T[TProp] };

export type Unwrap<T> = T extends ArrayShape<infer TItem>
	? UnwrapArray<TItem>
	: T extends ObjectShape<infer TProps>
	? UnwrapObject<TProps>
	: T extends StringShape
	? string
	: T extends VoidShape
	? void
	: T extends NumberShape
	? number
	: never;

export type UnwrapObject<TProps extends ObjectOfShapes> = {
	[TProp in keyof TProps]: Unwrap<TProps[TProp]>
};

export interface UnwrapArray<T> extends Array<Unwrap<T>> {}

export type ShapeKind = "object" | "array" | "string" | "number" | "void";

export type ShapeSettings =
	| ObjectShapeSettings<ObjectOfShapes>
	| ArrayShapeSettings<Shape>
	| StringShapeSettings
	| NumberShapeSettings
	| VoidShapeSettings;

export type Shape =
	| ObjectShape<any>
	| ArrayShape<any>
	| StringShape
	| NumberShape
	| VoidShape;

export interface ShapeSettingsBase {
	kind: ShapeKind;
	isNullable?: boolean;
}

export interface ShapeBase<T> {
	readonly kind: ShapeKind;
	readonly default: T;
	readonly isNullable?: boolean;
}

export interface ObjectOfShapes {
	readonly [prop: string]: Shape;
}

export type ExtractObjectProps<T> = T extends ObjectShape<infer TProps>
	? TProps
	: never;

export interface ObjectShapeSettings<TProps extends ObjectOfShapes>
	extends ShapeSettingsBase {
	kind: "object";
	props: TProps;
}

export interface ObjectShape<TProps extends ObjectOfShapes>
	extends ShapeBase<UnwrapObject<TProps>> {
	readonly kind: "object";
	readonly props: TProps;
}

export interface ArrayShapeSettings<TItem extends Shape>
	extends ShapeSettingsBase {
	kind: "array";
	item: TItem;
}

export interface ArrayShape<TItem extends Shape>
	extends ShapeBase<UnwrapArray<TItem>> {
	readonly kind: "array";
	readonly item: TItem;
}

export interface StringValidationOptions {
	min?: { value: number; message?: string };
	max?: { value: number; message?: string };
	regex?: { value: RegExp; message?: string };
}

export interface StringShapeSettings
	extends ShapeSettingsBase,
		StringValidationOptions {
	kind: "string";
	type?: StringType;
	default?: string;
}

export type StringType = "text" | "password";

export interface StringShape
	extends ShapeBase<string>,
		Readonly<StringValidationOptions> {
	readonly kind: "string";
	readonly type: StringType;
}

export interface NumberValidationOptions {
	min?: { value: number; message?: string };
	max?: { value: number; message?: string };
}

export interface NumberShapeSettings
	extends ShapeSettingsBase,
		StringValidationOptions {
	kind: "number";
	default?: number;
}

export interface NumberShape
	extends ShapeBase<number>,
		Readonly<NumberValidationOptions> {
	readonly kind: "number";
}

export interface VoidShapeSettings extends ShapeSettingsBase {
	kind: "void";
}

export interface VoidShape extends ShapeBase<void> {
	kind: "void";
}

export type ShapeResult<T extends Shape> = T extends ObjectShape<infer TProps>
	? { [TProp in keyof TProps]: ShapeResult<TProps[TProp]> }
	: T extends ArrayShape<infer TItem>
	? ArrayShapeResult<TItem>
	: ScalarShapeResult;

export interface ScalarShapeResult {
	readonly errors: string[];
}

export interface ObjectShapeResult<TShape extends ObjectShape<any>>
	extends ScalarShapeResult {
	readonly props: ShapeResult<TShape>;
}

export interface ArrayShapeResult<TItemShape extends Shape>
	extends ScalarShapeResult {
	readonly items: { [index: string]: ShapeResult<TItemShape> };
}

export interface ShapeVisitor {
	pushProperty(property: string): void;
	pushIndex(index: number): void;
}
