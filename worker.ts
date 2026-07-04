import { receiptQueue, invoiceQueue } from './queues/orderQueue';
import { prisma } from './infrastructure/prisma';
import { connectMongo } from './infrastructure/mongo';

async function bootstrapWorker() {
  await connectMongo();

  receiptQueue.process(async (job) => {
    const order = await prisma.order.findFirst({
      where: { id: job.data.orderId, tenantId: job.data.tenantId, storeId: job.data.storeId },
      include: { items: true }
    });
    if (!order) throw new Error(`Order ${job.data.orderId} not found`);

    console.log('[receipt-printing]', {
      orderId: order.id,
      printerName: job.data.printerName ?? 'default-kitchen-printer',
      itemCount: order.items.length
    });
  });

  invoiceQueue.process(async (job) => {
    console.log('[invoice-sync]', {
      orderId: job.data.orderId,
      provider: job.data.provider
    });
  });

  console.log('Worker started: receipt-printing + invoice-sync queues');
}

bootstrapWorker().catch((error) => {
  console.error(error);
  process.exit(1);
});
