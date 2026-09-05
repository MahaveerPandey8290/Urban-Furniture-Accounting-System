/**
 * Money utilities for the accounting system.
 *
 * ALL monetary arithmetic MUST go through this module.
 * Using native JavaScript numbers for money is a defect.
 * IEEE 754 floating-point cannot represent many decimal fractions exactly,
 * leading to rounding errors that silently corrupt financial data.
 * We use decimal.js-light throughout, which provides arbitrary-precision
 * decimal arithmetic.
 */
import Decimal from 'decimal.js-light';

// Configure: HALF_UP rounding (standard accounting rounding)
Decimal.set({ rounding: Decimal.ROUND_HALF_UP, precision: 28 });

export { Decimal };

/**
 * Round a value to 2 decimal places using HALF_UP rounding.
 * Use at every boundary where a Decimal enters or exits the system.
 */
export function round2(val: Decimal | string | number): Decimal {
  return new Decimal(val).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/**
 * Sum an array of Decimal values. Returns Decimal(0) for empty arrays.
 */
export function sumDecimals(values: Decimal[]): Decimal {
  return values.reduce((acc, v) => acc.plus(v), new Decimal(0));
}

/**
 * Compare two Decimal values for equality (accounting equality: same numeric value).
 */
export function decimalEquals(a: Decimal | string, b: Decimal | string): boolean {
  return new Decimal(a).equals(new Decimal(b));
}

/**
 * Convert a Prisma Decimal (which comes as object) to decimal.js-light Decimal.
 * Prisma returns Decimal objects that have a .toString() method.
 */
export function fromPrismaDecimal(val: { toString(): string } | null | undefined): Decimal {
  if (val == null) return new Decimal(0);
  return new Decimal(val.toString());
}
