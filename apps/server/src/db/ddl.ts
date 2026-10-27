/** 与 drizzle schema 对齐的幂等 DDL（sql.js 无 migration 工具链，启动时执行） */
export const SCHEMA_DDL = `
CREATE TABLE IF NOT EXISTS models (
  model_key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  tag TEXT,
  price INTEGER NOT NULL,
  capabilities_json TEXT NOT NULL,
  params_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  model_key TEXT NOT NULL,
  status TEXT NOT NULL,
  prompt TEXT NOT NULL,
  params_json TEXT NOT NULL,
  ref_images_json TEXT NOT NULL,
  outputs_json TEXT NOT NULL,
  credit INTEGER NOT NULL,
  error TEXT,
  provider_ref_json TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  task_id TEXT NOT NULL,
  model_key TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
`;
