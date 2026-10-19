import { productService } from '../services/productService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const productController = {
  /**
   * GET /api/products
   */
  async getProducts(req, res, next) {
    try {
      const result = await productService.queryProducts(req.query);
      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/products/featured
   */
  async getFeaturedProducts(req, res, next) {
    try {
      const limit = req.query.limit || 4;
      const featured = await productService.getFeatured(limit);
      return sendSuccess(res, featured, 'Featured products retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/products/trending
   */
  async getTrendingProducts(req, res, next) {
    try {
      const limit = req.query.limit || 4;
      const trending = await productService.getTrending(limit);
      return sendSuccess(res, trending, 'Trending products retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/products/related
   */
  async getRelatedProducts(req, res, next) {
    try {
      const { category, currentId, limit = 4 } = req.query;
      const related = await productService.getRelated(category, currentId, limit);
      return sendSuccess(res, related, 'Related products retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/products/:id
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.findProductById(id);
      if (!product) {
        return sendError(res, `Product with ID "${id}" was not found.`, 404);
      }
      return sendSuccess(res, product, 'Product details retrieved');
    } catch (err) {
      next(err);
    }
  }
};
