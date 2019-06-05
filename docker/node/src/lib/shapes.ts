import { shape } from "./shapes.ctor";

export * from "./shapes.base";
export * from "./shapes.ctor";
export * from "./shapes.is";

export const VoidShape = shape({ kind: "void", isNullable: true });
