import Dexie, { type EntityTable } from 'dexie';
import type { Entry, Favorite, Insight, Profile } from './types';

export class YomiqDb extends Dexie {
  profile!: EntityTable<Profile, 'id'>;
  entries!: EntityTable<Entry, 'id'>;
  favorites!: EntityTable<Favorite, 'id'>;
  insights!: EntityTable<Insight, 'id'>;

  constructor() {
    super('yomiq');
    this.version(1).stores({
      profile: 'id',
      entries: 'id, date, [date+meal], createdAt',
      favorites: 'id, name, lastUsedAt, usageCount',
    });

    this.version(2)
      .stores({
        entries: 'id, date, [date+meal], createdAt, eatenAt',
        insights: 'id, createdAt',
      })
      .upgrade((tx) =>
        tx
          .table<Entry>('entries')
          .toCollection()
          .modify((entry) => {
            entry.eatenAt ??= entry.createdAt;
          }),
      );
  }
}

export const db = new YomiqDb();
