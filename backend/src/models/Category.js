import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      trim: true,
      sparse: true
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    image: {
      type: String,
      default: ''
    },
    itemCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.id || (ret._id ? ret._id.toString() : '');
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.id || (ret._id ? ret._id.toString() : '');
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Ensure `id` is populated from `slug` or `_id` if missing
categorySchema.pre('save', function (next) {
  if (!this.id) {
    this.id = this.slug || this._id.toString();
  }
  next();
});

export const Category = mongoose.model('Category', categorySchema);
