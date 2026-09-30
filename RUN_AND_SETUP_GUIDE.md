# KrishiKhata Accounts

Complete frontend and backend source for a pesticide and fertiliser wholesale/retail accounting application.

## Included

- Admin 1: Purchase Accounts
- Admin 2: Sales Accounts
- Desktop and dedicated mobile interfaces
- Supplier, farmer and customer ledgers
- Purchase and sales vouchers
- Batch, expiry, HSN and GST inventory tracking
- Automatic 15-second data refresh
- Daily audit/change history
- Excel workbook exports
- D1 database schema and migration

## Requirements

- Node.js 22.13 or later
- npm
- A Cloudflare-compatible D1 database for persistent hosted data

## Install and run locally

```bash
npm install
npm run dev
```

The interface includes demonstration data if the database is not available during local development.

## Production build

```bash
npm run build
```

## Database

The schema is in `db/schema.ts`. The generated migration is in `drizzle/0000_conscious_beast.sql`.

Before operational use, replace the demonstration company information and configure actual users, product masters, opening balances, GST settings, suppliers and customers.
