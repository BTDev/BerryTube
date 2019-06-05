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
} from "./shapes.base";

export function shape<TProps extends ObjectOfShapes>(
	settings: ObjectShapeSettings<TProps>,
): ObjectShape<TProps>;

export function shape<TItem extends Shape>(
	settings: ArrayShapeSettings<TItem>,
): ArrayShape<TItem>;

export function shape(shape: StringShapeSettings): StringShape;

export function shape(shape: NumberShapeSettings): NumberShape;

export function shape(shape: VoidShapeSettings): VoidShape;

export function shape(settings: ShapeSettings): Shape {
	if (settings.kind === "object") {
		return {
			...settings,
			default: Object.entries(settings.props).reduce(
				(acc, [name, value]) => {
					acc[name] = value.default;
					return acc;
				},
				{} as any,
			),
		};
	}

	if (settings.kind === "array") {
		return {
			...settings,
			default: [],
		};
	}

	if (settings.kind === "string") {
		return {
			...settings,
			default: settings.default || "",
			type: settings.type || "text",
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
			...settings,
			default: 0,
		};
	}

	throw new Error("bad shape kind");
}
