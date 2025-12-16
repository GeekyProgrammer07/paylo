# Paylo

A modern, full-stack digital wallet and payment platform built with Next.js **(Fake Money)**, featuring peer-to-peer transfers, on-ramp transactions.

## Features

- **User Wallet System**: Secure digital wallet with balance management
- **P2P Transfers**: Send money directly to other users
- **On-Ramp Transactions**: Add money to your wallet through bank integration **(Using a Mock Bank)**
- **Authentication**: Secure authentication with NextAuth.js
- **Transaction History**: Complete audit trail of all transactions

## Architecture

This is a monorepo project managed with [Turborepo](https://turborepo.com/) and [pnpm workspaces](https://pnpm.io/).

### Apps

- **`paylo-client`**: Main user-facing application (Next.js)
  - Port: 3001
  - User dashboard, P2P transfers, transaction management
  
- **`paylo-merchant`**: Merchant portal (Next.js)
  - Separate merchant dashboard and business tools **(Not Completed)**
  
- **`bank-webhook`**: Webhook service (Express.js)
  - Handles bank transaction callbacks
  - Built with esbuild for optimal performance

### Packages

- **`@paylo/db`**: Shared Prisma database client and schema
- **`@paylo/ui`**: Shared React component library
- **`@paylo/store`**: Jotai atoms and hooks for state management
- **`@paylo/types`**: Shared TypeScript types and interfaces
- **`@paylo/eslint-config`**: Shared ESLint configurations
- **`@paylo/prettier-config`**: Shared Prettier configurations
- **`@paylo/typescript-config`**: Shared TypeScript configurations

## 🛠️ Tech Stack

### Backend
- **API**: Next.js API Routes
- **Authentication**: NextAuth.js
- **Webhook Service**: Express.js
- **Validation**: Zod

### Database
- **Database**: PostgreSQL
- **ORM**: Prisma

### Frontend
- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **State Management**: Jotai
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React


### DevOps
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
## 🧪 CI/CD

GitHub Actions workflows are configured for:
- **Build**: Automated builds on push/PR
- **Deploy**: Automated deployment pipeline

See `.github/workflows/` for workflow definitions.
