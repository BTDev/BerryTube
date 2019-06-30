import { isString } from "./types";

export type StaticTableEntry<TKey, TValue> = TValue & {
	readonly id: TKey;
};

export class StaticTable<TKey extends string | number, TValue> {
	public readonly Id: TKey;
	public readonly Value: TValue;

	public readonly ids: ReadonlyArray<TKey>;
	public readonly values: ReadonlyArray<StaticTableEntry<TKey, TValue>>;
	public readonly map: { [K in TKey]: TValue };

	public constructor(values: Array<StaticTableEntry<TKey, TValue>>) {
		this.Value = this.Id = undefined as any;

		this.values = values;
		this.ids = values.map(i => i.id);
		this.map = values.reduce(
			(acc, item) => {
				acc[item.id] = item;
				return acc;
			},
			{} as any,
		);
	}

	public find(id: TKey): StaticTableEntry<TKey, TValue>;
	public find(id: unknown): StaticTableEntry<TKey, TValue> | null;
	public find(id: unknown) {
		if (!this.isKey(id)) {
			return null;
		}

		return this.map[id];
	}

	public isKey(val: unknown): val is TKey {
		if (!isString(val)) {
			return false;
		}

		return this.map.hasOwnProperty(val);
	}
}
