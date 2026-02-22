import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  userId: string;
  customerName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'refunded' | 'cancelled';
  deliveryTimestamp: Date | null;
  orderTimestamp: Date;
  refundStatus: 'none' | 'requested' | 'approved' | 'denied';
  refundReason?: string;
  refundedAt?: Date;
  driverName?: string;
  driverLocation?: {
    lat: number;
    lng: number;
  };
  deliveryAddress: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'out_for_delivery', 'delivered', 'refunded', 'cancelled'],
      default: 'pending',
    },
    deliveryTimestamp: {
      type: Date,
      default: null,
    },
    orderTimestamp: {
      type: Date,
      default: Date.now,
    },
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'approved', 'denied'],
      default: 'none',
    },
    refundReason: {
      type: String,
    },
    refundedAt: {
      type: Date,
    },
    driverName: {
      type: String,
    },
    driverLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
