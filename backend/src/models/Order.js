import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    product: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      images: { type: [String], default: [] },
      category: { type: String, default: '' }
    },
    variant: {
      name: { type: String, default: null },
      hex: { type: String, default: null }
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true } // immutable price at purchase
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null
    },
    customer: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, default: '', trim: true }
    },
    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      addressLine1: { type: String, required: true, trim: true },
      apartment: { type: String, default: '', trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, default: '', trim: true }
    },
    shippingMethod: {
      name: { type: String, default: 'Standard Insured Delivery' },
      price: { type: Number, default: 0 }
    },
    paymentMethod: {
      type: { type: String, enum: ['card', 'paypal', 'cod'], default: 'cod' },
      cardBrand: { type: String, default: null },
      last4: { type: String, default: null }
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, required: true }
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing'
    },
    estimatedDelivery: {
      type: String,
      default: () => {
        const d = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    },
    trackingNumber: {
      type: String,
      default: () => `TRK-USPS-${Math.floor(10000000 + Math.random() * 90000000)}`
    },
    cancellationReason: {
      type: String,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.id || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.id || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Order = mongoose.model('Order', orderSchema);
