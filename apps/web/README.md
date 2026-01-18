# TanStack Observatory

TanStack Start experiment mirroring the Mudid K8s Observatory snapshot views. Focused on UI parity, data-loading ergonomics, and deployment workflow comparison with RR7.

## Local development

```bash
pnpm install
pnpm dev
```

The app runs on `http://localhost:3000`.

## Environment variables

Create a `.env` file if you need to override the x.local endpoint:

```
X_API_URL=http://x.local
X_API_HOST=x.local
```

## Production build

```bash
pnpm build
pnpm start
```

## Deployment

- Dockerfile: `.docker/Dockerfile`
- K8s manifests: `k8s/`
- Preview manifests: `k8s/preview/`
- Ingress host: `tanstack-observatory.local`
- Preview host template: `pr-{n}.dev.tanstack-observatory.local`

## Health check

`/health` returns `ok` for Kubernetes probes.

## Notes

See `docs/tanstack-vs-rr7.md` for comparison notes.
