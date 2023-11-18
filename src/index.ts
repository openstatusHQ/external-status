import { drizzle } from "drizzle-orm/d1";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { pages } from "./schema";
import { app } from "./api";
import { Tinybird } from "@chronark/zod-bird";

export type Bindings = {
  DB: D1Database;
  STATUS_QUEUE: Queue<Message>;
  TINYBIRD_TOKEN: string;
};

type Message = {
  id: number;
  url: string;
  name: string;
  external_id: string;
  last_updated_at: string;
  time_zone: string;
  status_indicator: string;
  status_description: string;
};



const statusPageSchema = z.object({
  page: z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url(),
    time_zone: z.string(),
    updated_at: z.string().datetime({offset: true}),
  }),
  status: z.object({
    indicator: z.string(),
    description: z.string(),
  }),
});



export default {
  fetch: app.fetch,


  async queue(batch: MessageBatch<Message>, env: Bindings): Promise<void> {
    const tb = new Tinybird({ token: env.TINYBIRD_TOKEN! });
     const publishEvent = tb.buildIngestEndpoint({
        datasource: "external_status",
        event: z.object({
          name: z.string(),
          url: z.string(),
          time_zone: z.string(),
          updated_at: z.number().int(),
          indicator: z.string().default(""),
          description: z.string().default(""),
          fetched_at: z.number().int().default(Date.now()),
        }),
      });


    for await (const m of batch.messages) {
      const r = await fetch(`${m.body.url}/api/v2/status.json`);
      const json = await r.json();
      const data = statusPageSchema.parse(json);
      const d1 = drizzle(env.DB);
      await d1
        .update(pages)
        .set({
          last_updated_at: data.page.updated_at,
          status_indicator: data.status.indicator,
          status_description: data.status.description,
          updated_at: new Date().toISOString(),
        })
        .where(sql`lower(${pages.name}) = ${m.body.name.toLowerCase()}`)
        .get();
        await publishEvent({
            name: data.page.name,
            url: data.page.url,
            time_zone: data.page.time_zone,
            updated_at: new Date(data.page.updated_at).getTime(),
            indicator: data.status.indicator,
            description: data.status.description,
        })
    }
  },

  async scheduled(event:ScheduledController, env: Bindings, ctx:ExecutionContext): Promise<void> {
    // Write code for updating your API

    const d1 = drizzle(env.DB);
    const results = await d1.select().from(pages).all( );
    console.log(results);
    for await (const result of results) {
      await env.STATUS_QUEUE.send(result);
    }
    console.log("cron processed");
  },

};
