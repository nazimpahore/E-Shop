import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const adminController = {
  /**
   * GET /api/admin/stats
   * Dashboard statistics
   */
  async getDashboardStats(req, res, next) {
    try {
      const [productCount, userCount, orderCount, revenueAgg, recentOrders] = await Promise.all([
        Product.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'customer' }),
        Order.countDocuments(),
        Order.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, totalRevenue: { $sum: '$pricing.total' } } }
        ]),
        Order.find().sort({ createdAt: -1 }).limit(5)
      ]);

      const totalRevenue = revenueAgg.length > 0 ? Math.round(revenueAgg[0].totalRevenue * 100) / 100 : 0;

      return sendSuccess(res, {
        totalProducts: productCount,
        totalCustomers: userCount,
        totalOrders: orderCount,
        totalRevenue,
        recentOrders: recentOrders.map((o) => o.toJSON())
      }, 'Admin dashboard statistics retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/admin/products
   */
  async createProduct(req, res, next) {
    try {
      const productData = req.body;
      if (!productData.id) {
        productData.id = `prod-${Date.now()}`;
      }
      const product = await Product.create(productData);
      return sendSuccess(res, product.toJSON(), 'Product created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/admin/products/:id
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const query = { $or: [{ id }] };
      if (mongoose.Types.ObjectId.isValid(id)) {
        query.$or.push({ _id: id });
      }

      const product = await Product.findOneAndUpdate(query, req.body, {
        new: true,
        runValidators: true
      });

      if (!product) {
        return sendError(res, 'Product not found', 404);
      }

      return sendSuccess(res, product.toJSON(), 'Product updated successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/admin/products/:id (soft deactivate)
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const query = { $or: [{ id }] };
      if (mongoose.Types.ObjectId.isValid(id)) {
        query.$or.push({ _id: id });
      }

      const product = await Product.findOneAndUpdate(query, { isActive: false }, { new: true });
      if (!product) {
        return sendError(res, 'Product not found', 404);
      }

      return sendSuccess(res, null, 'Product deactivated successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/admin/products/:id/stock
   */
  async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const { stockCount } = req.body;

      if (stockCount === undefined || stockCount < 0) {
        return sendError(res, 'Valid non-negative stock count is required', 400);
      }

      const query = { $or: [{ id }] };
      if (mongoose.Types.ObjectId.isValid(id)) {
        query.$or.push({ _id: id });
      }

      const product = await Product.findOneAndUpdate(
        query,
        { stockCount: Number(stockCount), inStock: Number(stockCount) > 0 },
        { new: true }
      );

      if (!product) {
        return sendError(res, 'Product not found', 404);
      }

      return sendSuccess(res, product.toJSON(), 'Stock updated successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/admin/orders
   */
  async getAllOrders(req, res, next) {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const query = {};
      if (status) query.status = status;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const skip = (pageNum - 1) * limitNum;

      const [total, orders] = await Promise.all([
        Order.countDocuments(query),
        Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum)
      ]);

      return sendSuccess(res, {
        orders: orders.map((o) => o.toJSON()),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }, 'Admin orders retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/admin/orders/:id/status
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, paymentStatus, trackingNumber } = req.body;

      const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
      if (status && !allowedStatuses.includes(status)) {
        return sendError(res, `Invalid status. Allowed: ${allowedStatuses.join(', ')}`, 400);
      }

      const query = { $or: [{ id }] };
      if (mongoose.Types.ObjectId.isValid(id)) {
        query.$or.push({ _id: id });
      }

      const updates = {};
      if (status) updates.status = status;
      if (paymentStatus) updates.paymentStatus = paymentStatus;
      if (trackingNumber) updates.trackingNumber = trackingNumber;

      const order = await Order.findOneAndUpdate(query, updates, { new: true });
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      return sendSuccess(res, order.toJSON(), 'Order status updated successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/admin/users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
      return sendSuccess(res, users.map((u) => u.toJSON()), 'Customer accounts retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/admin/categories
   */
  async createCategory(req, res, next) {
    try {
      const { name, slug, description, image } = req.body;
      const catSlug = slug || name.toLowerCase().replace(/[\s_]+/g, '-');

      const category = await Category.create({
        id: catSlug,
        name,
        slug: catSlug,
        description: description || '',
        image: image || ''
      });

      return sendSuccess(res, category.toJSON(), 'Category created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
};
