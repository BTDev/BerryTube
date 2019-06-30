import { shape } from "./shapes.ctor";

export * from "./shapes.base";
export * from "./shapes.ctor";
export * from "./shapes.is";

export const VoidShape = shape({ kind: "void", isNullable: true });

export const StringShape = shape({ kind: "string" });

export const NullableStringShape = shape({ kind: "string", isNullable: true });

export const StringArrayShape = shape({ kind: "array", item: StringShape });

export const NumberShape = shape({ kind: "number" });

export const NullableNumberShape = shape({ kind: "number", isNullable: true });

export const NumberArrayShape = shape({ kind: "array", item: NumberShape });

export const BooleanShape = shape({ kind: "boolean" });

export const NullableBooleanShape = shape({
	kind: "boolean",
	isNullable: true,
});
