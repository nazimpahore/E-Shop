import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronRight,
  Minus,
  Plus,
  AlertCircle
} from 'lucide-react';
import RatingStars from '../components/common/RatingStars.jsx';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';
import ProductGrid from '../components/common/ProductGrid.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { apiService } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // 'description', 'specifications', 'shipping', 'reviews'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiService.getProductById(id);
        const p = res.data;
        setProduct(p);
        setSelectedImage(p.images[0]);
        // Set default variant if available
        if (p.variants?.options?.length > 0) {
          const firstInStock = p.variants.options.find(o => o.inStock) || p.variants.options[0];
          setSelectedVariant(firstInStock);
        } else {
          setSelectedVariant(null);
        }
        setQuantity(1);

        // Load related
        const relRes = await apiService.getRelatedProducts(p.category, p.id, 4);
        setRelatedProducts(relRes.data);
      } catch (err) {
        setError(err.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
      window.scrollTo(0, 0);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
          <div className="aspect-square bg-slate-100 rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 bg-slate-100 rounded w-1/4" />
            <div className="h-8 bg-slate-100 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-1/3" />
            <div className="h-6 bg-slate-100 rounded w-1/4" />
            <div className="h-24 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={AlertCircle}
          title="Product Not Found"
          description={`We couldn't locate the requested product with ID "${id}". It may have been removed or the URL is incorrect.`}
          actionLabel="Return to Catalog"
          actionTo="/shop"
        />
      </div>
    );
  }

  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Shop', to: '/shop' },
            { label: product.category, to: `/shop?category=${product.categorySlug}` },
            { label: product.name }
          ]}
        />

        {/* Product Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-4 pb-12 border-b border-slate-200">
          
          {/* Gallery Area */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[500px] shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? 'border-slate-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-400 opacity-80'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumb ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1 aspect-square bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.discount && (
                <span className="absolute top-4 left-4 px-2.5 py-1 bg-rose-600 text-white text-xs font-semibold rounded">
                  {product.discount}
                </span>
              )}
            </div>
          </div>

          {/* Product Details & Purchase Form */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            {/* Category */}
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
              {product.category}
            </span>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug mb-3">
              {product.name}
            </h1>

            {/* Ratings & Stock */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
              <RatingStars rating={product.rating} count={product.reviewCount} size="sm" />
              <span className="text-slate-300">•</span>
              <span className={`text-xs font-medium flex items-center gap-1 ${
                product.inStock ? 'text-teal-700' : 'text-rose-600'
              }`}>
                {product.inStock ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>In Stock ({product.stockCount} units available)</span>
                  </>
                ) : (
                  'Out of Stock'
                )}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-bold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-base text-slate-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {product.shortDescription}
            </p>

            {/* Variant Selector */}
            {product.variants?.options?.length > 0 && (
              <div className="mb-6 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">
                    Select {product.variants.label}:
                  </span>
                  <span className="text-slate-500 font-medium">
                    {selectedVariant?.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {product.variants.options.map((option) => {
                    const isSelected = selectedVariant?.name === option.name;
                    const isColor = !!option.hex;

                    return (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => setSelectedVariant(option)}
                        disabled={!option.inStock}
                        className={`group relative flex items-center justify-center transition-all ${
                          isColor
                            ? `w-8 h-8 rounded-full border-2 ${
                                isSelected ? 'border-slate-900 ring-2 ring-slate-400 ring-offset-1' : 'border-slate-300 hover:border-slate-400'
                              }`
                            : `px-3.5 py-1.5 rounded-lg border text-xs font-semibold ${
                                isSelected
                                  ? 'border-slate-900 bg-slate-900 text-white'
                                  : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                              }`
                        } ${!option.inStock ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                        title={option.name}
                      >
                        {isColor ? (
                          <span
                            className="w-full h-full rounded-full"
                            style={{ backgroundColor: option.hex }}
                          />
                        ) : (
                          option.name
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3.5 mb-8">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-900">Quantity:</span>
                <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stockCount || 10, q + 1))}
                    disabled={quantity >= (product.stockCount || 10)}
                    className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Primary Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full py-3 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="w-full py-3 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Wishlist Toggle Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`w-full py-2.5 px-4 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isFavorite
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isFavorite ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            {/* Assurance Perks List */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Free express shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-teal-700 shrink-0" />
                <span>30-day money-back guarantee & hassle-free returns</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>2-year official manufacturer warranty coverage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Product Details */}
        <div className="py-12 border-b border-slate-200">
          <div className="flex items-center space-x-8 border-b border-slate-200 mb-6 text-sm font-semibold">
            {[
              { id: 'description', label: 'Description' },
              { id: 'specifications', label: 'Specifications' },
              { id: 'shipping', label: 'Shipping & Returns' },
              { id: 'reviews', label: `Reviews (${product.reviewCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-slate-900 border-b-2 border-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-w-3xl text-sm text-slate-600 leading-relaxed">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p>{product.description}</p>
                <p>
                  Every piece in our catalog is engineered to withstand daily wear while presenting an uncompromising aesthetic. Sourced transparently and certified under strict international manufacturing ethics.
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-100">
                    {product.specifications ? (
                      Object.entries(product.specifications).map(([key, val]) => (
                        <tr key={key} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-900 w-1/3 bg-slate-50/50">
                            {key}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {val}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-4 text-slate-500">Standard manufacturer specifications apply.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-3 text-xs sm:text-sm">
                <h4 className="font-semibold text-slate-900">Delivery Information</h4>
                <p>Orders are dispatched from our centralized fulfillment hub within 24 hours of placement on weekdays. Standard delivery takes 2 to 4 business days within the continental United States.</p>
                <h4 className="font-semibold text-slate-900 pt-2">Return Policy</h4>
                <p>If you are not completely satisfied with your item, you may return it within 30 days of arrival in its original unworn condition with factory packaging for a full refund or exchange.</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-3xl font-bold text-slate-900">{product.rating.toFixed(1)}</div>
                  <div>
                    <RatingStars rating={product.rating} showNumber={false} size="sm" />
                    <p className="text-xs text-slate-500 mt-1">Based on {product.reviewCount} verified purchases</p>
                  </div>
                </div>

                {/* Sample reviews */}
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-900">David S.</span>
                      <span className="text-[11px] text-slate-400">Verified Buyer • 2 weeks ago</span>
                    </div>
                    <RatingStars rating={5} showNumber={false} size="xs" />
                    <p className="text-xs text-slate-600 mt-1.5">
                      Exceeded expectations in both tactile feel and functionality. Fast delivery and premium unboxing experience.
                    </p>
                  </div>
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-900">Elena M.</span>
                      <span className="text-[11px] text-slate-400">Verified Buyer • 1 month ago</span>
                    </div>
                    <RatingStars rating={5} showNumber={false} size="xs" />
                    <p className="text-xs text-slate-600 mt-1.5">
                      The attention to detail is noticeable right away. Exactly as depicted in the photos.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="py-12">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6">
              You Might Also Like
            </h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </div>
  );
}
