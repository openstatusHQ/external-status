import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { z } from "zod";
import { Bindings } from ".";
import { pages } from "./schema";
import { timing } from "hono/timing";

export const app = new Hono<{ Bindings: Bindings }>();

app.use("*", timing());

const urlSchema = z.object({ url: z.string().url() });
const statusPageSchema = z.object({
	page: z.object({
		id: z.string(),
		name: z.string(),
		url: z.string().url(),
		time_zone: z.string(),
		updated_at: z.string().datetime({ offset: true }),
	}),
	status: z.object({
		indicator: z.string(),
		description: z.string(),
	}),
});

const updateSchema = z.object({
	last_updated_at: z.string().datetime(),
	status_indicator: z.string(),
	status_description: z.string(),
});
app.get("/", (c) => {
	return c.text("hello world");
});

app.get("/pages", async (c) => {
	const d1 = drizzle(c.env.DB);
	const { limit, offset } = c.req.query();
	console.log(limit, offset);

	const result = await d1
		.select()
		.from(pages)
		.limit(Number(limit || 1000))
		.offset(Number(offset))
		.all();
	console.log(result);
	return c.json(result);
});

app.get("/pages/:name", async (c) => {
	const name = c.req.param("name");
	if (!name) {
		return c.json({ error: "name is required" }, 404);
	}
	const d1 = drizzle(c.env.DB);
	const result = await d1
		.select()
		.from(pages)
		// .where(eq(pages.name, name))
		.where(sql`lower(${pages.name}) = ${name.toLowerCase()}`)
		.get();
	return c.json(result);
});

app.put("/pages/:name", async (c) => {
	const name = c.req.param("name");
	if (!name) {
		return c.json({ error: "name is required" }, 404);
	}

	const payload = await c.req.json();
	console.log(payload);
	const data = updateSchema.parse(payload);
	const d1 = drizzle(c.env.DB);
	await d1
		.update(pages)
		.set({
			last_updated_at: data.last_updated_at,
			status_indicator: data.status_indicator,
			status_description: data.status_description,
			updated_at: new Date().toISOString(),
		})
		.where(sql`lower(${pages.name}) = ${name.toLowerCase()}`)
		.get();
	return c.json({ status: "updated" });
});

app.post("/pages", async (c) => {
	const d1 = drizzle(c.env.DB);

	const body = await c.req.json();
	const payload = urlSchema.parse(body);

	const alreadyExist = await d1
		.select()
		.from(pages)
		.where(eq(pages.url, payload.url))
		.get();
	if (alreadyExist) {
		return c.json({ status: "page already exist" });
	}
	const r = await fetch(`${payload.url}/api/v2/status.json`);
	const json = await r.json();
	console.log(json);
	const data = statusPageSchema.parse(json);

	const date = new Date();
	await d1
		.insert(pages)
		.values({
			url: payload.url,
			name: data.page.name,
			external_id: data.page.id,
			last_updated_at: date.toISOString(),
			time_zone: data.page.time_zone,
			status_indicator: data.status.indicator,
			status_description: data.status.description,
		})
		.run();

	return c.json({ status: "page added" });
});
