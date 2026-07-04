import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createOrderSchema } from '../src/features/orders/order.schemas';

describe('order validation', () => {
  it('accepts a valid POS order payload', () => {
    const payload = {
      storeId: 'store_123',
      tableNumber: 'A4',
      channel: 'WAITER_APP',
      items: [{ productId: 'product_123', quantity: 2, notes: 'No onions' }]
    };

    expect(() => createOrderSchema.parse(payload)).not.toThrow();
  });

  it('rejects an empty order', () => {
    const payload = { storeId: 'store_123', items: [] };
    expect(() => createOrderSchema.parse(payload)).toThrow(z.ZodError);
  });
});
