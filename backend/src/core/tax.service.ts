import { Decimal, round2 } from './money.js';
import type { TaxComputationResult } from '../types/index.js';

export class TaxService {
  /**
   * Compute tax for a single line item.
   *
   * IMPORTANT: Round each line independently to 2dp BEFORE summing.
   * Do NOT sum all lines first and round once — that produces off-by-one-paisa
   * discrepancies against printed documents when quantities or rates don't
   * divide evenly into 2 decimal places.
   *
   * Formula:
   *   untaxedAmount = round2(quantity * unitPrice)
   *   taxAmount     = round2(untaxedAmount * taxRate / 100)
   *   lineTotal     = round2(untaxedAmount + taxAmount)
   */
  static computeLine(input: {
    quantity: Decimal | string;
    unitPrice: Decimal | string;
    taxRate: Decimal | string;
  }): TaxComputationResult {
    const qty = new Decimal(input.quantity.toString());
    const price = new Decimal(input.unitPrice.toString());
    const rate = new Decimal(input.taxRate.toString());

    const untaxedAmount = round2(qty.times(price));
    const taxAmount = round2(untaxedAmount.times(rate).dividedBy(100));
    const lineTotal = round2(untaxedAmount.plus(taxAmount));

    return {
      untaxedAmount: untaxedAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      lineTotal: lineTotal.toFixed(2),
    };
  }
}
