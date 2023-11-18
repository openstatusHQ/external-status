export interface Env {
  DB: D1Database;
  STATUS_QUEUE: Queue<any>;
}


const handler = {
  async scheduled(event:ScheduledController, env: Env, ctx:ExecutionContext): Promise<void> {
    // Write code for updating your API
    const { results } = await env.DB.prepare("SELECT * FROM page").all();
    console.log(results);
    for await (const result of results) {
      await env.STATUS_QUEUE.send(result);
    }
    console.log("cron processed");
  },
};

export default handler;
