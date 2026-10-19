import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const reviewController = {
  /**
   * Helper to locate product
   */
  async findProduct(identifier) {
    const query = { $or: [{ id: identifier }] };
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query.$or.push({ _id: identifier });
    }
    return Product.findOne(query);
  },

  /**
   * GET /api/products/:productId/reviews
   */
  async getProductReviews(req, res, next) {
    try {
      const { productId } = req.params;
      const product = await reviewController.findProduct(productId);
      if (!product) {
        return sendError(res, 'Product not found.', 404);
      }

      const reviews = await Review.find({
        $or: [{ product: product._id }, { productId: product.id }]
      }).sort({ createdAt: -1 });

      return sendSuccess(res, reviews.map((r) => r.toJSON()), 'Reviews retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/products/:productId/reviews
   */
  async createReview(req, res, next) {
    try {
      const { productId } = req.params;
      const { rating, reviewText } = req.body;
      const user = req.user;

      if (!rating || rating < 1 || rating > 5) {
        return sendError(res, 'Rating must be between 1 and 5.', 400);
      }
      if (!reviewText || !reviewText.trim()) {
        return sendError(res, 'Review feedback cannot be empty.', 400);
      }

      const product = await reviewController.findProduct(productId);
      if (!product) {
        return sendError(res, 'Product not found.', 404);
      }

      // Check if user already reviewed this product
      const existing = await Review.findOne({
        product: product._id,
        user: user._id
      });
      if (existing) {
        return sendError(res, 'You have already reviewed this product.', 400);
      }

      // Check if verified purchaser
      const hasPurchased = await Order.findOne({
        user: user._id,
        'items.product.id': product.id
      });

      const review = await Review.create({
        product: product._id,
        productId: product.id,
        user: user._id,
        userName: user.name,
        rating: Number(rating),
        reviewText: reviewText.trim(),
        isVerifiedPurchase: !!hasPurchased
      });

      return sendSuccess(res, review.toJSON(), 'Review submitted successfully', 201);
    } catch (err) {
      next(err);
    }
  }
};
