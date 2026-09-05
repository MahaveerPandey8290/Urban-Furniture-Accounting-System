export class AppError extends Error {
  constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class UnprocessableError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }
}

// Accounting-specific
export class EmptyEntryError extends AppError {
  constructor(message: string = 'Minimum 2 lines required for journal entry') {
    super(message, 422, 'EMPTY_ENTRY');
  }
}

export class InvalidLineError extends AppError {
  constructor(message: string) {
    super(message, 422, 'INVALID_LINE');
  }
}

export class UnbalancedEntryError extends AppError {
  constructor(public readonly debit: string, public readonly credit: string) {
    super(
      `Journal entry is unbalanced: debit=${debit}, credit=${credit}`,
      422,
      'UNBALANCED_ENTRY',
      { debit, credit }
    );
  }
}

export class InvalidAccountError extends AppError {
  constructor(message: string) {
    super(message, 422, 'INVALID_ACCOUNT');
  }
}

export class PeriodLockedError extends AppError {
  constructor(message: string) {
    super(message, 422, 'PERIOD_LOCKED');
  }
}

export class ImmutableEntryError extends AppError {
  constructor(message: string) {
    super(message, 409, 'IMMUTABLE_ENTRY');
  }
}

export class OverpaymentError extends AppError {
  constructor(message: string) {
    super(message, 422, 'OVERPAYMENT');
  }
}

export class DuplicateIdempotencyKeyError extends AppError {
  constructor(message: string) {
    super(message, 409, 'DUPLICATE_IDEMPOTENCY_KEY');
  }
}

export class BudgetExceededWarning {
  constructor(
    public analyticAccountName: string,
    public committed: string,
    public achieved: string,
    public attempted: string,
    public excess: string,
    public message: string
  ) {}
}

export class AccountArchivedError extends AppError {
  constructor(message: string) {
    super(message, 422, 'ACCOUNT_ARCHIVED');
  }
}

export class InvalidStateTransitionError extends AppError {
  constructor(message: string) {
    super(message, 422, 'INVALID_STATE');
  }
}
