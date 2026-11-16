# TracePulse

Full-stack distributed tracing studio, structured log aggregator and error telemetry dashboard. Vite + React + TypeScript + Tailwind CSS v4 + Vercel Serverless Functions.

## Quick start

```bash
npm install
npm run dev
```

The Vite-only server runs the frontend with a browser-local demo fallback. To run the serverless API locally, install the Vercel CLI and run `npx vercel dev`.

## Build

```bash
npm run build
```

## API

- `GET /api/logs?level=ERROR&service=vector-db&search=timeout` — filtered log stream, severity counts and service health.
- `POST /api/logs` — accepts `{ "level":"ERROR", "service":"api-gateway", "message":"Example", "metadata":{} }`.
- `GET /api/traces?traceId=tr-a81f` — trace groups, span trees and durations.
- `POST /api/traces` — accepts `{ "traceId":"tr-123", "parentSpanId":null, "service":"api-gateway", "operation":"GET /items", "startTime":0, "duration":42, "status":"ok" }`.

Valid log levels: INFO, WARN, ERROR, DEBUG. Services: auth-service, vector-db, api-gateway, agent-swarm.

## Vercel deployment

Import `kennedy-blip/tracepulseh`, use `npm install`, `npm run build`, and output directory `dist`. No environment variables are required for the demo.

## Storage limitation

The API uses process-local in-memory arrays pre-seeded with demo logs and traces. Serverless instances may scale independently and memory resets on cold starts; this is a prototype/demo collector, not durable production telemetry storage. For production, connect a shared database or observability backend and add authentication, rate limiting, retention controls and ingestion safeguards.

## Structure

```
api/_lib/store.ts
api/logs.ts
api/traces.ts
src/components/{TraceHeader,LogStreamViewer,DistributedWaterfalls,ErrorAnalyticsPanel}.tsx
src/lib/api.ts
src/App.tsx
src/main.tsx
src/types.ts
src/index.css
```
