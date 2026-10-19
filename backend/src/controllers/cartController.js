import { cartService } from '../services/cartService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const cartController = {
  /**
   * GET /api/cart
   */
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getCart(req.user._id);
      return sendSuccess(res, cart, 'Cart retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/cart/items
   */
  async addToCart(req, res, next) {
    try {
      const { productId, quantity, variant } = req.body;
      if (!productId) {
        return sendError(res, 'Product ID is required.', 400);
      }

      const cart = await cartService.addItem(req.user._id, {
        productId,
        quantity,
        variant
      });
      return sendSuccess(res, cart, 'Item added to cart');
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  /**
   * PATCH /api/cart/items/:itemId
   */
  async updateCartItem(req, res, next) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined) {
        return sendError(res, 'Quantity is required.', 400);
      }

      const cart = await cartService.updateQuantity(req.user._id, itemId, parseInt(quantity, 10));
      return sendSuccess(res, cart, 'Cart item updated');
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  /**
   * DELETE /api/cart/items/:itemId
   */
  async removeCartItem(req, res, next) {
    try {
      const { itemId } = req.params;
      const cart = await cartService.removeItem(req.user._id, itemId);
      return sendSuccess(res, cart, 'Item removed from cart');
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/cart
   */
  async clearCart(req, res, next) {
    try {
      const cart = await cartService.clearCart(req.user._id);
      return sendSuccess(res, cart, 'Cart cleared');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/cart/merge
   */
  async mergeCart(req, res, next) {
    try {
      const { items } = req.body;
      const cart = await cartService.mergeGuestCart(req.user._id, items);
      return sendSuccess(res, cart, 'Cart merged successfully');
    } catch (err) {
      next(err);
    }
  }
};
