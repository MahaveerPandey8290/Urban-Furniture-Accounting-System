# Urban Furniture Accounting System — Backend

Production-grade double-entry accounting system built with TypeScript, Express, Prisma, and PostgreSQL.

---

## Setup

### Prerequisites
- Node.js 20 LTS
- PostgreSQL 15 (via pgAdmin 4 local install)

### 1. Configure environment
```bash
cp .env.example .env
# Edit .env with your local PostgreSQL credentials
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create the database
In pgAdmin 4, create two databases:
- `urbanfurniture` (main)
- `urbanfurniture_test` (for running tests)

### 4. Run migrations
```bash
npx prisma migrate deploy
```

### 5. Seed baseline data
```bash
npm run seed
```

### 6. Start development server
```bash
npm run dev
```

Server starts on `http://localhost:3000`  
API docs: `http://localhost:3000/api/docs`  
Health: `http://localhost:3000/api/health`

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | `development`, `test`, or `production` |
| `PORT` | No | `3000` | HTTP port |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `TEST_DATABASE_URL` | No | — | Separate DB for integration tests |
| `JWT_ACCESS_SECRET` | **Yes** | — | Min 32 chars — sign access tokens |
| `JWT_REFRESH_SECRET` | **Yes** | — | Min 32 chars — sign refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN_DAYS` | No | `7` | Refresh token lifetime (days) |
| `SEED_ADMIN_LOGIN_ID` | Prod only | `admin001` | Admin login ID for seed |
| `SEED_ADMIN_PASSWORD` | Prod only | — | Admin password (must meet policy) |
| `SEED_COMPANY_NAME` | No | `Urban Furniture Pvt Ltd` | Company name |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed origins |
| `UPLOAD_DIR` | No | `./uploads` | File upload directory |
| `APP_URL` | No | `http://localhost:3000` | Base URL for reset links |

---

## Seeded Credentials

After `npm run seed`:

| Role | loginId | Password |
|---|---|---|
| Admin | `admin001` | `Admin@1234` |
| Accountant | `acct001` | `Acct@1234` |
| Vendor (Contact) | `rahul_v` | *(printed on seed run)* |
| Customer (Contact) | `nimesh_c` | *(printed on seed run)* |

---

## API Route Table

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | None | Public signup (PENDING ACCOUNTANT) |
| POST | `/login` | None | Login — returns access + refresh tokens |
| POST | `/refresh` | None | Rotate refresh token |
| POST | `/logout` | None | Revoke refresh token |
| POST | `/forgot-password` | None | Request password reset email |
| POST | `/reset-password` | None | Reset password with one-time token |
| POST | `/change-password` | Auth | Change password (clears mustChangePassword) |

### Users (`/api/users`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | ADMIN | Create user (returns one-time temp password) |
| GET | `/pending` | ADMIN | List users awaiting approval |
| PATCH | `/:id/approve` | ADMIN | Approve pending user |
| PATCH | `/:id/reject` | ADMIN | Reject user (requires reason) |
| PATCH | `/:id/suspend` | ADMIN | Suspend user |
| PATCH | `/:id/reactivate` | ADMIN | Reactivate user |

### System
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | Liveness check |
| GET | `/api/health/ready` | None | Readiness check (DB ping) |
| GET | `/api/docs` | None | Swagger UI |
| GET | `/api/docs.json` | None | OpenAPI JSON spec |

---

## Data Model Summary

### Core Entities
- **Company** — Multi-tenant anchor. Every business table has `companyId`.
- **User** — 3 roles: `ADMIN`, `ACCOUNTANT`, `CONTACT`. 4 statuses: `PENDING`, `ACTIVE`, `REJECTED`, `SUSPENDED`.
- **Contact** — Customers and Vendors. Optionally linked to a portal User.
- **Account** — Chart of Accounts. 8 types: `ASSET`, `LIABILITY`, `BANK`, `CAPITAL`, `CASH`, `INCOME`, `EXPENSE`, `OTHER_EXPENSE`.
- **Journal** — 4 types: `SALES`, `PURCHASE`, `BANK`, `CASH`. Controls document numbering.

### Document Flow
```
PurchaseOrder ──confirm──▶ CONFIRMED ──createBill──▶ VendorBill
                                                         │
                                                    confirm (posts entry)
                                                         │
                                                    Payment ──confirm──▶ CONFIRMED
                                                    (recomputes amountDue / paymentStatus)
```

### Ledger
- `JournalEntry` — immutable once POSTED. Corrections via reversal only.
- `JournalItem` — lines. CHECK constraint: debit XOR credit, never both.
- `SequenceService` — gapless numbers via `pg_advisory_xact_lock`.

---

## Accounting Design Decisions

### Document layer / Ledger layer split

Every Invoice, Bill, and Payment module creates its financial records by calling `LedgerService.postEntry()`. The document modules **never** build `JournalEntry` or `JournalItem` rows directly.

This means:
1. There is exactly **one code path** that writes to the ledger.
2. Every report reads only `JournalItem JOIN JournalEntry WHERE status = 'POSTED'`. Reports **never** read Invoice or Bill tables — those are workflow state, not financial truth.
3. The balance-check trigger (`trg_entry_balanced`) fires at the database level as a belt-and-braces guard, even if application code somehow bypasses the service layer.

### Why Purchase Orders and Sales Orders post nothing

A Purchase Order is a **commercial commitment** — a promise to buy. No money has changed hands. No service has been rendered. Under double-entry accounting (and GAAP/Ind AS), a PO is not a financial event and creates no journal entry. The financial event occurs when the **Vendor Bill is confirmed** (recording the liability) and when the **Payment is confirmed** (recording the cash/bank movement).

### Why posted entries are immutable

Once a journal entry is posted, it is a permanent part of the accounting record. Mutating it would:
- Break the audit trail (what did the books show on 31 March?)
- Violate accounting standards that require all corrections to be explicit
- Make trial balances and bank reconciliations unreliable

**Corrections are made by reversal**: a new entry with all debits and credits swapped, linked to the original via `reversalOfId`/`reversedById`. Both entries remain visible. The deferrable constraint trigger at the database level enforces this even against direct SQL writes.

### CONTACT scoping in the repository layer

When a user has role `CONTACT`, every repository query for invoices, bills, and payments appends `WHERE partnerId = ctx.contactId`. This guard lives in the **repository**, not the controller.

If it were in the controller, a future developer adding a new endpoint would need to remember to add the scope check. In the repository, it is impossible to forget — the check runs for every query regardless of which controller calls it. This single design decision prevents the IDOR vulnerability that would otherwise let one customer read another's invoices.

---

## Running Tests

```bash
# Unit tests (no DB required)
npm run test:unit

# Integration tests (requires urbanfurniture_test DB)
npm run test:integration

# All tests with coverage report
npm run test:coverage
```

### Key integration test: Concurrent sequence
The `50 concurrent postEntry calls produce 50 unique sequential numbers` test (`tests/integration/ledger.test.ts`) validates that `pg_advisory_xact_lock` prevents gaps and duplicates under concurrent load. A naive `MAX(number)+1` implementation would fail this test by producing duplicates. **This test is not optional.**
