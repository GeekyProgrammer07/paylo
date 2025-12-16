# @paylo/db

Shared Prisma database client and schema for the Paylo monorepo.

## Features

- **Prisma ORM** - Type-safe access
- **PostgreSQL** - User, Balance, Transaction models
- **Migrations** - Version-controlled changes
- **Seeding** - Sample development data

## Usage

```typescript
import prisma from "@paylo/db/client";

const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { Balance: true },
});
```

## Commands

```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed database
pnpm prisma db seed
```

---

Part of the Paylo monorepo