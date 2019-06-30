import { Unwrap, Shape, ObjectShape } from "./shapes";
import { ObjectOfShapes, ObjectShapeResult, ShapeResult } from "./shapes.base";

export function isShape<TShape extends Shape>(
	shape: TShape,
	value: unknown,
	results?: ShapeResult<TShape>,
): value is Unwrap<TShape> {
	if (shape.kind === "object") {
		/* */
	}

	return false;
}
