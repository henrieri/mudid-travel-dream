FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY . ./
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
WORKDIR /app
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", "/app/.output/server/index.mjs"]
