/**
 * Unit tests for money utilities.
 */

import { describe, it, expect } from 'vitest';
import { round2, sumDecimals, decimalEquals, fromPrismaDecimal, Decimal } from '../../src/core/money.js';

describe('round2', () => {
  it('rounds 2.345 to 2.35 (HALF_UP)', () => {
    expect(round2('2.345').toString()).toBe('2.35');
  });

  it('rounds 2.344 to 2.34', () => {
    expect(round2('2.344').toString()).toBe('2.34');
  });

  it('handles integers', () => {
    expect(round2('100').toString()).toBe('100');
  });

  it('handles negative values (HALF_UP rounds away from zero)', () => {
    // ROUND_HALF_UP: -1.005 rounds to -1.01 (rounds half away from zero)
    // This matches standard accounting convention
    expect(round2('-1.005').toString()).toBe('-1.01');
  });

  it('handles zero', () => {
    expect(round2('0').toString()).toBe('0');
  });
});

describe('sumDecimals', () => {
  it('sums an array of Decimals', () => {
    const values = ['1.11', '2.22', '3.33'].map(v => new Decimal(v));
    expect(sumDecimals(values).toString()).toBe('6.66');
  });

  it('returns 0 for empty array', () => {
    expect(sumDecimals([]).toString()).toBe('0');
  });
});

describe('decimalEquals', () => {
  it('returns true for equal values', () => {
    expect(decimalEquals('100.00', '100')).toBe(true);
  });

  it('returns false for unequal values', () => {
    expect(decimalEquals('100.01', '100.00')).toBe(false);
  });
});

describe('fromPrismaDecimal', () => {
  it('converts an object with toString to Decimal', () => {
    const val = { toString: () => '1234.56' };
    expect(fromPrismaDecimal(val).toString()).toBe('1234.56');
  });

  it('returns 0 for null', () => {
    expect(fromPrismaDecimal(null).toString()).toBe('0');
  });
});
