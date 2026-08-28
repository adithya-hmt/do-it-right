import * as SQLite from 'expo-sqlite';

import type { WorkspaceV3 } from '@/domain/types';
import { fromWorkspaceRecords, toWorkspaceRecords, type EntityRecord, type WorkspaceRecordSet } from '@/lib/workspace-v3-records';
import type { WorkspaceV3Storage } from '@/lib/workspace-v3-repository';

const DATABASE_NAME = 'do-it-right.db';
const COLLECTIONS = ['profile', 'areas', 'projects', 'tasks', 'dayPlans', 'routines', 'routineCompletions', 'focusSessions', 'weeklyReviews', 'syncQueue', 'spaces', 'memberships', 'invitations', 'comments', 'activity', 'notifications'] as const;
type CollectionName = (typeof COLLECTIONS)[number];

let databasePromise: ReturnType<typeof SQLite.openDatabaseAsync> | null = null;

async function database() {
  databasePromise ??= SQLite.openDatabaseAsync(DATABASE_NAME).then(async (db) => {
    await db.withTransactionAsync(async () => {
      const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
      if ((version?.user_version ?? 0) < 3) {
        await db.execAsync(`
          PRAGMA journal_mode = WAL;
          PRAGMA foreign_keys = ON;
          CREATE TABLE IF NOT EXISTS workspaces (
            namespace TEXT PRIMARY KEY NOT NULL,
            meta TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS workspace_entities (
            namespace TEXT NOT NULL,
            collection TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            payload TEXT NOT NULL,
            PRIMARY KEY (namespace, collection, entity_id),
            FOREIGN KEY (namespace) REFERENCES workspaces(namespace) ON DELETE CASCADE
          );
          CREATE INDEX IF NOT EXISTS workspace_entities_lookup
            ON workspace_entities(namespace, collection, entity_id);
          PRAGMA user_version = 3;
        `);
      }
    });
    return db;
  });
  return databasePromise;
}

async function loadCollection(db: Awaited<ReturnType<typeof database>>, namespace: string, collection: CollectionName) {
  return db.getAllAsync<EntityRecord>(
    'SELECT entity_id AS entityId, payload FROM workspace_entities WHERE namespace = ? AND collection = ? ORDER BY rowid',
    namespace,
    collection,
  );
}

export const workspaceV3Storage: WorkspaceV3Storage = {
  async load(namespace) {
    const db = await database();
    const meta = await db.getFirstAsync<{ meta: string }>('SELECT meta FROM workspaces WHERE namespace = ?', namespace);
    if (!meta) return null;
    const entries = await Promise.all(COLLECTIONS.map(async (collection) => [collection, await loadCollection(db, namespace, collection)] as const));
    return fromWorkspaceRecords({ meta: meta.meta, ...Object.fromEntries(entries) } as WorkspaceRecordSet);
  },
  async save(namespace, workspace: WorkspaceV3) {
    const db = await database();
    const recordSet = toWorkspaceRecords(workspace);
    await db.runAsync(
      'INSERT INTO workspaces(namespace, meta, updated_at) VALUES (?, ?, ?) ON CONFLICT(namespace) DO UPDATE SET meta = excluded.meta, updated_at = excluded.updated_at',
      namespace,
      recordSet.meta,
      new Date().toISOString(),
    );
    for (const collection of COLLECTIONS) {
      await db.runAsync('DELETE FROM workspace_entities WHERE namespace = ? AND collection = ?', namespace, collection);
      for (const record of recordSet[collection]) {
        await db.runAsync(
          'INSERT INTO workspace_entities(namespace, collection, entity_id, payload) VALUES (?, ?, ?, ?)',
          namespace,
          collection,
          record.entityId,
          record.payload,
        );
      }
    }
  },
  async transaction(operation) {
    const db = await database();
    let result: Awaited<ReturnType<typeof operation>>;
    await db.withTransactionAsync(async () => {
      result = await operation();
    });
    return result!;
  },
};
