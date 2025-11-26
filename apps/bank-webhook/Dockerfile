FROM node:20-alpine AS builder

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN corepack enable

COPY pnpm-workspace.yaml turbo.json package.json pnpm-lock.yaml ./
COPY apps/bank-webhook ./apps/bank-webhook
COPY packages ./packages

RUN pnpm install --filter @paylo/bank-webhook... --frozen-lockfile
RUN pnpm run db:generate
RUN pnpm --filter @paylo/bank-webhook build


FROM node:20-alpine AS runner

WORKDIR /app

RUN corepack enable

COPY --from=builder /app/apps/bank-webhook/dist ./apps/bank-webhook/dist
COPY --from=builder /app/apps/bank-webhook/package.json ./apps/bank-webhook/package.json
COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/apps/bank_webhook/node_modules ./apps/bank_webhook/node_modules

EXPOSE 3003

CMD ["pnpm", "--filter", "@paylo/bank-webhook", "start"]