import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  X
} from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    totalItems,
    subtotal,
    discountAmount,
    shippingFee,
    estimatedTax,
    orderTotal,
    appliedPromo,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyPromoCode,
    removePromoCode
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setCouponError('');
    const success = applyPromoCode(couponCode);
    if (success) {
      setCouponCode('');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs items={[{ label: 'Cart' }]} />
          <div className="py-12">
            <EmptyState
              icon={ShoppingBag}
              title="Your Shopping Cart is Empty"
              description="Looks like you haven't added anything to your cart yet. Explore our curated catalog of everyday essentials."
              actionLabel="Start Shopping"
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
        <Breadcrumbs items={[{ label: 'Cart' }]} />

        <div className="flex items-center justify-between py-4 border-b border-slate-200 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h1>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-slate-500 hover:text-rose-600 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        {/* 2-Column Cart Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden bg-white">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  {/* Left: Image & Info */}
                  <div className="flex items-center gap-4">
                    <Link
                      to={`/product/${item.product.id}`}
                      className="w-20 h-20 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 shrink-0"
                    >
                      <img
                        src={item.product.images?.[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">
                        {item.product.category}
                      </span>
                      <Link
                        to={`/product/${item.product.id}`}
                        className="block text-sm font-semibold text-slate-900 hover:text-teal-700 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-slate-500">
                          {item.product.variants?.label || 'Option'}: <span className="font-medium text-slate-700">{item.variant.name}</span>
                        </p>
                      )}
                      <p className="text-xs font-semibold text-slate-900 sm:hidden">
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Right: Quantity & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <span className="hidden sm:block text-sm font-semibold text-slate-900">
                      ${item.product.price.toFixed(2)}
                    </span>

                    {/* Quantity Selector */}
                    <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-slate-600 hover:text-slate-900"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-slate-600 hover:text-slate-900"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <span className="text-sm font-bold text-slate-900 w-20 text-right">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/shop"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-4 bg-slate-50/70 border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
              Order Summary
            </h2>

            {/* Promo Code Input */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Promotional Code
              </label>
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-teal-700" />
                    <div>
                      <span className="font-bold text-teal-900">{appliedPromo.code}</span>
                      <p className="text-[11px] text-teal-700">{appliedPromo.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removePromoCode}
                    className="p-1 text-teal-700 hover:text-teal-900"
                    aria-label="Remove coupon"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs uppercase font-medium focus:outline-none focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                  >
                    Apply
                  </button>
                </form>
              )}
              <p className="text-[11px] text-slate-500 mt-1.5">
                Try promo code <span className="font-mono text-slate-700 font-semibold">WELCOME10</span>
              </p>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-200 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-teal-700 font-medium">
                  <span>Discount ({appliedPromo?.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="font-semibold text-teal-700 uppercase text-[11px]">Free</span>
                  ) : (
                    `$${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-[11px] text-slate-500 italic">
                  Add ${(50 - subtotal).toFixed(2)} more for free express shipping!
                </p>
              )}

              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-slate-900">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 pt-3 border-t border-slate-200">
                <span>Order Total</span>
                <span className="text-base">${orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust note */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Guaranteed safe and encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
