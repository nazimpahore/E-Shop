import mongoose from 'mongoose';
import { Product } from './Product.js';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    productId: {
      type: String,
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5
    },
    reviewText: {
      type: String,
      required: [true, 'Please write your review feedback'],
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Prevent duplicate review from same user on same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static helper to recalculate product rating and review count
reviewSchema.statics.calculateAverageRating = async function (productIdOrObjId) {
  const stats = await this.aggregate([
    {
      $match: {
        $or: [
          { productId: String(productIdOrObjId) },
          { product: mongoose.Types.ObjectId.isValid(productIdOrObjId) ? new mongoose.Types.ObjectId(productIdOrObjId) : null }
        ]
      }
    },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.updateOne(
      {
        $or: [
          { id: String(productIdOrObjId) },
          { _id: mongoose.Types.ObjectId.isValid(productIdOrObjId) ? productIdOrObjId : null }
        ]
      },
      {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].reviewCount
      }
    );
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.product);
  }
});

export const Review = mongoose.model('Review', reviewSchema);
