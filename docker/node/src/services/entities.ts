import { ObjectShape, Unwrap } from "lib/shapes";
import { ServiceBase, EntityDecl, AttachmentDecl } from "services/base";

export function declareEntity<
	TShape extends ObjectShape<any>,
	TEntityName extends string
>(
	name: TEntityName,
	shape: TShape,
	defaultValue: Unwrap<TShape>,
): EntityDecl<TShape, TEntityName> {
	return {
		type: "entity",
		name,
		shape,
		default: defaultValue,
	};
}

export function declareAttachment<
	TShape extends ObjectShape<any>,
	TValidEntityDecls
>(
	targets: TValidEntityDecls[],
	name: string,
	shape: TShape,
	defaultValue: Unwrap<TShape>,
): AttachmentDecl<TShape, TValidEntityDecls> {
	return {
		type: "attachment",
		name,
		shape,
		default: defaultValue,
		targets,
	};
}

export class EntityRepository extends ServiceBase {
	public define<TEntityDecl extends EntityDecl>(
		decl: TEntityDecl,
	): EntityOps<TEntityDecl>;

	public define<TAttachmentDecl extends AttachmentDecl>(
		decl: TAttachmentDecl,
	): AttachmentOps<TAttachmentDecl>;

	public define<TThing>(arg: any): any {}
}

// oof...

export type ExtractShapeFromEntityDecl<
	T extends EntityDecl
> = T extends EntityDecl<infer TShape> ? TShape : never;

export type ExtractPropsFromEntityDecl<
	T extends EntityDecl
> = T extends EntityDecl<infer TShape> ? Unwrap<TShape> : never;

export type ExtractKeyFromEntityDecl<
	T extends EntityDecl
> = T extends EntityDecl<any, infer TKey> ? TKey : never;

export type EntityFrom<T extends EntityDecl> = T extends EntityDecl<
	infer TShape
>
	? Unwrap<TShape> & { id: number; type: ExtractKeyFromEntityDecl<T> }
	: never;

export type ExtractShapeFromAttachmentDecl<
	T extends AttachmentDecl
> = T extends AttachmentDecl<infer TShape> ? TShape : never;

export type ExtractPropsFromAttachmentDecl<
	T extends AttachmentDecl
> = T extends AttachmentDecl<infer TShape> ? Unwrap<TShape> : never;

export type ExtractEntitiesFromAttachmentDecl<
	T extends AttachmentDecl
> = T extends AttachmentDecl<any, infer TEntityDecl> ? TEntityDecl : never;

export type AttachmentFrom<T extends AttachmentDecl> = T extends AttachmentDecl<
	infer TShape
>
	? Unwrap<TShape>
	: never;

export type CreateEntity<TEntityDecl extends EntityDecl> = (
	props: Partial<ExtractPropsFromEntityDecl<TEntityDecl>>,
) => EntityFrom<TEntityDecl>;

export type UpdateEntity<TEntityDecl extends EntityDecl> = (
	entityOrId: number | EntityFrom<TEntityDecl>,
	props: Partial<ExtractPropsFromEntityDecl<TEntityDecl>>,
) => void;

export type DeleteEntity<TEntityDecl extends EntityDecl> = (
	entityOrId: number | EntityFrom<TEntityDecl>,
) => boolean;

export interface EntityOps<TEntityDecl extends EntityDecl> {
	create: CreateEntity<TEntityDecl>;
	update: UpdateEntity<TEntityDecl>;
	delete: DeleteEntity<TEntityDecl>;
}

export type SetAttachment<TAttachmentDecl extends AttachmentDecl> = (
	entity: {
		type: ExtractKeyFromEntityDecl<
			ExtractEntitiesFromAttachmentDecl<TAttachmentDecl>
		>;
	},
	props: Partial<AttachmentFrom<TAttachmentDecl>>,
) => AttachmentFrom<TAttachmentDecl>;

export interface AttachmentOps<TAttachmentDecl extends AttachmentDecl> {
	set: SetAttachment<TAttachmentDecl>;
}
