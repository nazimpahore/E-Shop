import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';

// Server-authoritative promo definitions
const VALID_PROMOS = {
  WELCOME10: { type: 'percent', value: 10, minSubtotal: 0 },
  ESHOP20: { type: 'amount', value: 20, minSubtotal: 100 },
  FREESHIP: { type: 'freeship', minSubtotal: 0 }
};

export const orderService = {
  /**
   * Calculate authoritative pricing on server
   */
  calculatePricing(items, promoCode = null, shippingMethod = 'standard') {
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }
    subtotal = Math.round(subtotal * 100) / 100;

    let discount = 0;
    let freeShippingPromo = false;

    if (promoCode && typeof promoCode === 'string') {
      const cleanCode = promoCode.trim().toUpperCase();
      const promo = VALID_PROMOS[cleanCode];
      if (promo) {
        if (!promo.minSubtotal || subtotal >= promo.minSubtotal) {
          if (promo.type === 'percent') {
            discount = (subtotal * promo.value) / 100;
          } else if (promo.type === 'amount') {
            discount = Math.min(subtotal, promo.value);
          } else if (promo.type === 'freeship') {
            freeShippingPromo = true;
          }
        }
      }
    }
    discount = Math.round(discount * 100) / 100;

    // Shipping rules: subtotal >= 50 or freeShippingPromo -> free; express is $12
    let shipping = 0;
    if (shippingMethod === 'express' || shippingMethod === 'Priority Express Courier') {
      shipping = 12.00;
    } else {
      shipping = (subtotal >= 50 || freeShippingPromo || subtotal === 0) ? 0 : 8.00;
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * 0.08 * 100) / 100; // 8% sales tax
    const total = Math.max(0, Math.round((subtotal - discount + shipping + tax) * 100) / 100);

    return {
      subtotal,
      discount,
      shipping,
      tax,
      total
    };
  },

  /**
   * Create an order with inventory verification, atomic stock updates, and item snapshots
   */
  async createOrder({ userId, customer, shippingAddress, shippingMethod, paymentMethod, items, promoCode }) {
    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item.');
    }

    // 1. Fetch real product documents from MongoDB to verify price and stock
    const validatedItems = [];
    const stockDeductions = [];

    for (const item of items) {
      const productLookupId = item.product?.id || item.productId || item.id;
      if (!productLookupId) {
        throw new Error('Invalid product reference in order item.');
      }

      const query = {
        $or: [{ id: productLookupId }]
      };
      if (mongoose.Types.ObjectId.isValid(productLookupId)) {
        query.$or.push({ _id: productLookupId });
      }

      const product = await Product.findOne(query);
      if (!product) {
        throw new Error(`Product "${productLookupId}" is no longer available.`);
      }

      if (!product.isActive) {
        throw new Error(`Product "${product.name}" is no longer active.`);
      }

      const requestedQty = parseInt(item.quantity, 10);
      if (isNaN(requestedQty) || requestedQty <= 0) {
        throw new Error(`Invalid quantity for product "${product.name}".`);
      }

      if (product.stockCount < requestedQty) {
        throw new Error(
          `Insufficient stock for "${product.name}". Requested: ${requestedQty}, Available: ${product.stockCount}`
        );
      }

      // Check variant if applicable
      const chosenVariant = item.variant || null;

      validatedItems.push({
        id: item.id || `${product.id}-${chosenVariant?.name || 'standard'}`,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          images: product.images,
          category: product.category
        },
        variant: chosenVariant,
        quantity: requestedQty,
        price: product.price // Authoritative server price snapshot
      });

      stockDeductions.push({
        productId: product._id,
        quantity: requestedQty
      });
    }

    // 2. Authoritative pricing calculation
    const shippingMethodName =
      typeof shippingMethod === 'object' ? shippingMethod.name : shippingMethod;
    const pricing = this.calculatePricing(validatedItems, promoCode, shippingMethodName);

    // 3. Atomically decrement stock
    // If any item fails atomic decrement (e.g. concurrent checkout), rollback previously deducted items
    const executedDeductions = [];
    try {
      for (const deduction of stockDeductions) {
        const updated = await Product.findOneAndUpdate(
          {
            _id: deduction.productId,
            stockCount: { $gte: deduction.quantity }
          },
          {
            $inc: { stockCount: -deduction.quantity }
          },
          { new: true }
        );

        if (!updated) {
          throw new Error('Stock changed during checkout. Please review your cart.');
        }

        // Update inStock flag if depleted
        if (updated.stockCount <= 0) {
          await Product.updateOne({ _id: deduction.productId }, { inStock: false });
        }

        executedDeductions.push(deduction);
      }
    } catch (concurrencyErr) {
      // Rollback any stock decremented in this batch
      for (const roll of executedDeductions) {
        await Product.updateOne(
          { _id: roll.productId },
          { $inc: { stockCount: roll.quantity }, inStock: true }
        );
      }
      throw concurrencyErr;
    }

    // 4. Create Order Record
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = await Order.create({
      id: orderNumber,
      user: userId || null,
      customer: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone || ''
      },
      shippingAddress: {
        fullName: shippingAddress.fullName,
        addressLine1: shippingAddress.addressLine1,
        apartment: shippingAddress.apartment || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || ''
      },
      shippingMethod: {
        name: shippingMethodName || 'Standard Insured Delivery',
        price: pricing.shipping
      },
      paymentMethod: {
        type: paymentMethod?.type || 'cod',
        cardBrand: paymentMethod?.cardBrand || null,
        last4: paymentMethod?.last4 || null
      },
      paymentStatus: paymentMethod?.type === 'card' ? 'paid' : 'pending',
      items: validatedItems,
      pricing,
      status: 'Processing'
    });

    // 5. If user is authenticated, clear their authoritative cart
    if (userId) {
      await Cart.deleteOne({ user: userId });
    }

    return newOrder.toJSON();
  },

  /**
   * Find order by custom ID (e.g. ORD-123456) or Mongo ObjectId
   */
  async findOrderById(orderId, userId = null, isAdmin = false) {
    const query = {
      $or: [{ id: orderId }]
    };

    if (mongoose.Types.ObjectId.isValid(orderId)) {
      query.$or.push({ _id: orderId });
    }

    const order = await Order.findOne(query);
    if (!order) return null;

    // Check ownership if user is not admin
    if (!isAdmin && userId && order.user && order.user.toString() !== userId.toString()) {
      throw new Error('Access denied to this order.');
    }

    return order.toJSON();
  },

  /**
   * Fetch orders for a user
   */
  async getUserOrders(userId) {
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return orders.map((o) => o.toJSON());
  },

  /**
   * Helper to evaluate 24-hour order cancellation eligibility
   */
  canCancelOrder(order, now = Date.now()) {
    if (!order) return { allowed: false, reason: 'Order not found' };
    if (order.status === 'Cancelled') {
      return { allowed: false, reason: 'Order is already cancelled' };
    }
    if (order.status === 'Delivered') {
      return { allowed: false, reason: 'Delivered orders cannot be cancelled' };
    }
    if (order.status === 'Shipped') {
      return { allowed: false, reason: 'Order has already shipped and cannot be cancelled directly' };
    }

    const orderTime = new Date(order.createdAt).getTime();
    const msElapsed = now - orderTime;
    const hoursElapsed = msElapsed / (1000 * 60 * 60);

    if (hoursElapsed > 24) {
      return {
        allowed: false,
        reason: 'Order can only be cancelled within 24 hours of placement',
        hoursElapsed
      };
    }

    return {
      allowed: true,
      hoursRemaining: Math.max(0, 24 - hoursElapsed)
    };
  },

  /**
   * Cancel an order within 24 hours of placement
   */
  async cancelOrder(orderId, { userId = null, isAdmin = false, guestEmail = null, reason = '' } = {}) {
    const query = {
      $or: [{ id: orderId }]
    };

    if (mongoose.Types.ObjectId.isValid(orderId)) {
      query.$or.push({ _id: orderId });
    }

    const order = await Order.findOne(query);
    if (!order) {
      throw new Error(`Order #${orderId} was not found.`);
    }

    // Permission checks
    if (!isAdmin) {
      if (order.user) {
        if (!userId || order.user.toString() !== userId.toString()) {
          throw new Error('Access denied to cancel this order.');
        }
      } else {
        // Guest order: check if email matches
        if (guestEmail && order.customer?.email?.toLowerCase() !== guestEmail.toLowerCase()) {
          throw new Error('Access denied: Email does not match this guest order.');
        }
      }
    }

    // 24-Hour window verification
    const eligibility = this.canCancelOrder(order);
    if (!isAdmin && !eligibility.allowed) {
      throw new Error(eligibility.reason);
    }

    // Restock product quantities
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const productLookupId = item.product?.id || item.productId || item.id;
        if (productLookupId) {
          const pQuery = { $or: [{ id: productLookupId }] };
          if (mongoose.Types.ObjectId.isValid(productLookupId)) {
            pQuery.$or.push({ _id: productLookupId });
          }
          await Product.updateOne(pQuery, {
            $inc: { stockCount: item.quantity },
            inStock: true
          });
        }
      }
    }

    // Update order status
    order.status = 'Cancelled';
    order.cancellationReason = reason?.trim() || 'Cancelled by customer within 24-hour window';
    order.cancelledAt = new Date();
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }

    await order.save();
    return order.toJSON();
  }
};
