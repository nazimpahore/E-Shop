import mongoose from 'mongoose';
import { Product } from '../models/Product.js';

export const productService = {
  /**
   * Query products with search, category, price, rating, stock filters, sorting and pagination
   */
  async queryProducts(params = {}) {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      minRating,
      inStockOnly,
      sortBy = 'featured',
      page = 1,
      limit = 12
    } = params;

    const query = { isActive: true };

    // Search filter across name, category, and shortDescription
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    // Category filter (slug or display name)
    if (category && category !== 'all') {
      const cat = category.toLowerCase().trim();
      query.$or = query.$or || [];
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { categorySlug: cat },
          { category: { $regex: `^${cat}$`, $options: 'i' } }
        ]
      });
    }

    // Price range filters
    if (minPrice !== undefined && minPrice !== '') {
      query.price = query.price || {};
      query.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      query.price = query.price || {};
      query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating !== undefined && minRating !== '') {
      query.rating = { $gte: Number(minRating) };
    }

    // In-stock filter
    if (inStockOnly === true || inStockOnly === 'true') {
      query.inStock = true;
      query.stockCount = { $gt: 0 };
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'price-asc':
        sort = { price: 1 };
        break;
      case 'price-desc':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { rating: -1, reviewCount: -1 };
        break;
      case 'newest':
        sort = { isNew: -1, createdAt: -1 };
        break;
      case 'featured':
      default:
        sort = { isFeatured: -1, rating: -1, createdAt: -1 };
        break;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort(sort).skip(skip).limit(limitNum)
    ]);

    return {
      data: products.map((p) => p.toJSON()),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    };
  },

  /**
   * Find product by string identifier (`id`) or MongoDB `_id`
   */
  async findProductById(identifier) {
    if (!identifier) return null;

    const query = {
      $or: [{ id: identifier }]
    };

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query.$or.push({ _id: identifier });
    }

    const product = await Product.findOne(query);
    return product ? product.toJSON() : null;
  },

  /**
   * Featured products for homepage
   */
  async getFeatured(limit = 4) {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .sort({ rating: -1, createdAt: -1 })
      .limit(parseInt(limit, 10) || 4);
    return products.map((p) => p.toJSON());
  },

  /**
   * Trending / New Arrival products
   */
  async getTrending(limit = 4) {
    const products = await Product.find({
      $or: [{ isTrending: true }, { isNew: true }],
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10) || 4);
    return products.map((p) => p.toJSON());
  },

  /**
   * Related products by category
   */
  async getRelated(category, currentId, limit = 4) {
    const numLimit = parseInt(limit, 10) || 4;

    const query = {
      category,
      id: { $ne: currentId },
      isActive: true
    };
    if (mongoose.Types.ObjectId.isValid(currentId)) {
      query._id = { $ne: currentId };
    }

    let related = await Product.find(query).limit(numLimit);

    // If fewer than limit, fill with popular items from other categories
    if (related.length < numLimit) {
      const excludedIds = [currentId, ...related.map((r) => r.id)];
      const others = await Product.find({
        id: { $nin: excludedIds },
        isActive: true
      })
        .sort({ rating: -1 })
        .limit(numLimit - related.length);

      related = [...related, ...others];
    }

    return related.map((p) => p.toJSON());
  }
};
