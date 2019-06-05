import { Unwrap, Shape, ObjectShape } from "./shapes";
import { ObjectOfShapes, ObjectShapeResult, ShapeResult } from "./shapes.base";

export function isShape<TShape extends ObjectShape<any>>(
	shape: TShape,
	value: unknown,
	results?: ObjectShapeResult<TShape>,
): value is Unwrap<TShape>;

export function isShape<TShape extends Shape>(
	shape: TShape,
	value: unknown,
	results?: ShapeResult<TShape>,
) {
	if (shape.kind === "object") {
		/* */
	}

	return false;
}
