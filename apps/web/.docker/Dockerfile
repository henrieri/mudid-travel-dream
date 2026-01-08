FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy all package.json files for workspace resolution
COPY packages/scoring/package.json ./packages/scoring/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

FROM base AS build
# Copy everything
COPY . ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/scoring/node_modules ./packages/scoring/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
# Build scoring package first
RUN cd packages/scoring && pnpm build
# Build web app
RUN cd apps/web && pnpm build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
WORKDIR /app
COPY --from=build /app/apps/web/.output ./.output
EXPOSE 3000
CMD ["node", "/app/.output/server/index.mjs"]
