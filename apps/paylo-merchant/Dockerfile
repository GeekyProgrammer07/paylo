FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY pnpm-workspace.yaml turbo.json package.json pnpm-lock.yaml ./
COPY apps/paylo-merchant ./apps/paylo-merchant
COPY packages ./packages

RUN pnpm install --frozen-lockfile

RUN pnpm run db:generate
RUN pnpm --filter @paylo/merchant build


FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable

# ENV NODE_ENV=production
# RUN mkdir -p /app/apps/paylo-merchant/public

COPY --from=builder /app/apps/paylo-merchant/.next ./apps/paylo-merchant/.next
# COPY --from=builder /app/apps/paylo-merchant/public ./apps/paylo-merchant/public
COPY --from=builder /app/apps/paylo-merchant/package.json ./apps/paylo-merchant/
COPY --from=builder /app/apps/paylo-merchant/next.config.ts ./apps/paylo-merchant/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/paylo-merchant/node_modules ./apps/paylo-merchant/node_modules

EXPOSE 3001

CMD ["pnpm", "--filter", "@paylo/merchant", "start"]