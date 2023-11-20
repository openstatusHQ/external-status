import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pages = sqliteTable("page", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	url: text("url").notNull(),
	external_id: text("external_id").notNull(),

	last_updated_at: text("last_updated_at").notNull(),
	time_zone: text("time_zone").notNull(),

	status_indicator: text("status_indicator").notNull(),
	status_description: text("status_description").notNull(),

	created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});
