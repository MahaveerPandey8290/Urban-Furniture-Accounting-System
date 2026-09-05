import type { PrismaClient } from '@prisma/client';
import type { Logger } from 'pino';

// Transaction client type
export type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

// Auth context attached to every request (also used as JWT payload)
export interface AuthContext {
  sub: number;               // userId
  loginId: string;
  role: string;              // Role enum value
  contactId: number | null;
  companyId: number;
  mustChangePassword: boolean;
}

// Request-level context
export interface RequestContext {
  requestId: string;
  companyId: number;
  user?: AuthContext;
}

// Ledger input types
export interface LedgerLine {
  accountId: number;
  debit?: string;   // Decimal as string
  credit?: string;  // Decimal as string
  partnerId?: number;
  label?: string;
  productId?: number;
  quantity?: string;
  unitPrice?: string;
  analyticAccountId?: number;
  taxId?: number;
  sequence?: number;
}

export interface PostEntryInput {
  journalId: number;
  entryDate: Date;
  reference?: string;
  narration?: string;
  partnerId?: number;
  sourceType?: string;
  sourceId?: number;
  lines: LedgerLine[];
}

// Budget warning (non-blocking — returned in response body, not thrown)
export interface BudgetWarning {
  analyticAccountName: string;
  committed: string;
  achieved: string;
  attempted: string;
  excess: string;
  message: string;
}

// Tax computation result
export interface TaxComputationResult {
  untaxedAmount: string;   // Decimal as string
  taxAmount: string;
  lineTotal: string;
}

// Cursor pagination
export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Extend Express Request with our custom fields
declare global {
  namespace Express {
    interface Request {
      user?: AuthContext;
      companyId: number;
      requestId: string;
      log: Logger;
    }
  }
}

export {};
