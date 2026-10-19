import { orderService } from '../services/orderService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const orderController = {
  /**
   * POST /api/orders
   * Create new order with inventory check and snapshotting
   */
  async createOrder(req, res, next) {
    try {
      const {
        customer,
        shippingAddress,
        shippingMethod,
        paymentMethod,
        items,
        promoCode
      } = req.body;

      const userId = req.user ? req.user._id : null;

      const order = await orderService.createOrder({
        userId,
        customer,
        shippingAddress,
        shippingMethod,
        paymentMethod,
        items,
        promoCode
      });

      return sendSuccess(res, order, 'Order created successfully', 201);
    } catch (err) {
      return sendError(res, err.message, 400);
    }
  },

  /**
   * GET /api/orders/my-orders
   */
  async getMyOrders(req, res, next) {
    try {
      const orders = await orderService.getUserOrders(req.user._id);
      return sendSuccess(res, orders, 'User orders retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/orders/:id
   */
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user._id : null;
      const isAdmin = req.user?.role === 'admin';

      const order = await orderService.findOrderById(id, userId, isAdmin);
      if (!order) {
        return sendError(res, `Order #${id} was not found.`, 404);
      }

      return sendSuccess(res, order, 'Order retrieved successfully');
    } catch (err) {
      if (err.message.includes('Access denied')) {
        return sendError(res, err.message, 403);
      }
      next(err);
    }
  }
};
