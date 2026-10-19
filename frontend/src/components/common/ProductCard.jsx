import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import RatingStars from './RatingStars.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [imgSrc, setImgSrc] = useState(product?.images?.[0] || '');
  const [hasError, setHasError] = useState(false);

  if (!product) return null;

  const isFavorite = isInWishlist(product.id);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      // Fallback clean placeholder
      setImgSrc('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = product.variants?.options?.[0] || null;
    addToCart(product, 1, defaultVariant);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all duration-200">
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={imgSrc}
            alt={product.name}
            onError={handleImageError}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {product.discount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-600 text-white tracking-wide">
              {product.discount}
            </span>
          )}
          {product.isNew && !product.discount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-700 text-white tracking-wide">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-sm transition-colors duration-200 z-10 ${
            isFavorite
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              : 'bg-white/90 text-slate-500 hover:text-slate-900 hover:bg-white shadow-xs'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Quick View Link overlay on hover */}
        <div className="absolute inset-x-2.5 bottom-2.5 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <Link
            to={`/product/${product.id}`}
            className="w-full py-2 bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 backdrop-blur-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {/* Category tag */}
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1">
          {product.category}
        </span>

        {/* Name */}
        <Link
          to={`/product/${product.id}`}
          className="text-sm font-semibold text-slate-900 hover:text-teal-700 transition-colors line-clamp-1 mb-1.5"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="mb-2">
          <RatingStars rating={product.rating} count={product.reviewCount} size="xs" />
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-bold text-slate-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              product.inStock
                ? 'bg-slate-900 hover:bg-teal-800 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title={product.inStock ? 'Add to Cart' : 'Out of Stock'}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
