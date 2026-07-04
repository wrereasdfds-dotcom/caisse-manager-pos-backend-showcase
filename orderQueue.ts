import Queue from 'bull';
import { env } from '../config/env';

export type ReceiptJob = {
  tenantId: string;
  storeId: string;
  orderId: string;
  printerName?: string;
};

export type InvoiceJob = {
  tenantId: string;
  orderId: string;
  provider: 'odoo' | 'internal';
};

export const receiptQueue = new Queue<ReceiptJob>('receipt-printing', env.REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 500
  }
});

export const invoiceQueue = new Queue<InvoiceJob>('invoice-sync', env.REDIS_URL, {
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 500
  }
});
