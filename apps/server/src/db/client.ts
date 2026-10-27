import fs from "node:fs";
import path from "node:path";
import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import * as schema from "./schema.js";
import { SCHEMA_DDL } from "./ddl.js";

/**
 * sql.js（纯 WASM SQLite）+ drizzle sql-js 驱动：零原生编译。
 * 持久化策略：启动载入快照文件，写路径显式 persist() 导出落盘（ADR-001 修订）。
 */
export interface StudioDb {
  db: ReturnType<typeof createDrizzle>;
  sqlite: SqlJsDatabase;
  persist: () => void;
}

function createDrizzle(sqlite: SqlJsDatabase) {
  return drizzle(sqlite, { schema });
}

export async function createDb(file: string): Promise<StudioDb> {
  const SQL = await initSqlJs();
  const data = fs.existsSync(file) ? new Uint8Array(fs.readFileSync(file)) : undefined;
  const sqlite = new SQL.Database(data);
  sqlite.exec(SCHEMA_DDL);
  const db = createDrizzle(sqlite);
  const persist = () => {
    fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
    fs.writeFileSync(file, Buffer.from(sqlite.export()));
  };
  return { db, sqlite, persist };
}

export type Db = ReturnType<typeof createDrizzle>;
