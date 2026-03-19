import { getDB } from '../db/connection.js';

export async function createIndexes() {
  const db = getDB();

  await db.collection('users').createIndexes([
    { key: { email: 1 }, unique: true },
    { key: { displayName: 1 }, unique: true },
  ]);

  await db.collection('ideas').createIndexes([
    { key: { authorId: 1 } },
    { key: { category: 1 } },
    { key: { verdict: 1 } },
    { key: { createdAt: -1 } },
    { key: { totalRoastCoinInvested: -1 } },
    { key: { roastCount: -1 } },
    { key: { defenseCount: -1 } },
    {
      key: { title: 'text', pitch: 'text' },
      weights: { title: 10, pitch: 5 },
      name: 'ideas_text',
    },
  ]);

  await db
    .collection('roasts')
    .createIndexes([
      { key: { ideaId: 1, deleted: 1 } },
      { key: { authorId: 1, ideaId: 1 }, unique: true },
      { key: { authorId: 1 } },
    ]);

  await db
    .collection('defenses')
    .createIndexes([
      { key: { ideaId: 1, deleted: 1 } },
      { key: { roastId: 1, deleted: 1 } },
      { key: { authorId: 1, roastId: 1 }, unique: true },
      { key: { authorId: 1, ideaId: 1 } },
      { key: { authorId: 1 } },
    ]);

  await db
    .collection('backs')
    .createIndexes([
      { key: { ideaId: 1 } },
      { key: { backerId: 1 } },
      { key: { ideaId: 1, backerId: 1 } },
    ]);

  console.log('Indexes created');
}
