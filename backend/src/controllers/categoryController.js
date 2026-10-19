import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const categoryController = {
  /**
   * GET /api/categories
   * Returns categories with accurate product item counts
   */
  async getCategories(req, res, next) {
    try {
      const categories = await Category.find({ isActive: true });

      // Aggregate item counts per category
      const counts = await Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$categorySlug', count: { $sum: 1 } } }
      ]);
      const countMap = counts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      const formatted = categories.map((c) => {
        const catObj = c.toJSON();
        catObj.itemCount = countMap[c.slug] !== undefined ? countMap[c.slug] : catObj.itemCount || 0;
        return catObj;
      });

      return sendSuccess(res, formatted, 'Categories retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/categories/:slug
   */
  async getCategoryBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const category = await Category.findOne({ slug, isActive: true });
      if (!category) {
        return sendError(res, 'Category not found', 404);
      }
      return sendSuccess(res, category.toJSON(), 'Category retrieved');
    } catch (err) {
      next(err);
    }
  }
};
