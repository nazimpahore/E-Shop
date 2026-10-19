import mongoose from 'mongoose';
import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const wishlistController = {
  /**
   * Helper to find Product by string id or ObjectId
   */
  async findProduct(identifier) {
    const query = { $or: [{ id: identifier }] };
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query.$or.push({ _id: identifier });
    }
    return Product.findOne(query);
  },

  /**
   * GET /api/wishlist
   */
  async getWishlist(req, res, next) {
    try {
      let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
      if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user._id, products: [] });
      }

      const activeProducts = wishlist.products
        .filter((p) => p && p.isActive)
        .map((p) => p.toJSON());

      return sendSuccess(res, activeProducts, 'Wishlist retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/wishlist/items
   */
  async addToWishlist(req, res, next) {
    try {
      const { productId } = req.body;
      if (!productId) {
        return sendError(res, 'Product ID is required.', 400);
      }

      const product = await wishlistController.findProduct(productId);
      if (!product) {
        return sendError(res, 'Product not found.', 404);
      }

      let wishlist = await Wishlist.findOne({ user: req.user._id });
      if (!wishlist) {
        wishlist = new Wishlist({ user: req.user._id, products: [] });
      }

      if (!wishlist.products.some((p) => p.toString() === product._id.toString())) {
        wishlist.products.push(product._id);
        await wishlist.save();
      }

      await wishlist.populate('products');
      const activeProducts = wishlist.products.map((p) => p.toJSON());

      return sendSuccess(res, activeProducts, 'Added to wishlist');
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/wishlist/items/:productId
   */
  async removeFromWishlist(req, res, next) {
    try {
      const { productId } = req.params;
      const product = await wishlistController.findProduct(productId);

      let wishlist = await Wishlist.findOne({ user: req.user._id });
      if (!wishlist) {
        return sendSuccess(res, [], 'Removed from wishlist');
      }

      if (product) {
        wishlist.products = wishlist.products.filter(
          (p) => p.toString() !== product._id.toString()
        );
      } else {
        wishlist.products = wishlist.products.filter(
          (p) => p.toString() !== productId
        );
      }

      await wishlist.save();
      await wishlist.populate('products');
      const activeProducts = wishlist.products.map((p) => p.toJSON());

      return sendSuccess(res, activeProducts, 'Removed from wishlist');
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/wishlist
   */
  async clearWishlist(req, res, next) {
    try {
      await Wishlist.findOneAndUpdate(
        { user: req.user._id },
        { products: [] },
        { upsert: true }
      );
      return sendSuccess(res, [], 'Wishlist cleared');
    } catch (err) {
      next(err);
    }
  }
};
