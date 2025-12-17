# @paylo/types

Shared TypeScript types and Zod validation schemas for the Paylo monorepo.

## Exports

- **Auth** - User and session types
- **Transaction** - On-ramp and P2P types
- **Webhook** - Payment schemas
- **Zod** - API validation

## Usage

```typescript
import { PaymentInformationSchema } from "@paylo/types";

const result = PaymentInformationSchema.safeParse(data);
```

---

Part of the Paylo monorepo