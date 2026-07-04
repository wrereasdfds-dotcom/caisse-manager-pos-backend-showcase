import { Schema, model } from 'mongoose';

const orderEventSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    storeId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, index: true },
    eventType: { type: String, required: true },
    payload: { type: Object, required: true },
    actorId: { type: String }
  },
  { timestamps: true }
);

orderEventSchema.index({ tenantId: 1, storeId: 1, createdAt: -1 });

export const OrderEventModel = model('OrderEvent', orderEventSchema);
