# 🚨 External Status Monitoring Service🚨

Easily monitor your external providers status page.


A service by [OpenStatus](https://www.openstatus.dev)

## 🔥 How it works?

It regulary check external status page for updates.

At the moment it only supports [Atlassian StatusPage](https://www.statuspage.com/) but more will come.


## 🙋 Why?

We believe the status of your external service should be open and accessible to everyone.


## 🥞 The Stack

- [Bun](https://bun.sh/) - Package manager
- [Hono](https://hono.dev/) - API
- Cloudflare Workers
- Cloudflare D1
- Cloudflare Queues
- Cloudflare Cron Scheduler

## 🧑‍💻 Development

1. Install dependencies
```
bun install
```
2. Execute database migration
```
wrangler d1 execute status-db --local --file=./drizzle/0000_outstanding_doomsday.sql
```
3. Run it
```
bun dev
```
