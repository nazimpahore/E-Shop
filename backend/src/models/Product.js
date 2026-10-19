import mongoose from 'mongoose';

const variantOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, default: '', trim: true },
    inStock: { type: Boolean, default: true }
  },
  { _id: false }
);

const productVariantsSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'color', trim: true },
    label: { type: String, default: 'Option', trim: true },
    options: { type: [variantOptionSchema], default: [] }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      index: true
    },
    categorySlug: {
      type: String,
      required: [true, 'Category slug is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
      index: true
    },
    originalPrice: {
      type: Number,
      default: null
    },
    discount: {
      type: String,
      default: null,
      trim: true
    },
    rating: {
      type: Number,
      default: 5.0,
      min: [1.0, 'Rating cannot be less than 1.0'],
      max: [5.0, 'Rating cannot exceed 5.0'],
      index: true
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true
    },
    stockCount: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 10,
      min: [0, 'Stock cannot be negative']
    },
    sku: {
      type: String,
      trim: true,
      default: ''
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true
    },
    isNew: {
      type: Boolean,
      default: false,
      index: true
    },
    images: {
      type: [String],
      default: []
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    variants: {
      type: productVariantsSchema,
      default: () => ({ type: 'color', label: 'Color', options: [] })
    },
    specifications: {
      type: Map,
      of: String,
      default: {}
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.id || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        // Convert Map to plain object if specifications is a Map
        if (ret.specifications instanceof Map) {
          ret.specifications = Object.fromEntries(ret.specifications);
        }
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.id || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Search Index
productSchema.index({
  name: 'text',
  category: 'text',
  shortDescription: 'text',
  description: 'text'
});

// Pre-save synchronization
productSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `prod-${this._id.toString()}`;
  }
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  if (!this.categorySlug && this.category) {
    this.categorySlug = this.category
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  // Synchronize inStock with stockCount
  this.inStock = this.stockCount > 0;
  next();
});

export const Product = mongoose.model('Product', productSchema);
