# @paylo/store

Shared state management using Jotai atoms for the Paylo monorepo.

## Features

- **Balance Atom** - Global balance state management
- **useBalance Hook** - React hook for balance operations
- **Type-safe** - Full TypeScript support

## Usage

```typescript
import { useBalance } from "@paylo/store/useBalance";

function BalanceCard() {
  const { balance, setBalance } = useBalance();
  
  return <div>Balance: ₹{balance}</div>;
}
```

---

Part of the Paylo monorepo