# Paylo Bank Webhook Service

A lightweight webhook service for handling mock bank payment notifications and updating transaction statuses in the Paylo platform.

## Overview

This Express.js service provides webhook endpoints that simulate bank payment callbacks for on-ramp transactions.

**Note**: This is a mock bank webhook service designed for development and testing purposes. 

## Features


- **Transaction Safety**: Ensures atomic updates using Prisma transactions.
- **Idempotency Protection**: Prevents duplicate payment processing.
- **Balance Updates**: Credits user wallets automatically.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Prisma
- **Validation**: Zod
- **Build Tool**: esbuild
- **Language**: TypeScript

## 🔌 API Endpoints

### `POST /hdfcWebhook`

Processes mock HDFC bank webhook notifications for on-ramp payment updates.

**Request Body:**
```typescript
{
  "token": string,      // Unique transaction token
  "userId": number,     // User ID from Paylo database
  "amount": number      // Amount in rupees (will be converted to paise)
}
```

**Success Response (200 OK):**
```json
{
  "message": "Captured"
}
```

**Processing Logic:**
1. Validates incoming payment data against Zod schema
2. Starts a database transaction
3. Updates OnRampTransaction status from `Processing` to `Success`
4. Ensures the transaction hasn't been processed before (idempotency check)
5. Increments user balance by payment amount (converted to paise: amount × 100)
6. Commits transaction or rolls back on error

## 📦 Monorepo Integration

This service is part of the Paylo monorepo and utilizes shared packages:

- **`@paylo/db`**: Prisma client and models for transaction management.
- **`@paylo/types`**: TypeScript types and Zod schemas for validation.
- **`@paylo/eslint-config`**: Shared ESLint rules.
- **`@paylo/prettier-config`**: Code formatting rules.
- **`@paylo/typescript-config`**: TypeScript compiler options.


## 🔄 Integration with Paylo Client

The bank webhook service integrates with the Paylo Client:

1. User starts an on-ramp transaction.
2. Transaction status is set to `Processing`.
3. Mock bank processes payment and sends a webhook to `/hdfcWebhook`.
4. Webhook service validates and updates the transaction.
5. User balance is updated, and the Client UI reflects the changes.


## 🔗 Related Documentation

- [Main Paylo README](../../README.md)
- [Paylo Client README](../paylo-client/README.md)
- [Database Package](../../packages/db/)
- [Types Package](../../packages/types/)

---

Built with ❤️ as part of the Paylo platform
