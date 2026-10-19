import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import RatingStars from '../components/common/RatingStars.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    const defaultVariant = product.variants?.options?.[0] || null;
    addToCart(product, 1, defaultVariant);
    removeFromWishlist(product.id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs items={[{ label: 'Wishlist' }]} />
          <div className="py-12">
            <EmptyState
              icon={Heart}
              title="Your Wishlist is Empty"
              description="Save items you love by tapping the heart icon on any product card or detail page."
              actionLabel="Explore Collections"
              actionTo="/shop"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={[{ label: 'Wishlist' }]} />

        <div className="flex items-center justify-between py-4 border-b border-slate-200 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              My Wishlist ({wishlist.length})
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your saved favorites available for purchase anytime
            </p>
          </div>
          <button
            type="button"
            onClick={clearWishlist}
            className="text-xs text-slate-500 hover:text-rose-600 transition-colors"
          >
            Clear Wishlist
          </button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-all duration-200"
            >
              <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                <Link to={`/product/${product.id}`} className="block w-full h-full">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => removeFromWishlist(product.id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-slate-400 hover:text-rose-600 hover:bg-white shadow-xs transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col flex-1 p-4">
                <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider mb-1">
                  {product.category}
                </span>

                <Link
                  to={`/product/${product.id}`}
                  className="text-sm font-semibold text-slate-900 hover:text-teal-700 transition-colors line-clamp-1 mb-1.5"
                >
                  {product.name}
                </Link>

                <div className="mb-3">
                  <RatingStars rating={product.rating} count={product.reviewCount} size="xs" />
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-base font-bold text-slate-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(product)}
                    disabled={!product.inStock}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
