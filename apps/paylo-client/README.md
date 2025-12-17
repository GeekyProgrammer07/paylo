# Paylo Client

The main user-facing web application for Paylo - a modern digital wallet platform for managing **fake money**, peer-to-peer transfers, and on-ramp transactions.

## Overview

Paylo Client is a full-featured Next.js 16 application providing users with a complete digital wallet experience. Built with the App Router, it offers server-side rendering, optimistic UI updates, and real-time balance management.

**Note**: This application uses fake money for development and demonstration purposes. All transactions are simulated using mock bank integrations.
## Features

- **Authentication** - Credentials-based with NextAuth.js, bcrypt hashing, and JWT sessions
- **Wallet Management** - Real-time balance tracking with Jotai
- **P2P Transfers** - Send money to users by phone number with atomic transactions
- **Transaction History** - Audit trail with filtering and Recharts visualization
- **Dashboard** - Sidebar navigation, balance overview, and transaction feed

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Next.js
- **Database**: PostgreSQL with Prisma
- **Validation**: Zod
- **Build Tool**: esbuild
- **Language**: TypeScript
- **State Management**: Jotai
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: NextAuth.js
- **HTTP Client**: Axios
- **Visualization**: Recharts

## User Flows
### Sign Up Flow
1. User enters details at `/signup`
2. Form validated with Zod schema
3. Password hashed with bcrypt
4. User and initial balance created
5. Redirect to sign-in

### On-Ramp Flow
1. User selects amount and bank provider at `/transfer`
2. Transaction created with "Processing" status
3. Mock bank webhook updates to "Success"
4. Balance incremented and UI updates

### P2P Transfer Flow
1. User enters recipient and amount at `/p2p`
2. Balance validation and atomic transaction processing
3. Balances updated (sender decremented, receiver incremented)
4. Success confirmation shown

## Monorepo Packages Used

- **`@paylo/db`** - Database client and Prisma schema
- **`@paylo/ui`** - Shared UI components
- **`@paylo/store`** - Jotai state management
- **`@paylo/types`** - TypeScript types and Zod schemas
- **`@paylo/eslint-config`** - ESLint configuration
- **`@paylo/typescript-config`** - TypeScript configuration

## Related Documentation

- [Main Paylo README](../../README.md)
- [Bank Webhook README](../bank-webhook/README.md)
- [Database Package](../../packages/db/)
- [UI Package](../../packages/ui/)
- [Store Package](../../packages/store/)
- [Types Package](../../packages/types/)

## License

This project is part of the Paylo monorepo. See the root [LICENSE](../../LICENSE) file for details.

---

Built with ❤️ as part of the Paylo platform