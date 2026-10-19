import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

export const cartService = {
  /**
   * Helper to locate product by ID or _id
   */
  async findProduct(identifier) {
    const query = { $or: [{ id: identifier }] };
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query.$or.push({ _id: identifier });
    }
    return Product.findOne(query);
  },

  /**
   * Get user's cart populated with live product details
   */
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Format items matching frontend expectation
    const formattedItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      if (item.product && item.product.isActive) {
        const prod = item.product.toJSON();
        formattedItems.push({
          id: item.id,
          product: prod,
          variant: item.variant,
          quantity: item.quantity,
          addedAt: item.addedAt
        });
        subtotal += prod.price * item.quantity;
      }
    }

    subtotal = Math.round(subtotal * 100) / 100;
    const totalItems = formattedItems.reduce((acc, i) => acc + i.quantity, 0);

    return {
      items: formattedItems,
      totalItems,
      subtotal
    };
  },

  /**
   * Add item to cart
   */
  async addItem(userId, { productId, quantity = 1, variant = null }) {
    const product = await this.findProduct(productId);
    if (!product || !product.isActive) {
      throw new Error('Product not found or inactive.');
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    if (product.stockCount < qty) {
      throw new Error(`Only ${product.stockCount} units available in stock.`);
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const cartItemId = `${product.id}-${variant?.name || 'standard'}`;
    const existingIndex = cart.items.findIndex((item) => item.id === cartItemId);

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + qty;
      if (product.stockCount < newQty) {
        throw new Error(`Cannot add more than ${product.stockCount} units of this item.`);
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({
        id: cartItemId,
        product: product._id,
        productId: product.id,
        variant,
        quantity: qty,
        addedAt: new Date()
      });
    }

    await cart.save();
    return this.getCart(userId);
  },

  /**
   * Update quantity of an item in cart
   */
  async updateQuantity(userId, cartItemId, newQty) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error('Cart not found.');
    }

    if (newQty <= 0) {
      return this.removeItem(userId, cartItemId);
    }

    const itemIndex = cart.items.findIndex((item) => item.id === cartItemId);
    if (itemIndex === -1) {
      throw new Error('Item not found in cart.');
    }

    const product = await Product.findById(cart.items[itemIndex].product);
    if (product && product.stockCount < newQty) {
      throw new Error(`Cannot set quantity to ${newQty}. Only ${product.stockCount} in stock.`);
    }

    cart.items[itemIndex].quantity = newQty;
    await cart.save();
    return this.getCart(userId);
  },

  /**
   * Remove item from cart
   */
  async removeItem(userId, cartItemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return { items: [], totalItems: 0, subtotal: 0 };

    cart.items = cart.items.filter((item) => item.id !== cartItemId);
    await cart.save();
    return this.getCart(userId);
  },

  /**
   * Clear all items in cart
   */
  async clearCart(userId) {
    await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { upsert: true });
    return { items: [], totalItems: 0, subtotal: 0 };
  },

  /**
   * Merge guest cart items into user's DB cart on login
   */
  async mergeGuestCart(userId, guestItems = []) {
    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      return this.getCart(userId);
    }

    for (const item of guestItems) {
      try {
        const prodId = item.product?.id || item.productId || item.id;
        if (prodId) {
          await this.addItem(userId, {
            productId: prodId,
            quantity: item.quantity || 1,
            variant: item.variant || null
          });
        }
      } catch (err) {
        // Continue merging other items if one has stock issues
      }
    }

    return this.getCart(userId);
  }
};
