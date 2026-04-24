// 

import { schema, table, t } from 'spacetimedb/server';

// need public and private table for only user and account

export const users = table(
  { name: 'users', public: true },
  {
    userId: t.string().primaryKey(), // xxx-xxx-xxx-xxx
    identity: t.identity().unique(), // in case token change
    name: t.string().unique(),
    online: t.bool(),
  }
);

