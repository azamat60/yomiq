import Dexie, { type EntityTable } from 'dexie';
import type { Entry, Favorite, Profile } from './types';

export class YomiqDb extends Dexie {
  profile!: EntityTable<Profile, 'id'>;
  entries!: EntityTable<Entry, 'id'>;
  favorites!: EntityTable<Favorite, 'id'>;

  constructor() {
    super('yomiq');
    this.version(1).stores({
      profile: 'id',
      entries: 'id, date, [date+meal], createdAt',
      favorites: 'id, name, lastUsedAt, usageCount',
    });
  }
}

export const db = new YomiqDb();
