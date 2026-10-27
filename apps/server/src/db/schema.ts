import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const models = sqliteTable("models", {
  modelKey: text("model_key").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  desc: text("desc").notNull(),
  tag: text("tag"),
  price: integer("price").notNull(),
  capabilitiesJson: text("capabilities_json").notNull(),
  paramsJson: text("params_json").notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  modelKey: text("model_key").notNull(),
  status: text("status").notNull(),
  prompt: text("prompt").notNull(),
  paramsJson: text("params_json").notNull(),
  refImagesJson: text("ref_images_json").notNull(),
  outputsJson: text("outputs_json").notNull(),
  credit: integer("credit").notNull(),
  error: text("error"),
  providerRefJson: text("provider_ref_json"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  taskId: text("task_id").notNull(),
  modelKey: text("model_key").notNull(),
  createdAt: integer("created_at").notNull(),
});
