import {
	declareEntity,
	EntityRepository,
	EntityFrom,
	EntityOps,
} from "services/entities";
import { shape } from "lib/shapes";
import { DatabaseService } from "services/database";
import { ServiceBase } from "lib/service";
import { ActionsService } from "lib/actions";

export const RootEntity = declareEntity(
	"root",
	shape({ kind: "object", props: {} }),
	{},
);

export interface ActionContext {}

export class BerryEngine {
	public readonly entities: EntityRepository;
	public readonly db: DatabaseService;
	public readonly actions: ActionsService<ActionContext>;

	public readonly root: EntityFrom<typeof RootEntity>;

	private readonly rootEntity: EntityOps<typeof RootEntity>;
	private readonly services: ServiceBase[];

	public constructor() {
		this.db = new DatabaseService();
		this.actions = new ActionsService();
		this.entities = new EntityRepository();
		this.services = [this.db, this.entities];

		this.rootEntity = this.entities.define(RootEntity);
		this.root = this.rootEntity.create({});
	}

	public async init() {
		for (const service of this.services) {
			await service.init();
		}
	}
}
