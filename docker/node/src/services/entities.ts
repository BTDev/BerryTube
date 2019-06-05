import { ObjectShape, Unwrap } from "lib/shapes";
import { ServiceBase } from "lib/service";

export function declareEntity<
	TShape extends ObjectShape<any>,
	TEntityName extends string
>(
	name: TEntityName,
	shape: TShape,
	defaultValue: Unwrap<TShape>,
): EntityDefinition<TShape, TEntityName> {
	return {
		name,
		shape,
		default: defaultValue,
	};
}

export function declareAttachment<
	TShape extends ObjectShape<any>,
	TValidEntityDefinitions
>(
	targets: TValidEntityDefinitions[],
	name: string,
	shape: TShape,
	defaultValue: Unwrap<TShape>,
): EntityAttachmentDefinition<TShape, TValidEntityDefinitions> {
	return {
		name,
		shape,
		default: defaultValue,
		targets,
	};
}

export class EntityRepository extends ServiceBase {
	public define<TEntityDefinition extends EntityDefinition>(
		definition: TEntityDefinition,
	): EntityOps<TEntityDefinition> {
		return null as any;
	}

	public defineAttachment<
		TAttachmentDefinition extends EntityAttachmentDefinition
	>(definition: TAttachmentDefinition): AttachmentOps<TAttachmentDefinition> {
		return null as any;
	}
}

export interface EntityDefinition<
	T extends ObjectShape<any> = ObjectShape<any>,
	TKey extends string = any
> {
	readonly name: TKey;
	readonly shape: T;
	readonly default: Unwrap<T>;
}

export interface EntityAttachmentDefinition<
	T extends ObjectShape<any> = ObjectShape<any>,
	TEntityDefinitions = any
> {
	readonly targets: TEntityDefinitions[];
	readonly name: string;
	readonly shape: T;
	readonly default: Unwrap<T>;
}

// oof...

export type ExtractShapeFromEntityDefinition<
	T extends EntityDefinition
> = T extends EntityDefinition<infer TShape> ? TShape : never;

export type ExtractPropsFromEntityDefinition<
	T extends EntityDefinition
> = T extends EntityDefinition<infer TShape> ? Unwrap<TShape> : never;

export type ExtractKeyFromEntityDefinition<
	T extends EntityDefinition
> = T extends EntityDefinition<any, infer TKey> ? TKey : never;

export type EntityFrom<T extends EntityDefinition> = T extends EntityDefinition<
	infer TShape
>
	? Unwrap<TShape> & { id: number; type: ExtractKeyFromEntityDefinition<T> }
	: never;

export type ExtractShapeFromAttachmentDefinition<
	T extends EntityAttachmentDefinition
> = T extends EntityAttachmentDefinition<infer TShape> ? TShape : never;

export type ExtractPropsFromAttachmentDefinition<
	T extends EntityAttachmentDefinition
> = T extends EntityAttachmentDefinition<infer TShape> ? Unwrap<TShape> : never;

export type ExtractEntitiesFromAttachmentDefinition<
	T extends EntityAttachmentDefinition
> = T extends EntityAttachmentDefinition<any, infer TEntityDefinitions>
	? TEntityDefinitions
	: never;

export type AttachmentFrom<
	T extends EntityAttachmentDefinition
> = T extends EntityAttachmentDefinition<infer TShape> ? Unwrap<TShape> : never;

export type CreateEntity<TEntityDefinition extends EntityDefinition> = (
	props: Partial<ExtractPropsFromEntityDefinition<TEntityDefinition>>,
) => EntityFrom<TEntityDefinition>;

export type UpdateEntity<TEntityDefinition extends EntityDefinition> = (
	entityOrId: number | EntityFrom<TEntityDefinition>,
	props: Partial<ExtractPropsFromEntityDefinition<TEntityDefinition>>,
) => void;

export type DeleteEntity<TEntityDefinition extends EntityDefinition> = (
	entityOrId: number | EntityFrom<TEntityDefinition>,
) => boolean;

export interface EntityOps<TEntityDefinition extends EntityDefinition> {
	create: CreateEntity<TEntityDefinition>;
	update: UpdateEntity<TEntityDefinition>;
	delete: DeleteEntity<TEntityDefinition>;
}

export type SetAttachment<
	TAttachmentDefinition extends EntityAttachmentDefinition
> = (
	entity: {
		type: ExtractKeyFromEntityDefinition<
			ExtractEntitiesFromAttachmentDefinition<TAttachmentDefinition>
		>;
	},
	props: Partial<AttachmentFrom<TAttachmentDefinition>>,
) => AttachmentFrom<TAttachmentDefinition>;

export interface AttachmentOps<
	TAttachmentDefinition extends EntityAttachmentDefinition
> {
	set: SetAttachment<TAttachmentDefinition>;
}
