import { boundMethod } from "autobind-decorator";
import {
	declareEntity,
	EntityRepository,
	EntityFrom,
	EntityOps,
	AttachmentOps,
} from "services/entities";
import { shape, VoidShape } from "lib/shapes";
import { DatabaseService } from "services/database";
import {
	ServiceBase,
	EntityDecl,
	AttachmentDecl,
	ActionDecl,
	DeclarationType,
} from "services/base";
import {
	ActionsService,
	ActionHandler,
	EventController,
} from "services/actions";
import { Logger } from "services/logger";
import { Session } from "inspector";
import { SessionRepository } from "services/sessions";

export const RootEntity = declareEntity(
	"root",
	shape({ kind: "object", props: {} }),
	{},
);

export interface ActionContext {}

export class BerryEngine {
	public readonly log: Logger;
	public readonly entities: EntityRepository;
	public readonly db: DatabaseService;
	public readonly actions: ActionsService<ActionContext>;
	public readonly sessions: SessionRepository;
	public readonly server: Session;

	public readonly root: EntityFrom<typeof RootEntity>;

	private readonly rootEntity: EntityOps<typeof RootEntity>;
	private readonly services: ServiceBase[];

	public constructor() {
		this.log = new Logger();
		this.db = new DatabaseService();
		this.sessions = new SessionRepository();
		this.actions = new ActionsService();
		this.entities = new EntityRepository();
		this.services = [this.db, this.sessions, this.actions, this.entities];

		this.rootEntity = this.entities.define(RootEntity);
		this.root = this.rootEntity.create({});
	}

	public async init() {
		for (const service of this.services) {
			await service.init();
		}
	}

	public define<TEntityDecl extends EntityDecl>(
		decl: TEntityDecl,
	): EntityOps<TEntityDecl>;

	public define<TAttachmentDefinition extends AttachmentDecl>(
		definition: TAttachmentDefinition,
	): AttachmentOps<TAttachmentDefinition>;

	public define<TAction extends ActionDecl<"query">>(
		action: TAction,
		handler: ActionHandler<ActionContext, TAction>,
	): void;

	public define<
		TAction extends ActionDecl<"command", any, any, typeof VoidShape>
	>(action: TAction, handler: ActionHandler<ActionContext, TAction>): void;

	public define<
		TAction extends ActionDecl<"event", any, any, typeof VoidShape>
	>(action: TAction): EventController<TAction>;

	@boundMethod
	public define(decl: { type: DeclarationType }, ...args: any[]): any {
		if (decl.type === "entity" || decl.type === "attachment") {
			return (this.entities as any).define(decl, ...args);
		}

		if (
			decl.type === "query" ||
			decl.type === "command" ||
			decl.type === "event"
		) {
			return (this.actions as any).define(decl, ...args);
		}
	}
}
