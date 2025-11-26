FROM node:20-alpine AS builder

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN corepack enable

COPY pnpm-workspace.yaml turbo.json package.json pnpm-lock.yaml ./
COPY apps/paylo-client ./apps/paylo-client
COPY packages ./packages

RUN pnpm install --frozen-lockfile

RUN pnpm run db:generate
RUN pnpm --filter @paylo/client build


FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable

# ENV NODE_ENV=production
RUN mkdir -p /app/apps/paylo-client/public

COPY --from=builder /app/apps/paylo-client/.next ./apps/paylo-client/.next
COPY --from=builder /app/apps/paylo-client/public ./apps/paylo-client/public
COPY --from=builder /app/apps/paylo-client/package.json ./apps/paylo-client/
COPY --from=builder /app/apps/paylo-client/next.config.js ./apps/paylo-client/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/paylo-client/node_modules ./apps/paylo-client/node_modules

EXPOSE 3001

CMD ["pnpm", "--filter", "@paylo/client", "start"]