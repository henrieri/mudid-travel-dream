# TanStack Start vs RR7 (Observatory Experiment)

## DX observations (Jan 7, 2026)
- File-based routing and `createFileRoute` felt straightforward; route loaders are clean and well-typed.
- `createServerFn` is a good fit for calling x.local with headers while keeping fetch logic server-only.
- Nitro output (`.output/`) is simple to deploy; a single `node .output/server/index.mjs` is enough.
- Tailwind v4 integration is smooth; no extra config needed beyond `@import "tailwindcss"`.
- Router devtools integrate nicely and are stripped in build output automatically.

## UI parity notes
- Cards, tabbed reports, and Markdown rendering match the Observatory layout closely.
- Snapshot-driven overview replaces live K8s metrics for now; K8s API wiring can be added later if desired.

## Potential gaps
- Health endpoint is UI-based (`/health` returns HTML). If JSON is preferred, switch to an API route.
- No built-in cache layer for snapshots yet (RR7 app relies on server calls directly). Consider adding a simple memory cache for markdown/CSV.

## Deployment notes
- Docker image builds cleanly with multi-stage setup.
- GitHub Actions workflows mirror the existing observatory pipeline with updated names.

## Next questions
- Compare cold-start latency vs RR7 on the same k3s hardware.
- Validate streaming/loader behavior on slow networks.
- Decide if server functions + loaders offer enough flexibility for future K8s metrics.
