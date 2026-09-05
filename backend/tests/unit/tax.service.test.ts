/**
 * Unit tests for TaxService.
 *
 * No DB required — pure computation tests.
 * Validates the critical per-line rounding rule from the spec:
 *   Round each line independently to 2dp — never sum first then round.
 */

import { describe, it, expect } from 'vitest';
import { TaxService } from '../../src/core/tax.service.js';

describe('TaxService.computeLine', () => {
  it('computes 0% tax correctly (No Tax)', () => {
    const result = TaxService.computeLine({ quantity: '10', unitPrice: '500', taxRate: '0' });
    expect(result.untaxedAmount).toBe('5000.00');
    expect(result.taxAmount).toBe('0.00');
    expect(result.lineTotal).toBe('5000.00');
  });

  it('computes 5% GST correctly', () => {
    const result = TaxService.computeLine({ quantity: '2', unitPrice: '1000', taxRate: '5' });
    expect(result.untaxedAmount).toBe('2000.00');
    expect(result.taxAmount).toBe('100.00');
    expect(result.lineTotal).toBe('2100.00');
  });

  it('computes 12% GST correctly', () => {
    const result = TaxService.computeLine({ quantity: '1', unitPrice: '10000', taxRate: '12' });
    expect(result.untaxedAmount).toBe('10000.00');
    expect(result.taxAmount).toBe('1200.00');
    expect(result.lineTotal).toBe('11200.00');
  });

  it('computes 18% GST correctly', () => {
    const result = TaxService.computeLine({ quantity: '5', unitPrice: '2000', taxRate: '18' });
    expect(result.untaxedAmount).toBe('10000.00');
    expect(result.taxAmount).toBe('1800.00');
    expect(result.lineTotal).toBe('11800.00');
  });

  it('computes 28% GST correctly', () => {
    const result = TaxService.computeLine({ quantity: '1', unitPrice: '5000', taxRate: '28' });
    expect(result.untaxedAmount).toBe('5000.00');
    expect(result.taxAmount).toBe('1400.00');
    expect(result.lineTotal).toBe('6400.00');
  });

  it('rounds per-line at 18% with awkward quantity 3 × 333.33', () => {
    // 3 * 333.33 = 999.99 (untaxed)
    // 18% tax = 999.99 * 0.18 = 179.9982 → round2 = 180.00
    // total = 999.99 + 180.00 = 1179.99
    const result = TaxService.computeLine({ quantity: '3', unitPrice: '333.33', taxRate: '18' });
    expect(result.untaxedAmount).toBe('999.99');
    expect(result.taxAmount).toBe('180.00');
    expect(result.lineTotal).toBe('1179.99');
  });

  it('handles fractional quantity correctly', () => {
    const result = TaxService.computeLine({ quantity: '1.5', unitPrice: '100', taxRate: '18' });
    expect(result.untaxedAmount).toBe('150.00');
    expect(result.taxAmount).toBe('27.00');
    expect(result.lineTotal).toBe('177.00');
  });
});
