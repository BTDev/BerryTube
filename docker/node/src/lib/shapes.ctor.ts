import {
	ObjectShapeSettings,
	ObjectOfShapes,
	ObjectShape,
	Shape,
	ArrayShapeSettings,
	ArrayShape,
	StringShapeSettings,
	StringShape,
	ShapeSettings,
	VoidShapeSettings,
	VoidShape,
	NumberShapeSettings,
	NumberShape,
	BooleanShapeSettings,
	BooleanShape,
} from "./shapes.base";

export function shape<TProps extends ObjectOfShapes>(
	settings: ObjectShapeSettings<TProps>,
): ObjectShape<TProps>;

export function shape<TItem extends Shape>(
	settings: ArrayShapeSettings<TItem>,
): ArrayShape<TItem>;

export function shape(shape: StringShapeSettings): StringShape;

export function shape(shape: NumberShapeSettings): NumberShape;

export function shape(shape: BooleanShapeSettings): BooleanShape;

export function shape(shape: VoidShapeSettings): VoidShape;

export function shape(settings: ShapeSettings): Shape {
	if (settings.kind === "object") {
		return {
			default: Object.entries(settings.props).reduce(
				(acc, [name, value]) => {
					acc[name] = value.default;
					return acc;
				},
				{} as any,
			),
			...settings,
		};
	}

	if (settings.kind === "array") {
		return {
			default: [],
			...settings,
		};
	}

	if (settings.kind === "string") {
		return {
			default: "",
			type: "text",
			...settings,
		};
	}

	if (settings.kind === "void") {
		return {
			...settings,
			default: undefined,
		};
	}

	if (settings.kind === "number") {
		return {
			default: 0,
			...settings,
		};
	}

	if (settings.kind === "boolean") {
		return {
			default: false,
			...settings,
		};
	}

	throw new Error("bad shape kind");
}
